# Exception System Documentation

## Overview

This package provides a comprehensive exception handling system for the Django SaaS application, with automatic OpenAPI documentation generation.

## Features

### ✅ Automatic Error Response Documentation
All API endpoints automatically include these error responses in Swagger:
- **400 Bad Request** - Invalid request data, missing fields, validation errors
- **401 Unauthorized** - Authentication required, invalid credentials, expired tokens
- **403 Forbidden** - Insufficient permissions, organization access denied
- **500 Internal Server Error** - Unexpected server errors

### ✅ Consistent Error Format
All errors follow this structure:
```json
{
  "error": "Human-readable error message",
  "code": "machine_readable_error_code",
  "status_code": 400,
  "extra_field": "Additional context when applicable"
}
```

## Usage

### In Views
```python
from apps.core.exceptions import InvalidCredentialsException, MissingRequiredFieldException

def my_view(request):
    if not request.data.get('email'):
        raise MissingRequiredFieldException(
            detail="Email is required",
            extra_data={"missing_fields": ["email"]}
        )
    
    if not authenticate(email, password):
        raise InvalidCredentialsException()
```

### Available Exceptions

#### HTTP Status Code Exceptions
- `BadRequestException` (400)
- `UnauthorizedException` (401) 
- `ForbiddenException` (403)
- `NotFoundException` (404)
- `ConflictException` (409)
- `ValidationException` (422)
- `RateLimitException` (429)
- `InternalServerErrorException` (500)

#### Business Logic Exceptions
- `InvalidCredentialsException`
- `AccountDisabledException` 
- `TokenExpiredException`
- `InvalidRefreshTokenException`
- `OrganizationAccessDeniedException`
- `EmailAlreadyExistsException`
- `MissingRequiredFieldException`
- `SubscriptionRequiredException`

## Documentation Benefits

### Before (Manual)
```python
@extend_schema(
    responses={
        200: MyResponseSerializer,
        400: BadRequestErrorSerializer,  # Had to add manually
        401: UnauthorizedErrorSerializer,  # Had to add manually  
        403: ForbiddenErrorSerializer,   # Had to add manually
        500: InternalServerErrorSerializer,  # Had to add manually
    }
)
def my_view(request):
    pass
```

### After (Automatic)
```python
@extend_schema(
    responses={
        200: MyResponseSerializer,
        # 400, 401, 403, 500 are added automatically!
    }
)
def my_view(request):
    pass
```

## How It Works

1. **Schema Hook**: `add_common_error_responses()` automatically adds error responses to all API endpoints
2. **Exception Handler**: `custom_exception_handler()` catches all exceptions and formats them consistently
3. **Smart Logic**: Public endpoints (login, register) don't get 401/403 errors automatically

## Customization

### Adding New Exceptions
```python
# In apps/core/exceptions/business_errors.py
class MyCustomException(BaseHttpException):
    status_code = status.HTTP_418_IM_A_TEAPOT
    default_detail = "I'm a teapot"
    default_code = "teapot_error"
```

### Excluding Endpoints
Edit `excluded_paths` in `schema_hooks.py`:
```python
excluded_paths = [
    "/api/docs/",
    "/api/my-special-endpoint/",  # Won't get automatic error responses
]
```

This system ensures consistent, well-documented error handling across the entire API with minimal developer effort!