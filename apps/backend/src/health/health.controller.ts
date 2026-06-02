import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { SkipTransform } from '../common/decorators/skip-transform.decorator';
import { HealthService } from './health.service';

@Public()
@SkipTransform()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check() {
    return this.healthService.check();
  }
}
