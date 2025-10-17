# API Endpoint Strategy: Registration & Invitation

## Overview

This document clarifies the API endpoint strategy for organization registration and user invitation flows, addressing potential naming ambiguity.

## Current Endpoint Structure

### Organization Registration (Create New Organization)
- **Endpoint**: `POST /api/v1/auth/register/`
- **Purpose**: Create new organization + owner account
- **Authentication**: None required
- **Frontend Route**: `/register-organization` or `/signup`
- **Use Case**: Business owners creating their organization

### User Invitation (Join Existing Organization)
- **Endpoint**: `POST /api/v1/organizations/invites/accept/`
- **Purpose**: Accept invitation to existing organization
- **Authentication**: Required (existing users) or None (new users via separate endpoint)
- **Frontend Route**: `/accept-invite?token=xyz`
- **Use Case**: Team members joining via invitation

## Why Keep `/auth/register/` Name?

### ✅ Advantages

1. **Industry Standard**: Most SaaS APIs use `/register` or `/signup`
2. **No Breaking Changes**: Existing integrations continue working
3. **RESTful Convention**: Authentication operations belong in `/auth` namespace
4. **Frontend Clarity**: Frontend routes provide the differentiation
5. **Documentation**: OpenAPI docs clearly describe the behavior

### ✅ Frontend Differentiation Strategy

The clarity comes from **frontend routing**, not backend endpoints:

```typescript
// Frontend Routes
/register-organization  → Uses: POST /api/v1/auth/register/
/accept-invite          → Uses: POST /api/v1/organizations/invites/accept/
/login                  → Uses: POST /api/v1/auth/login/

// User Experience
"Create your organization" button → /register-organization page
"Accept invitation" link in email → /accept-invite page
"Sign in" link                   → /login page
```

### ✅ API Documentation Strategy

Enhance OpenAPI documentation to be explicit:

```yaml
paths:
  /api/v1/auth/register/:
    post:
      summary: Organization Registration
      description: |
        **Register a new organization with owner account**
        
        This endpoint creates:
        - A new organization with custom subdomain
        - An owner account with full permissions
        - A 14-day free trial subscription
        - JWT tokens for immediate authentication
        
        **Use this endpoint when:**
        - Business owners want to create their organization
        - New companies are onboarding to the platform
        
        **Do NOT use this endpoint when:**
        - Users are joining existing organizations (use invitation flow)
        - Adding team members to existing organizations (use invitations)
        
      tags:
        - Organization Registration
        - Authentication
```

## Alternative Endpoint Names (Not Recommended)

### ❌ Option: `/api/v1/auth/register-organization/`

**Why Not**:
- Creates breaking change
- Violates REST convention (operation in URL)
- More endpoints to maintain
- Redundant with clear documentation

### ❌ Option: `/api/v1/organizations/register/`

**Why Not**:
- Registration is primarily an authentication operation
- Splits auth operations across multiple namespaces
- Inconsistent with standard REST patterns
- Confusing ownership (is it auth or organizations?)

## Current Implementation Details

### Organization Registration Endpoint

```python
# File: apps/accounts/urls/auth.py
urlpatterns = [
    path("register/", register, name="register"),  # Organization registration
    # ... other auth endpoints
]

# File: apps/accounts/views/auth.py
@extend_schema(
    summary="Organization Registration",  # ← Clear in docs
    description="Register a new organization with owner account...",
    # ...
)
def register(request):
    # Creates org + owner
    pass
```

### Invitation Acceptance Endpoints

```python
# File: apps/organizations/urls/api_v1.py
urlpatterns = [
    # Existing user acceptance
    path("invites/accept/", 
         InviteViewSet.as_view({"post": "accept_invite"}),
         name="invite-accept"),
    
    # New user acceptance (proposed)
    # Will be in apps/accounts/urls/auth.py
    path("register-with-invite/",
         register_with_invite,
         name="register-with-invite"),
]
```

## Frontend Integration Best Practices

### 1. Clear Route Naming

```typescript
// routes.ts
export const routes = {
  // Organization creation
  registerOrganization: '/register-organization',
  
  // User invitation
  acceptInvite: '/accept-invite',
  
  // Standard auth
  login: '/login',
  logout: '/logout',
};
```

### 2. Contextual UI/UX

```tsx
// Landing page
<Button onClick={() => navigate('/register-organization')}>
  Start Your Free Trial
</Button>

// Invitation email
<a href={`https://app.example.com/accept-invite?token=${token}`}>
  Join Acme Corp
</a>

// Login page
<Link to="/register-organization">
  Don't have an organization? Create one
</Link>
```

### 3. API Client Abstraction

```typescript
// api/auth.ts
export const authApi = {
  // Organization registration
  registerOrganization: (data: OrgRegistrationData) => 
    post('/api/v1/auth/register/', data),
  
  // User invitation acceptance (new user)
  registerWithInvite: (token: string, data: UserData) =>
    post('/api/v1/auth/register-with-invite/', { token, ...data }),
  
  // Standard login
  login: (credentials: LoginData) =>
    post('/api/v1/auth/login/', credentials),
};

// api/invitations.ts
export const invitationsApi = {
  // Existing user acceptance
  acceptInvite: (token: string) =>
    post('/api/v1/organizations/invites/accept/', { token }),
  
  // Validate invite token
  validateInvite: (token: string) =>
    get('/api/v1/organizations/invites/validate/', { params: { token } }),
};
```

## Implementation Roadmap

### Phase 1: Documentation Enhancement (Immediate)
- ✅ Update OpenAPI documentation with clear descriptions
- ✅ Add code examples to API docs
- ✅ Create this endpoint strategy document
- ✅ Update user-facing documentation

### Phase 2: New User Invitation Endpoint (Next Sprint)
- [ ] Create `/api/v1/auth/register-with-invite/` endpoint
- [ ] Implement atomic transaction (user creation + invite acceptance)
- [ ] Add tests for new user invitation flow
- [ ] Update API documentation

### Phase 3: Frontend Implementation (Following Sprint)
- [ ] Implement `/register-organization` page
- [ ] Implement `/accept-invite` page with dual flow (new/existing user)
- [ ] Add organization switcher UI
- [ ] Update landing page CTAs

## Monitoring & Analytics

Track these metrics to validate the strategy:

1. **Registration Flow Metrics**:
   - Organization registrations per day
   - Completion rate of registration flow
   - Time to complete registration

2. **Invitation Flow Metrics**:
   - Invitations sent per organization
   - Invitation acceptance rate
   - Time from invitation to acceptance
   - New user vs existing user acceptance ratio

3. **User Confusion Metrics**:
   - Support tickets mentioning "registration" or "invitation"
   - User errors during registration/invitation flows
   - Drop-off rates at each step

## Conclusion

The current endpoint structure (`/api/v1/auth/register/`) is optimal because:

1. ✅ **Standards-Compliant**: Follows REST and industry conventions
2. ✅ **No Breaking Changes**: Maintains API stability
3. ✅ **Clear Documentation**: OpenAPI docs provide full context
4. ✅ **Frontend Clarity**: UI/UX makes the distinction obvious
5. ✅ **Maintainable**: Fewer endpoints, clearer separation of concerns

The differentiation between organization registration and user invitation is achieved through:
- **Frontend routing** (`/register-organization` vs `/accept-invite`)
- **API documentation** (clear descriptions and use cases)
- **User experience** (contextual CTAs and page titles)

This strategy provides the best balance of:
- Developer experience (clear, predictable API)
- User experience (intuitive flows)
- Maintainability (fewer endpoints, less complexity)
- Flexibility (easy to extend for future features)
