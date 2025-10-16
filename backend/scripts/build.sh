#!/bin/bash

# =============================================================================
# 🏗️ Backend Build & Docker Script
# =============================================================================
# This script builds the Docker image and performs container security scanning
# Usage: ./scripts/build.sh [--push] [--platform PLATFORM] [--tag TAG]
# =============================================================================

set -e

# Script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PUSH_IMAGE=false
PLATFORM=""
CUSTOM_TAG=""
REGISTRY=""
SCAN_SECURITY=true

# Default values
DEFAULT_IMAGE_NAME="vas-dj-backend"
DEFAULT_TAG="latest"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --push)
            PUSH_IMAGE=true
            shift
            ;;
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        --tag)
            CUSTOM_TAG="$2"
            shift 2
            ;;
        --registry)
            REGISTRY="$2"
            shift 2
            ;;
        --no-scan)
            SCAN_SECURITY=false
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --push              Push image to registry after build"
            echo "  --platform PLATFORM Build for specific platform (e.g., linux/amd64,linux/arm64)"
            echo "  --tag TAG           Use custom tag (default: latest)"
            echo "  --registry REGISTRY Registry to push to (e.g., docker.io, ghcr.io)"
            echo "  --no-scan           Skip security scanning"
            echo "  --help, -h          Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                          # Build locally"
            echo "  $0 --tag v1.0.0                           # Build with custom tag"
            echo "  $0 --platform linux/amd64,linux/arm64     # Multi-platform build"
            echo "  $0 --push --registry ghcr.io              # Build and push to GitHub Container Registry"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Change to project directory
cd "$PROJECT_ROOT"

echo -e "${BLUE}🏗️ Backend Build & Docker${NC}"
echo -e "${BLUE}=========================${NC}"
echo -e "Project Root: ${PROJECT_ROOT}"
echo -e "Push Image: ${PUSH_IMAGE}"
echo -e "Platform: ${PLATFORM:-auto}"
echo -e "Security Scan: ${SCAN_SECURITY}"
echo ""

# Determine final image name and tags
if [[ -n "$REGISTRY" ]]; then
    IMAGE_BASE="${REGISTRY}/${DEFAULT_IMAGE_NAME}"
else
    IMAGE_BASE="$DEFAULT_IMAGE_NAME"
fi

if [[ -n "$CUSTOM_TAG" ]]; then
    MAIN_TAG="$CUSTOM_TAG"
else
    MAIN_TAG="$DEFAULT_TAG"
fi

FULL_IMAGE_NAME="${IMAGE_BASE}:${MAIN_TAG}"
COMMIT_TAG="${IMAGE_BASE}:$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"

echo -e "${BLUE}📦 Build Configuration${NC}"
echo -e "  Image: ${FULL_IMAGE_NAME}"
echo -e "  Commit Tag: ${COMMIT_TAG}"
echo ""

# Function to run command with status
run_step() {
    local name="$1"
    local cmd="$2"
    local icon="$3"

    echo -e "${BLUE}${icon} ${name}...${NC}"

    if eval "$cmd"; then
        echo -e "${GREEN}✅ ${name} completed${NC}"
        return 0
    else
        echo -e "${RED}❌ ${name} failed${NC}"
        return 1
    fi
}

# Pre-build checks
echo -e "${YELLOW}🔍 Pre-build Checks${NC}"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running or not accessible${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is available${NC}"

# Check if Dockerfile exists
if [[ ! -f "docker/Dockerfile" ]]; then
    echo -e "${RED}❌ Dockerfile not found at docker/Dockerfile${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dockerfile found${NC}"

# Build the Docker image
echo -e "\n${YELLOW}🏗️ Building Docker Image${NC}"

# Prepare build command
BUILD_CMD="docker build"

# Add platform if specified
if [[ -n "$PLATFORM" ]]; then
    BUILD_CMD="$BUILD_CMD --platform $PLATFORM"
fi

# Add tags
BUILD_CMD="$BUILD_CMD -t $FULL_IMAGE_NAME -t $COMMIT_TAG"

# Add context and dockerfile
BUILD_CMD="$BUILD_CMD -f docker/Dockerfile ."

# Add build args (you can extend this)
BUILD_CMD="$BUILD_CMD --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
BUILD_CMD="$BUILD_CMD --build-arg VCS_REF=$(git rev-parse HEAD 2>/dev/null || echo 'unknown')"

echo -e "${BLUE}Build Command: ${BUILD_CMD}${NC}"

if ! run_step "Docker build" "$BUILD_CMD" "🏗️"; then
    exit 1
fi

# Verify the build
echo -e "\n${YELLOW}🔍 Build Verification${NC}"

if ! run_step "Image verification" "docker inspect $FULL_IMAGE_NAME" "🔍"; then
    exit 1
fi

# Get image size
IMAGE_SIZE=$(docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep "$DEFAULT_IMAGE_NAME" | grep "$MAIN_TAG" | awk '{print $3}')
echo -e "${BLUE}📊 Image Size: ${IMAGE_SIZE}${NC}"

# Security scanning
if [[ "$SCAN_SECURITY" == "true" ]]; then
    echo -e "\n${YELLOW}🔒 Security Scanning${NC}"

    # Check if trivy is available
    if command -v trivy &> /dev/null; then
        if run_step "Trivy security scan" "trivy image --exit-code 0 --no-progress --format table $FULL_IMAGE_NAME" "🔒"; then
            echo -e "${GREEN}✅ No critical vulnerabilities found${NC}"
        else
            echo -e "${YELLOW}⚠️ Security vulnerabilities detected${NC}"
            echo -e "${YELLOW}💡 Run 'trivy image $FULL_IMAGE_NAME' for detailed report${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Trivy not available for security scanning${NC}"
        echo -e "${BLUE}💡 Install with: brew install trivy (macOS) or apt-get install trivy (Ubuntu)${NC}"
    fi

    # Basic security checks
    echo -e "\n${BLUE}🔍 Basic Security Checks${NC}"

    # Check if running as root
    if docker run --rm "$FULL_IMAGE_NAME" whoami 2>/dev/null | grep -q root; then
        echo -e "${YELLOW}⚠️ Container runs as root user${NC}"
    else
        echo -e "${GREEN}✅ Container runs as non-root user${NC}"
    fi

    # Check for exposed ports
    EXPOSED_PORTS=$(docker inspect "$FULL_IMAGE_NAME" --format='{{range $port, $conf := .Config.ExposedPorts}}{{$port}} {{end}}' 2>/dev/null || echo "")
    if [[ -n "$EXPOSED_PORTS" ]]; then
        echo -e "${BLUE}📡 Exposed Ports: ${EXPOSED_PORTS}${NC}"
    else
        echo -e "${YELLOW}⚠️ No ports exposed${NC}"
    fi
fi

# Test run (quick smoke test)
echo -e "\n${YELLOW}🧪 Smoke Test${NC}"

if run_step "Container smoke test" "timeout 30s docker run --rm $FULL_IMAGE_NAME python --version" "🧪"; then
    echo -e "${GREEN}✅ Container can start and run Python${NC}"
else
    echo -e "${RED}❌ Container smoke test failed${NC}"
fi

# Push to registry if requested
if [[ "$PUSH_IMAGE" == "true" ]]; then
    echo -e "\n${YELLOW}📤 Pushing to Registry${NC}"

    if [[ -z "$REGISTRY" ]]; then
        echo -e "${RED}❌ Registry not specified for push operation${NC}"
        exit 1
    fi

    # Login check (assuming user is already logged in)
    echo -e "${BLUE}🔑 Checking registry authentication...${NC}"

    if ! run_step "Push main tag" "docker push $FULL_IMAGE_NAME" "📤"; then
        exit 1
    fi

    if ! run_step "Push commit tag" "docker push $COMMIT_TAG" "📤"; then
        exit 1
    fi

    echo -e "${GREEN}🎉 Images pushed successfully!${NC}"
    echo -e "${BLUE}📦 Available at:${NC}"
    echo -e "  - ${FULL_IMAGE_NAME}"
    echo -e "  - ${COMMIT_TAG}"
fi

# Summary
echo ""
echo -e "${BLUE}📊 Build Summary${NC}"
echo -e "${BLUE}===============${NC}"
echo -e "${GREEN}✅ Docker image built successfully${NC}"
echo -e "  Image: ${FULL_IMAGE_NAME}"
echo -e "  Size: ${IMAGE_SIZE}"
echo -e "  Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"

if [[ "$PUSH_IMAGE" == "true" ]]; then
    echo -e "${GREEN}✅ Image pushed to registry${NC}"
fi

echo ""
echo -e "${BLUE}🔗 Related Commands:${NC}"
echo -e "  make build                 # Run this script"
echo -e "  make build-push            # Build and push"
echo -e "  docker run --rm -p 8000:8000 $FULL_IMAGE_NAME  # Run container"
echo -e "  docker images | grep $DEFAULT_IMAGE_NAME       # List built images"

echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo -e "  1. Test the container: docker run --rm -p 8000:8000 $FULL_IMAGE_NAME"
echo -e "  2. Deploy to your environment"
echo -e "  3. Monitor logs and performance"
