import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchoolScore } from './entity/SchoolScore';
import { SubjectScore } from './entity/SubjectScore';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentPlan } from './entity/EnrollmentPlan';
import { SchoolInfo } from './entity/SchoolInfo';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'szw',
      password: '123456',
      database: 'gaokao',
      synchronize: true,
      logging: false,
      entities: [SchoolScore, SubjectScore, EnrollmentPlan, SchoolInfo],
      poolSize: 10,
      connectorPackage: 'mysql2',
      extra: {
        authPlugin: 'sha256_password',
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
