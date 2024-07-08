import { parentPort } from 'node:worker_threads';
import { launch } from 'puppeteer';
import { getCurrentSchoolScore } from './service/SchoolSpider';
import { getCurrentSubjectScore } from './service/SubjectSpider';
import { getCurrentEnrollmentPlan } from './service/EnrollmentSpider';
import * as fs from 'node:fs';
import path from 'node:path';

const functionMapping = [
  getCurrentSchoolScore,
  getCurrentSubjectScore,
  getCurrentEnrollmentPlan,
];

let logFilePath;
parentPort.addEventListener('message', async (event) => {
  let { schoolMappingForWorker, f } = event.data;
  logFilePath = path.join(__dirname, `../src/log/${f}`);
  if (!fs.existsSync(logFilePath)) {
    fs.mkdirSync(logFilePath, { recursive: true });
  }
  f = functionMapping[f];
  await fetchSchoolDataRange.call(this, schoolMappingForWorker, f);
});

async function fetchSchoolDataRange(schoolMappingForWorker, f) {
  // 无头浏览器设置
  const { browser, page } = await puppeteerInit();
  for (const [schoolId, schoolName] of Object.entries(schoolMappingForWorker)) {
    const currentList = [];
    const url = `https://www.gaokao.cn/school/${schoolId}/provinceline`;
    await page.goto(url);
    try {
      await f(currentList, schoolId, schoolName, page);
      parentPort.postMessage({ currentList, schoolId, schoolName });
    } catch (e) {
      fs.writeFileSync(
        logFilePath + '/error.txt',
        `Error: ${schoolId} ${schoolName} ${f.name}. Exception: ${e}`,
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
