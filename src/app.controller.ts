import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SchoolScore } from './entity/SchoolScore';
import { SubjectScore } from './entity/SubjectScore';
import { EnrollmentPlan } from './entity/EnrollmentPlan';

@Controller()
export class AppController {
  private functionMapping = [
    { entityType: SchoolScore, f: 0 },
    { entityType: SubjectScore, f: 1 },
    { entityType: EnrollmentPlan, f: 2 },
  ];

  constructor(private readonly appService: AppService) {}

  @Get('school-spider')
  async schoolSpider() {
    await this.appService.spiderService(
      this.functionMapping[0].entityType,
      this.functionMapping[0].f,
    );
  }

  @Get('subject-spider')
  async subjectSpider() {
    await this.appService.spiderService(
      this.functionMapping[1].entityType,
      this.functionMapping[1].f,
    );
  }

  @Get('enrollment-spider')
  async enrollmentSpider() {
    await this.appService.spiderService(
      this.functionMapping[2].entityType,
      this.functionMapping[2].f,
    );
  }

  @Get('school-info-spider')
  async schoolInfoSpider() {
    await this.appService.getSchoolInfoService();
  }
}
