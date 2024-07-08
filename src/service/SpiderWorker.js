import { parentPort } from 'node:worker_threads';
import { readFileSync } from 'node:fs';
import { launch } from 'puppeteer';
import { getCurrentSchoolScore } from './SchoolSpider';
import { getCurrentSubjectScore } from './SubjectSpider';
import { getCurrentEnrollmentPlan } from './EnrollmentSpider';

const functionMapping = [
  getCurrentSchoolScore,
  getCurrentSubjectScore,
  getCurrentEnrollmentPlan,
];
parentPort.addEventListener('message', async (event) => {
  let { schoolMappingForWorker, f } = event.data;
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
    await f(currentList, schoolId, schoolName, page);
    parentPort.postMessage({ currentList, schoolId, schoolName });
  }
  await browser.close();
}

async function puppeteerInit() {
  const browser = await launch({
    // headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  const cookieString = readFileSync('resources/cookie.txt', 'utf-8');
  const cookies = cookieString.split(';').map((pair) => {
    const [name, value] = pair.split('=').map((part) => part.trim());
    return { name, value, domain: 'www.gaokao.cn' };
  });
  await page.setCookie(...cookies);
  return { browser, page };
}
