# API Documentation

This directory contains the OpenAPI/Swagger schema documentation for the VAS-DJ SaaS API.

## Schema Files

- **[openapi-v1.0.0.yaml](./openapi-v1.0.0.yaml)** - OpenAPI 3.0 schema in YAML format
- **[openapi-v1.0.0.json](./openapi-v1.0.0.json)** - OpenAPI 3.0 schema in JSON format

## Version Information

- **API Version**: 1.0.0
- **OpenAPI Specification**: 3.0.3
- **Last Generated**: 2025-10-17

## Using the Schema

### Interactive Documentation

The API provides interactive documentation when the backend is running:

- **Swagger UI**: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
- **ReDoc**: [http://localhost:8000/api/redoc/](http://localhost:8000/api/redoc/)
- **Raw Schema**: [http://localhost:8000/api/schema/](http://localhost:8000/api/schema/)

### Client Code Generation

You can use these schema files to generate type-safe API clients for various languages:

#### TypeScript/JavaScript (using openapi-typescript-codegen)
```bash
# Install the generator
pnpm add -D openapi-typescript-codegen

# Generate TypeScript client
npx openapi-typescript-codegen --input backend/docs/api/openapi-v1.0.0.yaml --output packages/api-client/src/generated --client axios
```

#### TypeScript (using openapi-typescript)
```bash
# Install the generator
pnpm add -D openapi-typescript

# Generate TypeScript types
npx openapi-typescript backend/docs/api/openapi-v1.0.0.yaml --output packages/types/src/api.ts
```

#### Other Languages
- **Python**: Use [openapi-generator](https://openapi-generator.tech/)
- **Go**: Use [oapi-codegen](https://github.com/deepmap/oapi-codegen)
- **Java**: Use [OpenAPI Generator](https://openapi-generator.tech/)
- **Swift**: Use [CreateAPI](https://github.com/CreateAPI/CreateAPI)

## Regenerating the Schema

To regenerate the schema files after making API changes:

```bash
# From the backend directory
cd backend

# Generate YAML format
docker compose -f ./docker/docker-compose.yml run --rm web python manage.py spectacular --format openapi > docs/api/openapi-v1.0.0.yaml

# Generate JSON format
docker compose -f ./docker/docker-compose.yml run --rm web python manage.py spectacular --format openapi-json > docs/api/openapi-v1.0.0.json
```

Or use the helper script (if created):
```bash
make generate-schema  # If you add this to the Makefile
```

## API Overview

The VAS-DJ SaaS API includes the following modules:

### Authentication (`/api/v1/auth/`)
- User registration with automatic organization creation
- JWT-based authentication (access & refresh tokens)
- Password reset and email verification
- Social authentication support

### Accounts (`/api/v1/accounts/`)
- User profile management
- Account settings
- Authentication providers

### Organizations (`/api/v1/organizations/`)
- Multi-tenant organization management
- Team member management
- Organization invitations
- Organization settings and branding

### Billing (`/api/v1/billing/`)
- Subscription management
- Invoice management
- Payment methods
- Usage tracking

### Email Service (`/api/v1/email_service/`)
- Email template management
- Email sending and tracking

### Feature Flags (`/api/v1/feature-flags/`)
- Feature flag management
- Access rules and targeting
- User onboarding tracking
- Feature rollout controls

## Authentication

The API supports multiple authentication methods:

1. **JWT Authentication** (Recommended)
   - Include `Authorization: Bearer <access_token>` header
   - Obtain tokens via `/api/v1/auth/login/`
   - Refresh via `/api/v1/auth/refresh/`

2. **Session Authentication**
   - Cookie-based authentication
   - Useful for same-origin requests

3. **Token Authentication**
   - Include `Authorization: Token <token>` header
   - Legacy support for DRF token auth

## Response Format

All API responses follow a consistent envelope format:

### Success Response
```json
{
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2025-10-17T04:12:00Z",
    "requestId": "abc-123-def-456"
  }
}
```

### Error Response (RFC 7807)
```json
{
  "type": "https://api.vas-dj.com/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "The request contains invalid data",
  "instance": "/api/v1/auth/register/",
  "code": "VDJ-400-001",
  "errors": {
    "email": ["This field is required."]
  }
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Default**: 1000 requests/hour per IP
- **Authenticated**: 2000 requests/hour per user
- **Registration**: 20 requests/hour per IP
- **Login**: 50 requests/hour per IP
- **Password Reset**: 10 requests/hour per IP

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets

## Pagination

List endpoints support cursor-based pagination:

```json
{
  "data": {
    "results": [/* items */],
    "next": "http://api.example.com/resource/?cursor=xyz",
    "previous": "http://api.example.com/resource/?cursor=abc",
    "count": 100
  }
}
```

Query parameters:
- `page_size`: Number of items per page (default: 20, max: 100)
- `cursor`: Pagination cursor

## Support

For API questions or issues:
- GitHub: [vas-dj-saas-project](https://github.com/your-org/vas-dj-saas-project)
- Documentation: Check the `/docs` directory for detailed guides
- Email: support@vas-dj.com
