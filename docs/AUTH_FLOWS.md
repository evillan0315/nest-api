# Authentication Flows

This document provides an overview of the authentication processes implemented in the Cognito Auth App.

## Authentication Methods

### 1. Email/Password Authentication

The traditional authentication flow using Cognito User Pools:

1. User submits email and password to `/api/auth/login`
2. The application authenticates with Cognito using `InitiateAuthCommand`
3. Upon successful authentication, a JWT token is generated and stored in an HTTP-only cookie
4. The user is now authenticated and can access protected routes

### 2. Google OAuth Authentication

OAuth 2.0 authentication flow with Google:

1. User is redirected to `/api/auth/google/login`
2. The application redirects to Google's OAuth consent screen
3. After user grants permission, Google redirects back to `/api/auth/callback/google` with an authorization code
4. The application exchanges the code for Google tokens
5. User information is extracted from the tokens and used to authenticate/create a user in Cognito
6. A JWT token is generated and stored in an HTTP-only cookie
7. The user is redirected to the frontend application

### 3. GitHub OAuth Authentication

OAuth 2.0 authentication flow with GitHub:

1. User is redirected to `/api/auth/github/login`
2. The application redirects to GitHub's OAuth consent screen
3. After user grants permission, GitHub redirects back to `/api/auth/callback/github` with an authorization code
4. The application exchanges the code for GitHub tokens
5. User information is extracted from the tokens and used to authenticate/create a user in Cognito
6. A JWT token is generated and stored in an HTTP-only cookie
7. The user is redirected to the frontend application

## Token Management

### JWT Token Structure

The JWT token contains the following claims:

- `username`: The user's username in Cognito
- `name`: The user's full name
- `email`: The user's email address
- `accessToken`: The Cognito access token
- `iss`: The token issuer (credentials, google, or github)
- `aud`: The client ID
- `role`: The user's role (USER, ADMIN, or SUPERADMIN)

### Token Storage

Tokens are stored in HTTP-only cookies with the following settings:

```javascript
res.cookie('access_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Secure in production
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000, // 1 day
});
```

### Token Verification

Tokens are verified using:

1. **JWKS Verification**: For Cognito-issued tokens, verification is done using JSON Web Key Sets (JWKS)
2. **JWT Secret Verification**: For application-issued tokens, verification is done using the JWT_SECRET

## Role-Based Access Control

The application implements role-based access control with three roles:

1. **USER**: Basic access to user-specific resources
2. **ADMIN**: Administrative access to manage users and resources
3. **SUPERADMIN**: Full system access with all privileges

Roles are enforced using:

1. **CognitoGuard**: Verifies the JWT token and extracts user information
2. **RolesGuard**: Checks if the user has the required role for the requested resource

Example of protecting a route with roles:

```typescript
@Roles(Role.ADMIN, Role.SUPERADMIN)
@UseGuards(CognitoGuard, RolesGuard)
@Get('admin-dashboard')
getAdminDashboard(@Request() req) {
  return { message: 'Welcome to the Admin Dashboard', user: req.user };
}
```

## Session Management

Sessions are managed through JWT tokens with the following features:

1. **Session Duration**: 24 hours by default
2. **Session Termination**: Users can log out via `/api/auth/logout`
3. **Session Validation**: Every request to a protected route validates the session
4. **Session Refresh**: Currently not implemented, users need to re-authenticate after token expiration

## Security Considerations

1. **HTTPS**: All communication should be over HTTPS in production
2. **HTTP-Only Cookies**: Prevents JavaScript access to tokens
3. **CSRF Protection**: Strict same-site cookie policy
4. **Token Expiration**: Limited token lifetime
5. **Secure Password Storage**: Passwords are managed by Cognito and never stored in the application
6. **Rate Limiting**: Should be implemented to prevent brute force attacks
