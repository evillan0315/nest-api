import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../password/password.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreatePasswordDto } from '../password/dto/create-password.dto';

import { CreateAccountDto } from '../account/dto/create-account.dto';
import { UpdateAccountDto } from '../account/dto/update-account.dto';
import { UserPayload } from '../auth/auth.interface';
import { CreateGoogleUserDto } from '../auth/dto/create-google-user.dto';
import { CreateGithubUserDto } from '../auth/dto/create-github-user.dto';
import { CreateCognitoUserDto } from '../auth/dto/create-cognito-user.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
  ) {}
  async updateUserToken(
    userId: string,
    account: UpdateAccountDto,
  ): Promise<any> {
    const access_token = await bcrypt.hash(account.access_token, 10);
    const refresh_token = await bcrypt.hash(account.refresh_token, 10);
    const userAccount = { ...account, access_token, refresh_token };
    return this.updateUserWithAccount(userId, userAccount);
  }

  /*async compareRefreshToken(userId: string, refreshToken: string) {
    const userAccount = await this.findUserTokenById(userId);
    //const isValid = bcrypt.compare(userAccount.refresh_token, refreshToken);
    //console.log(isValid, 'isValid');
    return userAccount;
  }*/
  async create(data: CreateUserDto) {
    const saltRounds = 10;
    console.log(data, 'data');
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    console.log(hashedPassword, 'hashedPassword');
    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: {
          create: {
            hash: hashedPassword,
          },
        },
      },
      include: {
        password: true,
      },
    });
    return user;
  }
  async update(id: string, data: UpdateUserDto) {
    let passwordUpdate:
      | Prisma.PasswordUpdateOneWithoutUserNestedInput
      | undefined = undefined;

    if (data.password?.update?.hash) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(
        data.password.update.hash,
        saltRounds,
      );

      passwordUpdate = {
        update: {
          hash: hashedPassword,
        },
      };
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        name: data.name,
        image: data.image,
        phone_number: data.phone_number,
        updatedAt: new Date(),
        emailVerified: data.emailVerified,
        role: data.role,
        password: passwordUpdate,
      },
      include: {
        password: true,
      },
    });

    return updatedUser;
  }
  async confirmEmail(email: string) {
    return this.prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });
  }

  async createCognitoUser(dto: CreateCognitoUserDto) {
    return await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        image: dto.image,
        Account: {
          create: {
            provider: dto.provider,
            providerAccountId: dto.providerAccountId,
            access_token: dto.access_token,
            type: 'oauth',
          },
        },
      },
    });
  }
  async createGithubUser(dto: CreateGithubUserDto) {
    return await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        image: dto.image,
        Account: {
          create: {
            provider: dto.provider,
            providerAccountId: dto.providerAccountId,
            access_token: dto.access_token,
            refresh_token: dto.refresh_token,
            type: 'oauth',
          },
        },
      },
    });
  }

  async createGoogleUser(dto: CreateGoogleUserDto) {
    return await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        image: dto.image,
        Account: {
          create: {
            provider: dto.provider,
            providerAccountId: dto.providerAccountId,
            access_token: dto.access_token,
            refresh_token: dto.refresh_token,
            expires_at: dto.expires_at,
            token_type: dto.token_type,
            scope: dto.scope,
            id_token: dto.id_token,
            session_state: dto.session_state,
            type: 'oauth', // or 'oidc', etc.
          },
        },
      },
    });
  }
  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        Account: true, // 👈 this pulls in the related accounts
        Session: true,
      },
    });
    //return this.prisma.user.findUnique({ where: { id } });
  }
  async findUserAccountById(userId: string) {
    return await this.prisma.account.findFirst({ where: { userId } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateUserWithAccount(userId: string, accountDto: UpdateAccountDto) {
    const userAccount = await this.prisma.account.findFirst({
      where: { userId, provider: accountDto.provider },
    });

    if (!userAccount) {
      const data = {
        ...accountDto,
        userId,
        id: uuidv4(),
        type: accountDto.type || 'localAuth',
        provider: accountDto.provider || 'auth',
        providerAccountId: userId || 'local',
      };
      console.log(data, 'updateUserWithAccount data');
      return this.prisma.account.create({
        data,
      });
    }
    return this.prisma.account.update({
      where: { id: userAccount.id },
      data: accountDto,
    });
  }
  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
