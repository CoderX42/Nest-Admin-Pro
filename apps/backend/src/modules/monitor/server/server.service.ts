import { Injectable } from '@nestjs/common';
import * as os from 'os';

interface CpuSample {
  idle: number;
  tick: number;
}

@Injectable()
export class ServerService {
  private lastCpuSample: CpuSample | null = null;

  async getInfo() {
    const cpuCount = os.cpus().length;
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpus = os.cpus().slice(0, cpuCount).map((cpu) => ({
      model: cpu.model,
      speed: cpu.speed,
      times: cpu.times,
    }));

    // Take first sample
    const sample1 = this.takeCpuSample();
    // Wait a short interval for a meaningful delta
    await this.sleep(100);
    // Take second sample
    const sample2 = this.takeCpuSample();

    const cpuUsage = this.computeCpuDelta(sample1, sample2);

    return {
      os: os.platform() + ' ' + os.arch(),
      cpuCount,
      cpuModel: cpus[0]?.model || '',
      cpuUsage,
      mem: {
        total: this.formatBytes(totalMem),
        used: this.formatBytes(usedMem),
        free: this.formatBytes(freeMem),
        usage: ((usedMem / totalMem) * 100).toFixed(1) + '%',
      },
      uptime: this.formatUptime(os.uptime()),
      hostname: os.hostname(),
      loadAvg: os.loadavg().map((v) => v.toFixed(2)),
    };
  }

  private takeCpuSample(): CpuSample {
    const cpus = os.cpus();
    let idle = 0;
    let tick = 0;
    for (const cpu of cpus) {
      for (const type in cpu.times) {
        tick += (cpu.times as any)[type];
      }
      idle += cpu.times.idle;
    }
    return { idle, tick };
  }

  private computeCpuDelta(prev: CpuSample, curr: CpuSample): string {
    const idleDiff = curr.idle - prev.idle;
    const tickDiff = curr.tick - prev.tick;
    if (tickDiff <= 0) return '0.0%';
    const usage = ((1 - idleDiff / tickDiff) * 100).toFixed(1);
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

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}