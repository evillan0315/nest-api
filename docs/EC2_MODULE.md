# EC2 Module Documentation

## Overview

The EC2 module provides a secure interface for managing AWS EC2 instances through the NestJS application. It allows administrators to list, start, stop, terminate, and launch EC2 instances via a RESTful API. The module is protected by Cognito authentication and role-based access control, ensuring that only authorized administrators can perform these operations.

## Architecture

The EC2 module follows a standard NestJS architecture with:

- **Controller**: Handles HTTP requests and routes them to the appropriate service methods
- **Service**: Contains the business logic and interacts with the AWS SDK
- **DTO**: Defines the data structure for launching new instances

## Security

All EC2 operations are protected by:

1. **Cognito Authentication**: Requires a valid JWT token from AWS Cognito
2. **Role-Based Access Control**: Restricts access to users with ADMIN or SUPERADMIN roles
3. **AWS Credentials**: Uses securely stored AWS credentials for API calls

## API Endpoints

### List All EC2 Instances

```
GET /ec2
```

**Authorization**: Requires ADMIN or SUPERADMIN role

**Response**: Returns an array of EC2 instance objects with details such as:
- Instance ID
- Instance state
- Instance type
- Public/private IP addresses
- Launch time
- Tags

### Start an EC2 Instance

```
POST /ec2/start/:id
```

**Authorization**: Requires ADMIN or SUPERADMIN role

**Parameters**:
- `id`: The ID of the EC2 instance to start

**Response**: Returns the result of the start operation, including the current state of the instance.

### Stop an EC2 Instance

```
POST /ec2/stop/:id
```

**Authorization**: Requires ADMIN or SUPERADMIN role

**Parameters**:
- `id`: The ID of the EC2 instance to stop

**Response**: Returns the result of the stop operation, including the current state of the instance.

### Terminate an EC2 Instance

```
POST /ec2/terminate/:id
```

**Authorization**: Requires ADMIN or SUPERADMIN role

**Parameters**:
- `id`: The ID of the EC2 instance to terminate

**Response**: Returns the result of the terminate operation, including the current state of the instance.

### Launch a New EC2 Instance

```
POST /ec2/launch
```

**Authorization**: Requires ADMIN or SUPERADMIN role

**Request Body**:
```json
{
  "imageId": "ami-0abcdef1234567890",
  "instanceType": "t2.micro"
}
```

**Parameters**:
- `imageId`: The AMI ID to use for the new instance
- `instanceType`: The EC2 instance type (e.g., t2.micro, t3.small)

**Response**: Returns details of the newly launched instance.

## Implementation Details

### EC2 Controller

The controller handles HTTP requests and applies the necessary guards and role decorators:

```typescript
@ApiTags('EC2')
@ApiBearerAuth()
@UseGuards(CognitoGuard, RolesGuard)
@Controller('ec2')
export class Ec2Controller {
  constructor(private readonly ec2Service: Ec2Service) {}

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'List all EC2 instances' })
  list() {
    return this.ec2Service.listInstances();
  }

  // Additional endpoints for start, stop, terminate, and launch
}
```

### EC2 Service

The service contains the business logic and interacts with the AWS SDK:

```typescript
@Injectable()
export class Ec2Service {
  private ec2: EC2Client;

  constructor(private configService: ConfigService) {
    this.ec2 = new EC2Client({
      region: this.configService.get<string>('AWS_REGION')!,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });
  }

  // Methods for listing, starting, stopping, terminating, and launching instances
}
```

### Launch Instance DTO

The DTO defines the data structure for launching new instances:

```typescript
export type InstanceTypeEnum =
  | 't2.micro'
  | 't2.small'
  | 't3.micro'
  | 't3.small'
  | 't3.medium'
  | 't3.large';

export class LaunchInstanceDto {
  @ApiProperty({ example: 'ami-0abcdef1234567890' })
  imageId: string;

  @ApiProperty({
    example: 't2.micro',
    enum: ['t2.micro', 't2.small', 't3.micro'],
  })
  instanceType: InstanceTypeEnum;
}
```

## Configuration

The EC2 module requires the following environment variables:

```
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

These credentials should have the necessary IAM permissions to perform EC2 operations.

## Best Practices

1. **IAM Permissions**: Use the principle of least privilege when creating IAM credentials for EC2 operations
2. **Error Handling**: Implement proper error handling for AWS SDK errors
3. **Logging**: Log all EC2 operations for audit purposes
4. **Rate Limiting**: Consider implementing rate limiting to prevent abuse
5. **Cost Monitoring**: Set up AWS budgets and alerts to monitor EC2 costs

## Security Considerations

1. **Access Control**: Only administrators should have access to EC2 operations
2. **Credential Management**: Store AWS credentials securely and rotate them regularly
3. **Audit Logging**: Log all EC2 operations for security auditing
4. **Instance Security**: Ensure launched instances follow security best practices (security groups, etc.)

## Future Enhancements

1. **Additional Parameters**: Support more parameters for launching instances (security groups, key pairs, etc.)
2. **Instance Monitoring**: Add endpoints for monitoring instance metrics
3. **Auto Scaling**: Support for managing Auto Scaling groups
4. **Scheduled Operations**: Allow scheduling of start/stop operations
5. **Cost Optimization**: Add features for cost optimization recommendations

## Integration with Other Modules

The EC2 module integrates with:

1. **Auth Module**: For authentication and authorization
2. **Admin Module**: For role-based access control
3. **AWS Module**: For shared AWS configurations and utilities

## Troubleshooting

Common issues and solutions:

1. **Access Denied**: Verify IAM permissions and role assignments
2. **Instance Not Found**: Ensure the instance ID is correct and the instance exists
3. **Rate Limiting**: AWS may rate limit API calls if too many are made in a short period
4. **Credential Issues**: Verify AWS credentials are correctly configured in environment variables
