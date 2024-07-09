import { parentPort } from 'node:worker_threads';
import { launch } from 'puppeteer';
import { getCurrentSchoolScore } from './service/SchoolSpider';
import { getCurrentSubjectScore } from './service/SubjectSpider';
import { getCurrentEnrollmentPlan } from './service/EnrollmentSpider';
import * as fs from 'node:fs';

const functionMapping = [
  getCurrentSchoolScore,
  getCurrentSubjectScore,
  getCurrentEnrollmentPlan,
];

parentPort.addEventListener('message', async (event) => {
  let { schoolMappingForWorker, f, logFilePath } = event.data;
  f = functionMapping[f];
  await fetchSchoolDataRange.call(this, schoolMappingForWorker, f, logFilePath);
});

async function fetchSchoolDataRange(schoolMappingForWorker, f, logFilePath) {
  // 无头浏览器设置
  const { browser, page } = await puppeteerInit();
  for (const [schoolId, schoolName] of Object.entries(schoolMappingForWorker)) {
    const currentList = [];
    const url = `https://www.gaokao.cn/school/${schoolId}/provinceline`;
    try {
      await page.goto(url);
      await f(currentList, schoolId, schoolName, page);
      if (currentList.length > 0) {
        parentPort.postMessage({ currentList, schoolId, schoolName });
      } else {
        fs.appendFileSync(
          logFilePath + '/error.txt',
          `Error: ${schoolId} ${schoolName} ${f.name}. No data.\n`,
        );
      }
    } catch (e) {
      fs.appendFileSync(
        logFilePath + '/error.txt',
        `Error: ${schoolId} ${schoolName} ${f.name}. Exception: ${e}\n`,
      );
    }
  }
  await browser.close();
}

async function puppeteerInit() {
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
