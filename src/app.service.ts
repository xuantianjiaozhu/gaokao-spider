import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'node:path';
import { Worker } from 'worker_threads';
import { getCurrentSchoolInfo } from './service/SchoolInfoSpider';
import { SchoolInfo } from './entity/SchoolInfo';
import { launch } from 'puppeteer';

declare const __dirname: string;

@Injectable()
export class AppService {
  @Inject(EntityManager)
  private entityManager: EntityManager;

  public static async puppeteerInit() {
    const browser = await launch({
      // headless: false,
      defaultViewport: null,
    });
    const page = await browser.newPage();
    const cookieString = fs.readFileSync('resources/cookie.txt', 'utf-8');
    const cookies = cookieString.split(';').map((pair) => {
      const [name, value] = pair.split('=').map((part) => part.trim());
      return { name, value, domain: 'www.gaokao.cn' };
    });
    await page.setCookie(...cookies);
    return { browser, page };
  }

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

    const logFilePath = path.join(__dirname, `../src/log/${f}`);
    if (!fs.existsSync(logFilePath)) {
      fs.mkdirSync(logFilePath, { recursive: true });
    }
    await this.processSchoolMapping(schoolMapping, entityType);

    // f = 0 用 2 个工作线程，f = 1 或 2 用 10 个工作线程
    // schoolMapping 里的数据按工作线程编号取模分配
    const workerNum = 8;
    for (let i = 0; i < workerNum; i++) {
      const schoolMappingForWorker: SchoolMapping = {};
      for (const [schoolId, schoolName] of Object.entries(schoolMapping)) {
        if (parseInt(schoolId) % workerNum === i) {
          schoolMappingForWorker[schoolId] = schoolName;
        }
      }
      if (Object.keys(schoolMappingForWorker).length === 0) {
        continue;
      }
      const workerData = {
        schoolMappingForWorker,
        f,
        logFilePath,
      };
      const worker = new Worker(workerScript);
      worker.postMessage(workerData);
      worker.on('message', async (e) => {
        try {
          const entities = e.currentList.map((score) =>
            this.entityManager.create(entityType, score),
          );
          await this.entityManager.save(entities);
        } catch (error) {
          fs.appendFileSync(
            logFilePath + '/error.txt',
            `Error: ${e.schoolName} ${e.schoolId} ${f}: ${error}\n`,
          );
        }
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
            `Worker stopped with exit code ${code}\n`,
          );
        } else {
          fs.appendFileSync(
            logFilePath + '/error.txt',
            'Worker exited successfully\n',
          );
        }
      });
      workers.push(worker);
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

  public async getSchoolInfoService(): Promise<void> {
    // 从 school_code.json 文件读取，结构为 {"number":{"school_id", "name"}}，只要 "school_id" 和 "name"
    const schoolMapping = AppService.getSchoolMapping();
    // 无头浏览器设置
    const { browser, page } = await AppService.puppeteerInit();
    const logFilePath = path.join(__dirname, '../src/log/3');
    if (!fs.existsSync(logFilePath)) {
      fs.mkdirSync(logFilePath, { recursive: true });
    }
    await this.processSchoolMapping(schoolMapping, SchoolInfo);

    for (const [schoolId, schoolName] of Object.entries(schoolMapping)) {
      const url = `https://www.gaokao.cn/school/${schoolId}`;
      try {
        await page.goto(url);
        const schoolInfo = await getCurrentSchoolInfo(
          schoolId,
          schoolName,
          page,
        );
        await this.entityManager.save(SchoolInfo, schoolInfo);
        fs.appendFileSync(
          logFilePath + `/success.txt`,
          `${schoolName} ${schoolId} 3 成功爬取\n`,
        );
      } catch (error) {
        fs.appendFileSync(
          logFilePath + '/error.txt',
          `Error: ${schoolName} ${schoolId} 3: ${error}\n`,
        );
      }
    }
    await browser.close();
  }

  private async processSchoolMapping(schoolMapping: SchoolMapping, entityType) {
    const schoolNames = Object.values(schoolMapping);
    const counts: { schoolName: string; count: string }[] =
      await this.entityManager
        .getRepository(entityType)
        .createQueryBuilder('s')
        .select('s.school_name', 'schoolName')
        .addSelect('COUNT(s.id)', 'count')
        .where('s.school_name IN (:...schoolNames)', { schoolNames })
        .groupBy('s.school_name')
        .getRawMany();
    // schoolMapping 里去掉 counts
    counts.forEach(({ schoolName }) => {
      const schoolId = Object.keys(schoolMapping).find(
        (id) => schoolMapping[id] === schoolName,
      );
      if (schoolId) {
        delete schoolMapping[schoolId.toString()];
      }
    });
  }
}

type SchoolData = { school_id: string; name: string };
type SchoolMapping = { [key: string]: string };
