// src/auth/github.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as GitHubStrategy, VerifyCallback } from 'passport-github';
import axios from 'axios'; // We'll use axios to call GitHub's API

import { UserService } from '../../user/user.service';
import { CreateGithubUserDto } from '../dto/create-github-user.dto';
import * as jwt from 'jsonwebtoken'; // For verifying the JWT

@Injectable()
export class GithubStrategy extends PassportStrategy(GitHubStrategy, 'github') {
  constructor(private readonly userService: UserService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.COGNITO_REDIRECT_URI}/github`,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { displayName, username, emails, photos, id } = profile;

    const email = emails?.[0]?.value;
    if (!email) {
      return done(new Error('No email found in GitHub profile'), false);
    }

    try {
      let user = await this.userService.findByEmail(email);

      if (!user) {
        const createUserDto: CreateGithubUserDto = {
          email,
          name: displayName || username,
          image: photos?.[0]?.value,
          provider: 'github',
          providerAccountId: id,
          access_token: accessToken,
          refresh_token: refreshToken,
          role: 'user',
        };

        user = await this.userService.createGithubUser(createUserDto);

        if (!user) {
          return done(new Error('User not created'), false);
        }
      }

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
