import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('start-spider')
  async startSpider() {
    await this.appService.getSchoolScoreService();
  }
}
