import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServerService } from './server.service';
import { JwtAuthGuard } from '../../../auth/jwt.guard';
import * as os from 'os';

@ApiTags('Monitor - Server')
@Controller('monitor/server')
@UseGuards(JwtAuthGuard)
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Get('info')
  @ApiOperation({ summary: 'Get server info' })
  async info() {
    const cpuCount = os.cpus().length;
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpus = os.cpus().slice(0, cpuCount).map((cpu) => ({
      model: cpu.model,
      speed: cpu.speed,
      times: cpu.times,
    }));

    return {
      os: os.platform() + ' ' + os.arch(),
      cpuCount,
      cpuUsage: this.calculateCpuUsage(cpus),
      mem: {
        total: this.formatBytes(totalMem),
        used: this.formatBytes(usedMem),
        free: this.formatBytes(freeMem),
        usage: ((usedMem / totalMem) * 100).toFixed(1) + '%',
      },
      uptime: this.formatUptime(os.uptime()),
      hostname: os.hostname(),
    };
  }

  private calculateCpuUsage(cpus: any[]) {
    let totalIdle = 0;
    let totalTick = 0;
    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    }
    const usage = ((1 - totalIdle / totalTick) * 100).toFixed(1);
    return usage + '%';
  }

  private formatBytes(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }

  private formatUptime(seconds: number) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return d + 'd ' + h + 'h ' + m + 'm';
  }
}