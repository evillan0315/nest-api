import { ApiProperty } from '@nestjs/swagger';

export class CreateContainerDto {
  @ApiProperty({
    description: 'The Docker image to use for the container',
    example: 'nginx:latest',
  })
  image: string;

  @ApiProperty({
    description: 'Optional name for the container',
    example: 'my-nginx-container',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'Command to run in the container',
    example: ['npm', 'start'],
    required: false,
    type: [String],
  })
  cmd?: string[];

  @ApiProperty({
    description: 'Port mappings (containerPort: hostPort)',
    example: { '80/tcp': '8080' },
    required: false,
    type: Object,
  })
  ports?: { [containerPort: string]: string };

  @ApiProperty({
    description: 'Environment variables in KEY=VALUE format',
    example: ['NODE_ENV=production', 'PORT=3000'],
    required: false,
    type: [String],
  })
  env?: string[];
}
