import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Res,
  Query,
  Req,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger'; // Import Swagger decorators
import { CognitoGuard } from '../aws/cognito/cognito.guard'; // Guard for Cognito authentication
import { RolesGuard } from '../admin/roles/roles.guard'; // Guard for checking roles
import { Roles } from '../admin/roles/roles.decorator'; // Custom decorator to set roles
import { Role } from '../admin/roles/role.enum'; // Ensure correct path
import { JwtPayload } from '../aws/cognito/jwt-payload.interface'; // JWT Payload Interface for typing
import { CognitoService } from '../aws/cognito/cognito.service'; // Import the Cognito service
import { UserService } from '../user/user.service';
import { CognitoPayload } from '../aws/cognito/cognito.interface'; // Import the CognitoPayload interface
import { AuthSignInDto, GetProfileDto, AuthSignUpDto } from './auth.dto'; // Import the CognitoPayload interface
import { GoogleAuthGuard } from './guards/google.guard'; // Add Google strategy for OAuth
import { GithubAuthGuard } from './guards/github.guard'; // Add Github strategy for OAuth\
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import * as cookie from 'cookie';
import {
  UpdateAccountDto,
  RefreshAccountDto,
} from '../account/dto/update-account.dto';
import { JwtTokenResponseDto } from './dto/jwt-token-response.dto';
import {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service'; // Guard for Cognito authentication

@ApiTags('Auth') // Group API under 'auth' in Swagger UI
@Controller('api/auth')
@ApiBearerAuth() // Swagger UI will expect the Authorization token in the header
export class AuthController {
  constructor(
    private readonly cognitoService: CognitoService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}
  @Get('session')
  @ApiOperation({ summary: 'Get user session' })
  @ApiResponse({
    status: 200,
    description: 'User session retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiCookieAuth('token') // Indicates that a cookie-based auth is required
  async getSession(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    //console.log(req.cookies, 'req.cookies?')
    const token = req.cookies?.access_token; // Extract token from cookies

    if (!token) {
      throw new UnauthorizedException('No session found');
    }

    const user = await this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid session');
    }

    return res.json({ user });
  }
  @ApiOperation({
    summary: 'Login the user',
    description:
      'Authenticates the user using their email and password. Returns access and ID tokens upon successful login.',
  })
  @ApiBody({ type: AuthSignInDto })
  @ApiResponse({
    status: 201,
    description: 'The user logged in successfully.',
    schema: {
      example: {
        message: 'Login successful',
        tokens: {
          accessToken: 'eyJraWQ6...access-token',
          idToken: 'eyJraWQ6...id-token',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The user logged in successfully.',
    schema: {
      example: {
        message: 'Login successful',
        tokens: {
          accessToken: 'eyJraWQ6...access-token',
          idToken: 'eyJraWQ6...id-token',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, invalid credentials or missing parameters.',
    schema: {
      example: {
        message: 'Authentication failed',
        error: 'Invalid credentials or authentication failed',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        message: 'Error during authentication',
        error: 'Some internal error details',
      },
    },
  })
  @Post('login')
  async login(
    @Body() credentials: AuthSignInDto,
    @Res({ passthrough: true }) res: ExpressResponse, // Include Express response
  ) {
    const { email, password } = credentials;
    try {
      const payload = await this.authService.login(email, password);
      console.log(payload, 'payload login');
      if (payload.accessToken) {
        //const userToken = await this.authService.generateJwtToken(payload);
        res.cookie('access_token', payload.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          //path: '/api/auth/refresh', // Only send for refresh route
          maxAge: 24 * 60 * 60 * 1000, // 7 days
        });
      }
      if (payload.refreshToken) {
        res.cookie('refresh_token', payload.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/api/auth/refresh', // Only send for refresh route
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
      }
      return payload;
    } catch (error) {
      throw new HttpException(
        { message: 'Authentication failed', error: error.message },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Post('register')
  @ApiOperation({ summary: 'register user' })
  @ApiResponse({ status: 200, description: 'User added successfully.' })
  @ApiResponse({ status: 400, description: 'Access token is required.' })
  //@ApiResponse({ status: 401, description: 'Invalid or expired access token.' })
  async register(
    @Body() credentials: AuthSignUpDto,
    @Res() response: ExpressResponse,
  ) {
    try {
      return await this.authService.register(credentials);
    } catch (error) {
      console.error('Logout error:', error);
      return response
        .status(401)
        .json({ message: 'Invalid or expired access token' });
    }
  }
  @Get('confirm')
  async confirmEmail(@Query('token') token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      await this.userService.confirmEmail(payload.email);
      return { message: 'Email confirmed successfully!' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }
  @Post('logout')
  @ApiOperation({ summary: 'Logout the current user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully.' })
  @ApiResponse({ status: 400, description: 'Access token is required.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired access token.' })
  async logout(
    @Req() request: ExpressRequest,
    @Res() response: ExpressResponse,
  ) {
    let accessToken = request.cookies['access_token']; // Try getting token from cookies

    if (!accessToken) {
      // Try extracting from Authorization header as a fallback
      accessToken = request.headers['authorization']?.split(' ')[1];
    }

    if (!accessToken) {
      return response.status(400).json({ message: 'Access token is required' });
    }

    try {
      //await this.cognitoService.logoutUser(accessToken, response);

      // Clear cookie
      response.clearCookie('access_token', {
        httpOnly: true,
        sameSite: 'strict',
        secure: false, // Ensure secure cookies in production
      });

      return response.json({ message: 'User logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      return response
        .status(401)
        .json({ message: 'Invalid or expired access token' });
    }
  }
  /**
   * Redirects to the GitHub OAuth login page.
   * @returns {void} Redirects user to GitHub OAuth login page
   */
  @Get('github/login')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({
    summary: 'Redirect to GitHub OAuth login',
    description:
      'This endpoint redirects the user to GitHub login for OAuth authentication.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to GitHub OAuth login page.',
  })
  async githubAuth(@Res() res: ExpressResponse): Promise<void> {
    const redirect = await this.cognitoService.getGitHubLoginRedirectUrl();
    return res.redirect(redirect);
  }

  /**
   * Handles the GitHub OAuth callback and issues a JWT token.
   * @returns {void} Redirects user to a frontend route with a JWT token
   */
  @Get('callback/github')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({
    summary: 'GitHub OAuth callback',
    description:
      'This endpoint handles the GitHub OAuth callback, exchanges the code for a token, and generates a JWT for the user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Redirects the user with a JWT token.',
    schema: {
      example: {
        token: 'JWT_TOKEN_HERE',
      },
    },
  })
  async githubAuthRedirect(@Req() req, @Res() res: ExpressResponse) {
    const { user, accessToken } = req.user;
    // You can customize the payload

    const payload = {
      username: user.username,
      name: user.name,
      email: user.email,
      accessToken,
      iss: 'github',
      aud: user.client_id,
      role: user.role,
    };
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set!');
    }
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h', // optional
    });
    //return {payload,token}
    // Redirect user with JWT token or to a frontend route
    //return res.redirect(`http://localhost:5173/?token=${token}`);
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    //return payload;
    // Redirect user with JWT token or to a frontend route
    res.redirect(`http://localhost:5173/bash?token=${token}`);
  }
  @Post('google/login')
  @ApiOperation({ summary: 'Login using Google OAuth Code' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Google OAuth authorization code from frontend redirect',
        },
      },
      required: ['code'],
    },
  })
  async googlePostLogin(@Body('code') code: string) {
    return this.cognitoService.exchangeGoogleToken(code);
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Redirects to Cognito Google OAuth2 Login Page' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Cognito Hosted UI with Google login',
  })
  @ApiResponse({ status: 403, description: 'Forbidden if guard fails' })
  async googleLogin(@Res() res: ExpressResponse): Promise<void> {
    const redirect = await this.cognitoService.getGoogleLoginRedirectUrl();
    return res.redirect(redirect);
  }
  @UseGuards(GoogleAuthGuard)
  @Get('callback')
  @ApiOperation({ summary: 'Handles Cognito Google OAuth2 Callback' })
  @ApiResponse({
    status: 302,
    description: 'Redirects or processes Cognito token exchange',
  })
  @ApiResponse({
    status: 400,
    description: 'Missing or invalid code in callback URL',
  })
  async googleLoginCallback(
    @Query('code') code: string,
    @Res() res: ExpressResponse,
  ): Promise<void> {
    if (!code) {
      throw new BadRequestException('Missing code in query parameters');
    }

    try {
      const token = await this.cognitoService.exchangeGoogleToken(code);

      return token;
    } catch (error) {
      throw new InternalServerErrorException('Failed to exchange Google token');
    }
  }
  // Route for Google OAuth callback after user logs in
  @Get('callback/google')
  @UseGuards(GoogleAuthGuard) // Protects the callback with Google Auth Guard
  @ApiOperation({ summary: 'Google OAuth2 callback' })
  @ApiResponse({
    status: 200,
    description:
      'Successful Google authentication. Returns user information and a JWT token.',
  })
  @ApiResponse({ status: 401, description: 'Google authentication failed.' })
  async googleCallback(@Req() req, @Res() res: ExpressResponse) {
    const { user, accessToken, refreshToken } = req.user;
    // You can customize the payload

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set!');
    }

    /*const payload = {
      username: user.username,
      name: user.name,
      email: user.email,
      accessToken,
      refreshToken,
      provider: 'google',
      providerAccountId: user.client_id,
      client_id: user.client_id,
      role: user.role,
    };*/
    const localUserPayload = {
      sub: user.id,
      email: user.email,
      provider: 'google',
      role: user.role || 'user',
      providerAccountId: user.client_id,
      client_id: user.client_id,
    };

    const token = await this.authService.generateJwtToken(localUserPayload);
    res.cookie('access_token', token.accessToken, {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.cookie('refresh_token', token.refreshToken, {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      sameSite: 'strict',
      path: '/api/auth/refresh', // Only send for refresh route
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    /*if(!payload){
    	throw new Error('Missing Payload!');
    }
    if(payload.accessToken){
    	res.cookie('access_token', payload.accessToken, {
	      httpOnly: true,
	      secure: false, // Set to true if using HTTPS
	      sameSite: 'strict',
	      maxAge: 24 * 60 * 60 * 1000, // 1 day
	    });
    }
    if(payload.refreshToken){
    	res.cookie('refresh_token', payload.refreshToken, {
	      httpOnly: true,
	      secure: false, // Set to true if using HTTPS
	      sameSite: 'strict',
	      maxAge: 24 * 60 * 60 * 1000, // 1 day
	    });
    }*/
    //return payload;
    // Redirect user with JWT token or to a frontend route
    res.redirect(
      `http://localhost:5173?token=${token.accessToken}&email=${user.email}`,
    );
  }

  @ApiOperation({ summary: 'Get the user profile' })
  @ApiResponse({
    status: 201,
    description: 'User profile fetched successfully.',
    schema: {
      example: {
        message: 'User profile fetched successfully',
        user: {
          email: 'user@example.com',
          name: 'John Doe',
          role: 'admin',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User profile fetched successfully.',
    schema: {
      example: {
        message: 'User profile fetched successfully',
        user: {
          email: 'user@example.com',
          name: 'John Doe',
          role: 'admin',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request or invalid token.',
    schema: {
      example: {
        message: 'Invalid request',
        error: 'Token is missing or malformed',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    schema: {
      example: {
        message: 'Could not fetch user profile',
        error: 'Something went wrong on the server',
      },
    },
  })
  @UseGuards(CognitoGuard)
  @Get('profile')
  getProfile(@Request() req) {
    console.log(req.user, 'req.user');
    return req.user;
  }

  @ApiOperation({ summary: 'Get the admin dashboard' })
  @ApiResponse({
    status: 200,
    description: 'The admin dashboard was successfully fetched.',
    schema: {
      example: {
        message: 'Welcome to the Admin Dashboard',
        user: {
          email: 'admin@example.com',
          name: 'Admin User',
          avatarUrl: 'https://example.com/admin-avatar.jpg',
        },
      },
    },
  })
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @UseGuards(CognitoGuard, RolesGuard) // Apply both guards
  @Get('admin-dashboard')
  getAdminDashboard(@Request() req) {
    return { message: 'Welcome to the Admin Dashboard', user: req.user };
  }

  @ApiOperation({ summary: 'Get the user dashboard' })
  @ApiResponse({
    status: 200,
    description: 'The user dashboard was successfully fetched.',
    schema: {
      example: {
        message: 'Welcome to the User Dashboard',
        user: {
          email: 'user@example.com',
          name: 'User Name',
          avatarUrl: 'https://example.com/user-avatar.jpg',
        },
      },
    },
  })
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  @UseGuards(CognitoGuard, RolesGuard) // Apply both guards
  @Get('user-dashboard')
  getUserDashboard(@Request() req) {
    return { message: 'Welcome to the User Dashboard', user: req.user };
  }

  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @UseGuards(CognitoGuard, RolesGuard) // Apply both guards
  @ApiOperation({ summary: 'Get user profile information from access token' })
  @ApiBody({ type: GetProfileDto })
  @ApiResponse({
    status: 201,
    description: 'User profile fetched successfully.',
    schema: {
      example: {
        message: 'User profile fetched successfully',
        userInfo: {
          sub: 'edvillan15',
          email: 'evillan0315@gmail.com',
          name: '',
          role: 'user',
          accessToken: 'eyJraWQiOi...long-token...',
          Attributes: [
            { Name: 'email', Value: 'evillan0315@gmail.com' },
            { Name: 'email_verified', Value: 'true' },
            { Name: 'sub', Value: 'c9eee4d8-8001-7020-92c3-84aab9148595' },
          ],
          Username: 'edvillan15',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The user information was successfully fetched.',
    schema: {
      example: {
        message: 'User profile fetched successfully',
        userInfo: {
          sub: 'edvillan15',
          email: 'evillan0315@gmail.com',
          name: '',
          role: 'user',
          accessToken: 'eyJraWQiOi...long-token...',
          Attributes: [
            { Name: 'email', Value: 'evillan0315@gmail.com' },
            { Name: 'email_verified', Value: 'true' },
            { Name: 'sub', Value: 'c9eee4d8-8001-7020-92c3-84aab9148595' },
          ],
          Username: 'edvillan15',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, token is invalid or missing.',
    schema: {
      example: {
        message: 'Failed to fetch user info',
        error: 'Invalid or expired token',
      },
    },
  })
  @Post('verify')
  async getProfileByToken(@Body() body: GetProfileDto) {
    const { accessToken } = body;

    try {
      return await this.authService.verifyAccessToken(accessToken);
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to fetch user info',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @UseGuards(CognitoGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT token using refresh token' })
  @ApiBody({ type: JwtTokenResponseDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully refreshed token',
    type: JwtTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
  })
  async refreshToken(
    @Req() req,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    let payload = req.user;

    if (!payload) {
      throw new Error('Payload does not exist!');
    }
    const rawCookie = req.headers.cookie || '';
    const parsedCookies = cookie.parse(rawCookie);

    let token = req.body.refreshToken;

    if (!token) {
      token = parsedCookies['refresh_token'];
    }
    const isValid = await this.authService.validateRefreshToken(
      payload.sub,
      token,
    );
    if (!isValid) {
      throw new Error('Not valid refresh token!');
    }

    const verify = await this.authService.verifyRefreshToken(token);
    console.log(verify, 'verifyRefreshToken');
    if (verify) {
      payload = verify;
    }
    const newToken = await this.authService.getAccessToken(payload);
    res.cookie('access_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    const verifyNewToken = await this.authService.verifyAccessToken(newToken);
    console.log(verifyNewToken, `newToken: ${newToken}`);
    return newToken;
  }
}
