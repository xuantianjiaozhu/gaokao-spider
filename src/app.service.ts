import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'node:path';
import { Worker } from 'worker_threads';

declare const __dirname: string;

@Injectable()
export class AppService {
  @Inject(EntityManager)
  private entityManager: EntityManager;

  private static getSchoolMapping() {
    const schoolCodeString: string = fs.readFileSync(
      'resources/school_code.json',
      'utf-8',
    );
    const schoolCode: { [key: string]: SchoolData } =
      JSON.parse(schoolCodeString);
    return Object.entries(schoolCode).reduce<SchoolMapping>(
      (acc, [, { school_id, name }]) => {
        acc[school_id] = name;
        return acc;
      },
      {},
    );
  }

  public async spiderService(entityType, f: number): Promise<void> {
    // 从 school_code.json 文件读取，结构为 {"number":{"school_id", "name"}}，只要 "school_id" 和 "name"
    const schoolMapping = AppService.getSchoolMapping();
    const workerScript = path.join(__dirname, 'SpiderWorker.js');
    const workers: Worker[] = [];
    const rangeSize = 1000; // 每个 worker 处理 1000 个 schoolId
    let startId = 1;

    const logFilePath = path.join(__dirname, `../src/log/${f}`);
    if (!fs.existsSync(logFilePath)) {
      fs.mkdirSync(logFilePath, { recursive: true });
    }

    // schoolId < 3800
    while (startId < 3800) {
      const endId = startId + rangeSize - 1;
      const schoolMappingForWorker: SchoolMapping = {};
      for (let schoolId = startId; schoolId <= endId; schoolId++) {
        if (!schoolMapping.hasOwnProperty(schoolId.toString())) continue;
        const schoolName = schoolMapping[schoolId.toString()];
        // 查找数据库的表中是否有 schoolName 的数据，如果有就跳过
        const count = await this.entityManager
          .getRepository(entityType)
          .createQueryBuilder('s')
          .where('s.schoolName = :schoolName', { schoolName })
          .getCount();
        if (count === 0) {
          schoolMappingForWorker[schoolId.toString()] = schoolName;
        }
      }
      // schoolMappingForWorker = { '1541': '昌吉职业技术学院' } as SchoolMapping;
      const workerData = {
        schoolMappingForWorker,
        f,
        logFilePath,
      };
      const worker = new Worker(workerScript);
      worker.postMessage(workerData);
      worker.on('message', async (e) => {
        const entities = e.currentList.map((score) =>
          this.entityManager.create(entityType, score),
        );
        await this.entityManager.save(entities);
        // 写 `${__dirname}/log/${f}/${school.schoolId // 100}.txt` 文件
        fs.appendFileSync(
          logFilePath + `/${Math.floor(e.schoolId / 100)}.txt`,
          `${e.schoolName} ${e.schoolId} ${f} 成功爬取\n`,
        );
      });
      worker.on('error', (error) => {
        fs.appendFileSync(
          logFilePath + '/error.txt',
          `Worker error: ${error}\n`,
        );
      });
      worker.on('exit', (code) => {
        if (code !== 0) {
          fs.appendFileSync(
            logFilePath + '/error.txt',
            `Worker stopped with exit code ${code}`,
          );
        } else {
          fs.appendFileSync(
            logFilePath + '/error.txt',
            'Worker exited successfully',
          );
        }
      });
      workers.push(worker);
      startId += rangeSize;
    }

    // Optionally wait for all workers to finish
    await Promise.all(
      workers.map(
        (worker) =>
          new Promise((resolve, reject) => {
            worker.on('exit', resolve);
            worker.on('error', reject);
          }),
      ),
    );
  }

  // public async getSchoolInfoService(): Promise<void> {
  //   // 从 school_code.json 文件读取，结构为 {"number":{"school_id", "name"}}，只要 "school_id" 和 "name"
  //   const schoolMapping = this.getSchoolMapping();
  //   // 无头浏览器设置
  //   const { browser, page } = await this.puppeteerInit();
  //
  //   for (const [schoolId, schoolName] of Object.entries(schoolMapping)) {
  //     const url = `https://www.gaokao.cn/school/${schoolId}`;
  //     await page.goto(url);
  //     await getCurrentSchoolInfo(schoolId, schoolName, page);
  //     const entities = currentEnrollmentPlanList.map((enrollmentPlan) =>
  //       this.entityManager.create(EnrollmentPlan, enrollmentPlan),
  //     );
  //     await this.entityManager.save(entities);
  //     console.log(`${schoolName} 学校信息成功爬取`);
  //   }
  //   await browser.close();
  // }
}

type SchoolData = { school_id: string; name: string };
type SchoolMapping = { [key: string]: string };
