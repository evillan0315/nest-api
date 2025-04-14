import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DynamodbService } from './dynamodb.service';
import { Roles } from '../admin/roles/roles.decorator';
import { Role } from '../admin/roles/role.enum';
import { RolesGuard } from '../admin/roles/roles.guard';
import { CognitoGuard } from '../aws/cognito/cognito.guard';
import { StoreCommandDto } from './dto/store-command.dto';
@ApiTags('AWS - DynamoDB')
@ApiBearerAuth() // Enables JWT authentication in Swagger
@Controller('api/dynamodb')
@UseGuards(CognitoGuard, RolesGuard)
export class DynamodbController {
  constructor(private readonly dynamoDBService: DynamodbService) {}

  @Post('store-command')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Store a command in DynamoDB' })
  @ApiResponse({ status: 201, description: 'Command stored successfully' })
  async storeCommand(
    @Body() body: StoreCommandDto,
    //@CurrentUser() user: UserPayload,
  ) {
    const { command } = body;
    //const { sub: cognitoId, username } = user;
    // await this.dynamoDBService.storeCommand(command, cognitoId, username);
    return { message: 'Command stored successfully' };
  }

  @Get('stored-commands')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Retrieve stored commands from DynamoDB' })
  @ApiResponse({
    status: 200,
    description: 'Stored commands retrieved successfully',
  })
  async getStoredCommands() {
    return await this.dynamoDBService.getStoredCommands();
  }

  @Post('create-table')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create a new DynamoDB table' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tableName: { type: 'string' },
        keySchema: { type: 'array', items: { type: 'object' } },
        attributeDefinitions: { type: 'array', items: { type: 'object' } },
        provisionedThroughput: {
          type: 'object',
          properties: {
            ReadCapacityUnits: { type: 'number' },
            WriteCapacityUnits: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Table created successfully' })
  async createTable(
    @Body('tableName') tableName: string,
    @Body('keySchema') keySchema: any,
    @Body('attributeDefinitions') attributeDefinitions: any,
    @Body('provisionedThroughput') provisionedThroughput: any,
  ) {
    await this.dynamoDBService.createTable(
      tableName,
      keySchema,
      attributeDefinitions,
      provisionedThroughput,
    );
    return { message: `Table ${tableName} created successfully` };
  }
  @Get('list-tables')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'List all DynamoDB tables' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved table names',
  })
  async listTables() {
    return await this.dynamoDBService.listTables();
  }
  @Get('list-data/:tableName')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'List all stored data for a specific table' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved data' })
  async listTableData(@Param('tableName') tableName: string) {
    return await this.dynamoDBService.listTableData(tableName);
  }
}
