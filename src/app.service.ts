import {Inject, Injectable} from '@nestjs/common';
import {EntityManager} from "typeorm";
import puppeteer, {Browser, Page} from "puppeteer";
import * as fs from 'fs';
import {getCurrentSchoolScore} from "./service/SchoolSpider";
import {SchoolScore} from "./entity/SchoolScore";
import {getCurrentSubjectScore} from "./service/SubjectSpider";
import {SubjectScore} from "./entity/SubjectScore";

@Injectable()
export class AppService {
  @Inject(EntityManager)
  private entityManager: EntityManager;

  public async getSchoolScoreService(): Promise<void> {
    // 从 school_code.json 文件读取，结构为 {"number":{"school_id", "name"}}，只要 "school_id" 和 "name"
    let schoolMapping = this.getSchoolMapping();
    // 无头浏览器设置
    const {browser, page} = await this.puppeteerInit();

    for (const [schoolId, schoolName] of Object.entries(schoolMapping)) {
      let currentSchoolScoreList = [];
      const url = `https://www.gaokao.cn/school/${schoolId}/provinceline`;
      await page.goto(url);
      await getCurrentSchoolScore(currentSchoolScoreList, schoolId, schoolName, page);
      const entities = currentSchoolScoreList.map(score =>
        this.entityManager.create(SchoolScore, score)
      );
      await this.entityManager.save(entities);
      console.log(`${schoolName} 学校成功爬取`)
    }
    await browser.close();
  }

  public async getSubjectScoreService(): Promise<void> {
    // 从 school_code.json 文件读取，结构为 {"number":{"school_id", "name"}}，只要 "school_id" 和 "name"
    let schoolMapping = this.getSchoolMapping();
    // 无头浏览器设置
    const {browser, page} = await this.puppeteerInit();

    for (const [schoolId, schoolName] of Object.entries(schoolMapping)) {
      let currentSubjectScoreList = [];
      const url = `https://www.gaokao.cn/school/${schoolId}/provinceline`;
      await page.goto(url);
      await getCurrentSubjectScore(currentSubjectScoreList, schoolId, schoolName, page);
      const entities = currentSubjectScoreList.map(score =>
        this.entityManager.create(SubjectScore, score)
      );
      await this.entityManager.save(entities);
      console.log(`${schoolName} 专业成功爬取`)
    }
    await browser.close();
  }


  private async puppeteerInit(): Promise<{ browser: Browser; page: Page }> {
    const browser = await puppeteer.launch({
      // headless: false,
      defaultViewport: null
    });
    const page = await browser.newPage();
    const cookieString = fs.readFileSync("resources/cookie.txt", "utf-8");
    const cookies = cookieString.split(';').map(pair => {
      const [name, value] = pair.split('=').map(part => part.trim());
      return {name, value, domain: 'www.gaokao.cn'};
    });
    await page.setCookie(...cookies);
    return {browser, page};
  }

  private getSchoolMapping() {
    const schoolCodeString: string = fs.readFileSync("resources/school_code.json", "utf-8");
    const schoolCode: { [key: string]: SchoolData } = JSON.parse(schoolCodeString);
    let schoolMapping: SchoolMapping = Object.entries(schoolCode).reduce<SchoolMapping>((acc, [number, {
      school_id,
      name
    }]) => {
      acc[school_id] = name;
      return acc;
    }, {});
    // schoolMapping = {'1541': '昌吉职业技术学院'};
    schoolMapping = {'109': '东南大学'};
    // schoolMapping 中 school_id < 47 的去掉
    // for (let i = 1; i < 47; i++) {
    //   delete schoolMapping[i.toString()];
    // }
    return schoolMapping;
  }
}

type SchoolData = { school_id: string; name: string };
type SchoolMapping = { [key: string]: string };

