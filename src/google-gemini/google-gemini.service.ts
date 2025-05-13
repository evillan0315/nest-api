import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { GeminiDto } from './dto/gemini.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Message, Chat, ApiUsage } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { Request, Express } from 'express';

import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ApiTags } from '@nestjs/swagger';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { CreateJwtUserDto } from '../auth/dto/create-jwt-user.dto';

const idirname = dirname(__filename);

@ApiTags('Google Gemini')
@Injectable()
export class GoogleGeminiService {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly googleGeminiApiUrl: string;
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @Inject(REQUEST)
    private readonly request: Request & { user?: CreateJwtUserDto },
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_GEMINI_API_KEY', '');
    this.model = this.configService.get<string>(
      'GOOGLE_GEMINI_PRO_MODEL',
      'gemini-1.5-flash',
    );

    this.googleGeminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
  }
  private get userId(): string | undefined {
    return this.request.user?.sub; // Now TypeScript should recognize `id`
  }

  // Method to call the Gemini API
  async generateContent(geminiDto: GeminiDto): Promise<any> {
    try {
      const response = await axios.post(this.googleGeminiApiUrl, geminiDto, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data; // Return the API response
    } catch (error) {
      console.error(
        'Error with Google Gemini API:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to get response from Google Gemini');
    }
  }

  async processInputAndSaveToDb(
    question: string,
    title: string,
    chatId?: string,
  ): Promise<any> {
    try {
      const genAI = new GoogleGenerativeAI(`${this.apiKey}`);
      const model = genAI.getGenerativeModel({
        model: `${this.model}`,
      });
      const countResult = await model.countTokens(question);
      const generateResult = await model.generateContent(question);
      const processedContent = generateResult.response.text(); // Handle the response data
      let message: Message | null = null; // Declare message as Message | null
      let aiMessage: Message | null = null; // Declare aiMessage as Message | null
      let apiUsage: ApiUsage | null = null;
      let chat: Chat | null = null;
      if (!chatId) {
        chat = await this.prisma.chat.create({
          data: {
            userId: this.userId || '',
            title: title || '',
          },
        });
        if (!chat) throw new NotFoundException('Chat creation failed');
        chatId = chat.id;
      }
      const existingChat = await this.prisma.chat.findUnique({
        where: {
          id: chatId, // Check for the uniqueness of the chatId
        },
      });
      if (!existingChat) throw new NotFoundException('Chat does not exists');

      const titleResponse = await axios.post(
        'http://localhost:5000/utils/extract-title',
        {
          content: processedContent,
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      // Save the processed content into the database
      message = await this.prisma.message.create({
        data: {
          chatId,
          content: titleResponse.data || question,
          sender: 'USER',
        },
      });

      // Save the response from Gemini as a message from the AI
      aiMessage = await this.prisma.message.create({
        data: {
          chatId,
          content: processedContent,
          sender: 'AI',
        },
      });

      // Save API usage information
      apiUsage = await this.prisma.apiUsage.create({
        data: {
          messageId: aiMessage?.id,
          inputTokens:
            generateResult?.response?.usageMetadata?.candidatesTokenCount, // Example data from the API
          outputTokens:
            generateResult?.response?.usageMetadata?.totalTokenCount, // Example data from the API
          cost: countResult.totalTokens, // Example cost from the API
        },
      });

      return {
        chatId: chat?.id,
        title: titleResponse.data,
        content: processedContent,
        message: message ?? null,
        aiMessage: aiMessage ?? null,
        apiUsage: apiUsage ?? null,
        chat: chat ?? null,
      };
    } catch (error) {
      console.error('Error with Google Gemini API:', error.message);
      throw new Error('Failed to get response from Google Gemini');
    }
  }
}
