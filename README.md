# 🛡️ NestJS Cognito Auth App

A full-featured **NestJS** application for **AWS Cognito** user management with **Google OAuth2** and **GitHub OAuth** login integration, plus **Role-Based Access Control (RBAC)**. Includes complete **API documentation** with Swagger.

## ✨ Features

- 🔐 **AWS Cognito Integration**
  - User authentication with email/password
  - User management (create, update, delete)
  - Group/role management
  - Token validation and verification

- 🌐 **OAuth Integration**
  - Google OAuth2 login
  - GitHub OAuth login
  - Custom JWT token generation

- 👑 **Role-Based Access Control (RBAC)**
  - User, Admin, and SuperAdmin roles
  - Role-based route protection
  - Group-based permissions in Cognito

- ☁️ **AWS Services Integration**
  - EC2 instance management (list, start, stop, terminate, launch)
  - DynamoDB operations
  - S3 file storage
  - Cost Explorer data retrieval

- 🔒 **Security Features**
  - JWT token handling
  - Secure cookie management
  - JWKS token verification

- 📚 **API Documentation**
  - Comprehensive Swagger/OpenAPI integration
  - Detailed endpoint documentation

## 📁 Project Structure

```
src/
├── admin/
│   └── roles/           # Role-based access control
├── auth/
│   ├── guards/          # Auth guards for Google and GitHub
│   ├── strategies/      # OAuth strategies
│   ├── auth.controller.ts
│   ├── auth.dto.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── aws/
│   └── cognito/         # AWS Cognito integration
│       ├── cognito.guard.ts
│       ├── cognito.interface.ts
│       ├── cognito.module.ts
│       ├── cognito.service.ts
│       ├── cognito.strategy.ts
│       └── cognito.ws.guard.ts
├── ec2/                 # EC2 instance management
│   ├── ec2.controller.ts
│   ├── ec2.service.ts
│   └── launch-instance.dto.ts
├── user/                # User management
├── app.controller.ts
├── app.module.ts
└── main.ts
```

## 🧪 Tech Stack

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [AWS Cognito](https://aws.amazon.com/cognito/) - User authentication and management
- [Passport.js](http://www.passportjs.org/) - Authentication middleware
- [JWT](https://jwt.io/) - JSON Web Tokens for secure authentication
- [Swagger/OpenAPI](https://swagger.io/) - API documentation

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/cognito-auth-app.git
cd cognito-auth-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory with the following variables:

```
# AWS Configuration
AWS_REGION=your_aws_region
COGNITO_USER_POOL_ID=your_cognito_user_pool_id
COGNITO_CLIENT_ID=your_cognito_client_id
COGNITO_DOMAIN=your_cognito_domain
COGNITO_REDIRECT_URI=your_redirect_uri

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# JWT Configuration
JWT_SECRET=your_jwt_secret
```

## 🚀 Running the application

### Development mode

```bash
npm run start:dev
```

### Production mode

```bash
npm run build
npm run start:prod
```

## 🔐 Authentication Flows

### Email/Password Authentication

```
POST /api/auth/login
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Google OAuth Authentication

1. Redirect user to:
```
GET /api/auth/google/login
```

2. After Google authentication, user will be redirected to:
```
GET /api/auth/callback/google
```

### GitHub OAuth Authentication

1. Redirect user to:
```
GET /api/auth/github/login
```

2. After GitHub authentication, user will be redirected to:
```
GET /api/auth/callback/github
```

## 👑 Role-Based Access Control

The application supports three roles:
- `USER` - Basic access
- `ADMIN` - Administrative access
- `SUPERADMIN` - Full system access

Protect routes with the `@Roles()` decorator:

```typescript
@Roles(Role.ADMIN, Role.SUPERADMIN)
@UseGuards(CognitoGuard, RolesGuard)
@Get('admin-dashboard')
getAdminDashboard(@Request() req) {
  return { message: 'Welcome to the Admin Dashboard', user: req.user };
}
```

## 📚 Documentation

- [API Documentation](http://localhost:3000/api) - Swagger UI for API endpoints
- [EC2 Module Documentation](./docs/EC2_MODULE.md) - Detailed documentation for EC2 management
- [Authentication Flows](./docs/AUTH_FLOWS.md) - Overview of authentication processes

## 🧠 User Management

The application provides a complete set of user management features:

- Create new users in Cognito
- Update user attributes
- Delete users
- Assign users to groups
- List all users
- Get user information

## 🔒 Session Management

Sessions are managed using JWT tokens stored in HTTP-only cookies for security.

## 🛡️ Security Considerations

- Tokens are validated using JWKS (JSON Web Key Sets)
- Secure cookies with appropriate flags
- Role-based access control for all sensitive operations

## 🚀 Deployment

### AWS EC2 Deployment

1. Provision an EC2 instance
2. Install Node.js and npm
3. Clone the repository
4. Set up environment variables
5. Build and run the application
6. (Optional) Set up Nginx as a reverse proxy

### AWS Lambda Deployment

The application can be adapted for serverless deployment using AWS Lambda with API Gateway.

## 📝 License

[MIT](LICENSE)

## 👤 Author

Eddie Villanueva
