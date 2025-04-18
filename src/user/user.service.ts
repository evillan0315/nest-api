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
import { FolderService } from '../folder/folder.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private folderService: FolderService,
  ) {}
  async updateUserToken(
    userId: string,
    account: UpdateAccountDto,
  ): Promise<any> {
    const access_token = await bcrypt.hash(account.access_token, 10);
    const refresh_token = await bcrypt.hash(account.refresh_token, 10);
    const userAccount = { ...account, access_token, refresh_token };
    return await this.updateUserWithAccount(userId, userAccount);
  }

  async compareRefreshToken(userId: string, refreshToken: string) {
    const userAccount = await this.findUserAccountById(userId);
    console.log(userAccount, 'userAccount.refresh_token compareRefreshToken');
    console.log(refreshToken, 'refreshToken compareRefreshToken');
    if (!userAccount) {
      return false;
    }
    const isValid = await bcrypt.compare(
      refreshToken,
      userAccount.refresh_token,
    );
    //console.log(isValid, 'isValid');
    return isValid;
  }
  async create(data: CreateUserDto) {
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

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
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        Account: true,
        Session: true,
        Folder: true, // Pulling in the array of Folders
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if the user has no folders
    if (user.Folder.length === 0) {
      // If no folders, create a default folder with specific parameters
      const folder = await this.prisma.folder.create({
        data: {
          name: `${user.id}`,
          path: `/${user.id}`, // or choose a more dynamic path if needed
          parentId: null, // You can adjust this if you want a parent folder structure
          createdById: user.id, // The user who created the folder
        },
      });

      console.log(`Created folder for user ${id}: ${folder.name}`);
    }

    return user;
  }
  async findUserAccountById(userId: string) {
    return await this.prisma.account.findFirst({ where: { userId } });
  }

  async getUserWithPassword(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        Account: true, // 👈 this pulls in the related accounts
        password: true,
      },
    });
  }
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
  async updateUserWithAccount(userId: string, accountDto: UpdateAccountDto) {
    console.log(accountDto, 'updateUserWithAccount');
    const userAccount = await this.prisma.account.findFirst({
      where: {
        userId,
        provider: accountDto.provider,
        providerAccountId: accountDto.providerAccountId,
      },
    });
    console.log(userAccount, 'userAccount updateUserWithAccount');
    if (!userAccount) {
      const data = {
        ...accountDto,
        userId,
        id: uuidv4(),
        type: accountDto.type || 'localAuth',
        provider: accountDto.provider || 'auth',
        providerAccountId: accountDto.providerAccountId || 'local',
      };
      console.log(data, 'updateUserWithAccount data');
      return await this.prisma.account.create({
        data,
      });
    }
    return await this.prisma.account.update({
      where: { id: userAccount.id },
      data: accountDto,
    });
  }
  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
