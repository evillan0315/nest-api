// src/auth/google.strategy.ts

import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { CreateGoogleUserDto } from '../dto/create-google-user.dto';
import * as jwt from 'jsonwebtoken'; // Importing jwt to verify the access token

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly userService: UserService, // ✅ This is what's failing to inject
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.COGNITO_REDIRECT_URI}/google`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { displayName, emails, photos, id } = profile;

    if (!emails?.[0]?.value) {
      return done(new Error('No email found in Google profile'), false);
    }

    const email = emails[0].value;

    try {
      // Check if user exists
      let user = await this.userService.findByEmail(email);

      if (!user) {
        const createUserDto: CreateGoogleUserDto = {
          email,
          name: displayName,
          role: 'user',
          image: photos?.[0]?.value,
          provider: 'google',
          providerAccountId: id,
          access_token: accessToken,
          refresh_token: refreshToken,
          // Add any other relevant fields if available from _json
        };
        //console.log(createUserDto, 'createUserDto');
        user = await this.userService.createGoogleUser(createUserDto);

        if (!user) {
          return done(new Error('User not created'), false);
        }
      }

      //return done(null, user);
      return done(null, {
        user,
        profile,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      return done(error, false);
    }
  }
}
