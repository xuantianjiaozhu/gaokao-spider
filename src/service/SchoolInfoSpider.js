const schoolTagSelector = '.school-tab_tags__1OGng';
const addressSelector = '.school-tab_adress__1WWI_';
const websiteSelector = '.school-tab_labelBox__1mz-A > div:nth-child(2)';
const phoneSelector = '.school-tab_labelBox__1mz-A > div:nth-child(3)';
const shisuSelector = '.school-gaikuang_shisuWrap__2O0RH';
const detailSelector = '.richContent';

export async function getCurrentSchoolInfo(schoolId, schoolName, page) {
  await page.waitForSelector(schoolTagSelector);
  const schoolTags = await page.evaluate((schoolTagSelector) => {
    const items = document.querySelectorAll(`${schoolTagSelector} > div`);
    return Array.from(items)
      .map((div) => div.textContent.trim())
      .join(', ');
  }, schoolTagSelector);
  const address = await page.evaluate((addressSelector) => {
    return document.querySelector(addressSelector).textContent.trim();
  }, addressSelector);
  const website = await page.evaluate((websiteSelector) => {
    const websiteDiv = document.querySelector(websiteSelector);
    return websiteDiv.textContent.trim().replace('官方网址：', '');
  }, websiteSelector);
  const phone = await page.evaluate((phoneSelector) => {
    const phoneDiv = document.querySelector(phoneSelector);
    return phoneDiv.textContent.trim().replace('招生电话：', '');
  }, phoneSelector);
  const shisu = await page.evaluate(
    (shisuSelector) => document.querySelector(shisuSelector)?.innerText,
    shisuSelector,
  );
  const detailUrl = `https://www.gaokao.cn/school/${schoolId}/introDetails`;
  await page.goto(detailUrl);
  let detail;
  try {
    await page.waitForSelector(detailSelector);
    detail = await page.evaluate(
      (detailSelector) => document.querySelector(detailSelector).innerText,
      detailSelector,
    );
  } catch (e) {
    detail = null;
  }

  return {
    schoolId,
    schoolName,
    tags: schoolTags,
    address,
    website,
    phone,
    shisu,
    detail,
  };
}
