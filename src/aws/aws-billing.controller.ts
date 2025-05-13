import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AwsBillingService } from './aws-billing.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CostAndUsageResponse } from './aws-billing.dto';
import { Roles } from '../admin/roles/roles.decorator'; // Adjust path as needed
import { Role } from '../admin/roles/role.enum';
import { RolesGuard } from '../admin/roles/roles.guard';
import { CognitoGuard } from '../aws/cognito/cognito.guard';

@ApiTags('AWS - Billing')
@ApiBearerAuth()
@UseGuards(CognitoGuard, RolesGuard)
@Controller('api/billing')
export class AwsBillingController {
  constructor(private readonly awsBillingService: AwsBillingService) {}

  @Get('cost-usage')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get AWS Cost and Usage' })
  @ApiQuery({ name: 'granularity', required: false, example: 'MONTHLY' })
  @ApiQuery({ name: 'startDate', required: true, example: '2025-03-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2025-05-01' })
  @ApiResponse({
    status: 200,
    description: 'The cost and usage data was successfully retrieved.',
    type: CostAndUsageResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve cost and usage data.',
  })
  async getCostAndUsage(
    @Query('granularity') granularity: 'MONTHLY' | 'DAILY' | 'HOURLY',
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<CostAndUsageResponse> {
    const awsResponse = await this.awsBillingService.getCostAndUsage(
      startDate,
      endDate,
      granularity,
    );

    // Optional: log for debugging
    // console.log('AWS Cost and Usage Response:', awsResponse);

    const costAndUsageResponse = {
      TotalCost: awsResponse.totalCost || {},
      Granularity: awsResponse.granularity || granularity,
      StartDate: awsResponse.startDate || startDate,
      EndDate: awsResponse.endDate || endDate,
      Breakdown: awsResponse.breakdown || null,
    };

    return costAndUsageResponse;
  }

  @Get('budgets')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Get AWS Budget details' })
  @ApiResponse({
    status: 200,
    description: 'The budget details were successfully retrieved.',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve budget details.',
  })
  async getBudgetDetails() {
    return this.awsBillingService.getBudgetDetails();
  }
}
