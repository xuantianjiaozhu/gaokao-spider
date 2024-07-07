import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('school-spider')
  async schoolSpider() {
    await this.appService.getSchoolScoreService();
  }

  @Get('subject-spider')
  async subjectSpider() {
    await this.appService.getSubjectScoreService();
  }
}
