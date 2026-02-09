# API Response Code Documentation System

This system provides comprehensive validation, documentation generation, and export capabilities for the VAS-DJ SaaS API response code system.

## Overview

The API response code system follows the pattern: `VDJ-<MODULE>-<USECASE>-<HTTP>`

- **VDJ**: Project prefix (configurable)
- **MODULE**: App or module name (uppercase) 
- **USECASE**: Specific use case or action (uppercase)
- **HTTP**: HTTP status code (3 digits)

## Directory Structure

```
scripts/api-response-docs/
├── README.md                          # This file
├── run_all_validations.py            # Comprehensive validation runner
├── validators/                        # Validation scripts
│   ├── validate_response_codes.py     # Enhanced response code validation
│   ├── validate_code_uniqueness.py    # Uniqueness and conflict detection
│   └── validate_problem_types.py      # RFC 7807 problem type validation
├── generators/                        # Documentation and export generators
│   ├── generate_response_docs.py      # Comprehensive API documentation
│   ├── generate_code_registry.py      # Multi-format registry exports
│   └── generate_openapi_integration.py # OpenAPI schema enhancements
└── utils/                            # Shared utilities (future expansion)
```

## Quick Start

### Using the Main Entry Point

```bash
# Run all validations
python scripts/run_api_docs.py validate --all

# Generate all documentation 
python scripts/run_api_docs.py generate --all

# Full workflow (validate then generate)
python scripts/run_api_docs.py workflow

# List available scripts
python scripts/run_api_docs.py list
```

### Direct Script Usage

```bash
# Validation
python scripts/api-response-docs/validators/validate_response_codes.py --verbose
python scripts/api-response-docs/validators/validate_code_uniqueness.py --suggestions
python scripts/api-response-docs/validators/validate_problem_types.py --verbose

# Generation
python scripts/api-response-docs/generators/generate_response_docs.py
python scripts/api-response-docs/generators/generate_code_registry.py
python scripts/api-response-docs/generators/generate_openapi_integration.py

# Comprehensive validation
python scripts/api-response-docs/run_all_validations.py --full --verbose
```

## Script Details

### Validators

#### `validate_response_codes.py`
- Validates all response codes (success and error)
- Categorizes codes by module and type
- Analyzes distribution and detects potential conflicts
- Provides detailed breakdown by app

**Key Features:**
- Pattern validation for all codes
- Success/error code categorization
- Per-app breakdown and statistics
- Conflict detection and recommendations

#### `validate_code_uniqueness.py`
- Deep analysis of code uniqueness and conflicts
- Scans source code for code definitions
- Detects exact duplicates and similar patterns
- Suggests improvements for code organization

**Key Features:**
- Source tracking for all code definitions
- Duplicate detection with file locations
- Similar code pattern analysis
- Cross-module consistency checks
- Improvement suggestions

#### `validate_problem_types.py` 
- RFC 7807 compliance validation for problem types
- Enhanced structure and content validation
- URL format and i18n key validation
- Associated code verification

**Key Features:**
- RFC 7807 specification compliance
- Problem type URL validation
- I18n key format checking
- Code-to-problem-type mapping verification
- Coverage analysis for error codes

### Generators

#### `generate_response_docs.py`
- Comprehensive API response documentation
- Module-specific code documentation
- Problem type integration guides
- Usage examples and patterns

**Generates:**
- `_docs/api-responses/index.md` - Main documentation index
- `_docs/api-responses/{module}_codes.md` - Per-module documentation
- `_docs/api-responses/problems/{slug}.md` - Problem type pages
- `_docs/api-responses/registry.yml` - Consolidated registry

#### `generate_code_registry.py`
- Multi-format registry exports for client SDKs
- Hierarchical code organization
- Type-safe constants generation

**Generates:**
- `_exports/code-registry/registry.json` - JSON registry
- `_exports/code-registry/registry.yml` - YAML registry
- `_exports/code-registry/response_codes.py` - Python constants
- `_exports/code-registry/response-codes.ts` - TypeScript definitions
- `_exports/code-registry/openapi-fragment.yml` - OpenAPI components

#### `generate_openapi_integration.py`
- OpenAPI 3.0 schema components
- Response templates and examples
- Security scheme enhancements
- Integration documentation

**Generates:**
- `_exports/openapi-integration/components.yml` - Complete components
- `_exports/openapi-integration/schemas.yml` - Schema definitions
- `_exports/openapi-integration/responses.yml` - Response templates
- `_exports/openapi-integration/integration_example.yml` - Usage examples
- `_exports/openapi-integration/README.md` - Integration guide

### Runners

#### `run_all_validations.py`
Comprehensive validation runner with reporting:
- Executes all validation scripts in sequence
- Generates detailed reports on failures
- Supports verbose output and timing
- Optional documentation generation

**Usage:**
```bash
python scripts/api-response-docs/run_all_validations.py [OPTIONS]

Options:
  --verbose     Show verbose output from validation scripts
  --generate    Also run documentation generators after validation  
  --full        Run all validations and generators (equivalent to --generate)
  --report      Always generate a detailed report (automatic on failures)
```

## Integration with Development Workflow

### Pre-commit Validation

Add to your pre-commit hooks:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: validate-response-codes
        name: Validate API Response Codes
        entry: python scripts/run_api_docs.py validate --all
        language: system
        pass_filenames: false
```

### CI/CD Integration

```yaml
# .github/workflows/api-validation.yml
name: API Response Code Validation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install -r backend/requirements.txt
      - name: Validate API response codes
        run: |
          cd backend
          python scripts/run_api_docs.py validate --all --verbose
      - name: Generate documentation
        run: |
          cd backend  
          python scripts/run_api_docs.py generate --all
```

### Make Targets

Add to your project's Makefile:

```makefile
# Validate API response codes
api-validate:
	cd backend && python scripts/run_api_docs.py validate --all

# Generate API documentation  
api-docs:
	cd backend && python scripts/run_api_docs.py generate --all

# Full API workflow
api-full:
	cd backend && python scripts/run_api_docs.py workflow --verbose
```

## Output Locations

### Generated Content (All in `backend/_generated/`)
- `_generated/docs/api-responses/` - Comprehensive API response documentation
- `_generated/docs/error-catalog/` - Legacy error catalog (deprecated)
- `_generated/exports/code-registry/` - Multi-format registry exports (JSON, YAML, Python, TypeScript)
- `_generated/exports/openapi-integration/` - OpenAPI schema components
- `_generated/reports/` - Validation reports (generated on failures)

## Migration from Legacy Scripts

The following legacy scripts have been replaced:

| Legacy Script | New Script | Notes |
|---------------|------------|-------|
| `validate_error_codes.py` | `validators/validate_response_codes.py` | Enhanced with success codes |
| `generate_error_docs.py` | `generators/generate_response_docs.py` | Comprehensive documentation |
| `validate_problem_types.py` | `validators/validate_problem_types.py` | Enhanced validation |
| `validate_all.py` | `run_all_validations.py` | Better reporting and options |

### Breaking Changes
- Script locations have moved to subdirectories
- Some command line arguments have changed
- Output locations consolidated under `_generated/` directory
- Enhanced validation may catch new issues
- Legacy backup files have been removed

### Migration Steps
1. Update any CI/CD scripts to use new consolidated locations
2. All make targets work the same (no changes needed)
3. Review and fix any newly detected validation issues
4. Update any hardcoded paths to use `_generated/` structure

## Troubleshooting

### Common Issues

1. **Django setup errors**
   ```bash
   # Ensure you're in the backend directory
   cd backend
   # Check Django settings
   export DJANGO_SETTINGS_MODULE=config.settings.base
   ```

2. **Code validation failures**
   - Check that all codes follow the VDJ-MODULE-USECASE-HTTP pattern
   - Ensure no duplicate codes exist across apps
   - Verify problem types are properly structured

3. **Generation failures**
   - Ensure validation passes first
   - Check write permissions for output directories
   - Verify Django app registration

### Debug Mode

Run scripts with verbose output to debug issues:

```bash
python scripts/run_api_docs.py validate --all --verbose
python scripts/api-response-docs/run_all_validations.py --verbose --report
```

### Performance

- Individual validators run in 1-3 seconds
- Full validation suite runs in 5-10 seconds  
- Generation scripts run in 2-5 seconds each
- Complete workflow typically under 30 seconds

## Contributing

When adding new response codes or problem types:

1. Follow the established naming patterns
2. Add appropriate error catalog entries
3. Run validation before committing:
   ```bash
   python scripts/run_api_docs.py validate --all
   ```
4. Update documentation if needed:
   ```bash  
   python scripts/run_api_docs.py generate --docs
   ```

## Future Enhancements

- [ ] Automated i18n message generation
- [ ] Client SDK generation improvements  
- [ ] Integration with API testing frameworks
- [ ] Performance monitoring integration
- [ ] Advanced pattern analysis and suggestions