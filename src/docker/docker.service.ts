// src/docker/docker.service.ts
import { Injectable } from '@nestjs/common';
import * as Docker from 'dockerode';
import { CreateContainerDto } from './dto/create-container.dto';

@Injectable()
export class DockerService {
  private docker = new Docker();

  async createContainer(dto: CreateContainerDto) {
    const portBindings = {};
    const exposedPorts = {};

    if (dto.ports) {
      for (const [containerPort, hostPort] of Object.entries(dto.ports)) {
        portBindings[containerPort] = [{ HostPort: hostPort }];
        exposedPorts[containerPort] = {};
      }
    }

    const container = await this.docker.createContainer({
      Image: dto.image,
      name: dto.name,
      Cmd: dto.cmd,
      Env: dto.env,
      ExposedPorts: exposedPorts,
      HostConfig: {
        PortBindings: portBindings,
      },
    });

    return container.id;
  }

  async startContainer(containerId: string) {
    const container = this.docker.getContainer(containerId);
    await container.start();
    return { message: `Container ${containerId} started.` };
  }

  async stopContainer(containerId: string) {
    const container = this.docker.getContainer(containerId);
    await container.stop();
    return { message: `Container ${containerId} stopped.` };
  }

  async restartContainer(containerId: string) {
    const container = this.docker.getContainer(containerId);
    await container.restart();
    return { message: `Container ${containerId} restarted.` };
  }

  async removeContainer(containerId: string) {
    const container = this.docker.getContainer(containerId);
    await container.remove({ force: true });
    return { message: `Container ${containerId} removed.` };
  }

  async listContainers(all = true) {
    return this.docker.listContainers({ all });
  }
}
