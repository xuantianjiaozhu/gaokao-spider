const citySelector =
  '#proline > div > div.flex-scx.mb20 > div > div:nth-child(1)';
const yearSelector =
  '#proline > div > div.flex-scx.mb20 > div > div:nth-child(2)';
const wenliSelector =
  '#proline > div > div.flex-scx.mb20 > div > div:nth-child(3)';
const schoolTableSelector = '#proline > div > div:nth-child(2) > div > table';
const dropdownSelector =
  '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-dropdown-menu-item';

const timeoutSelector = 300;

export async function getCurrentSchoolScore(
  currentSchoolScoreList,
  schoolId,
  schoolName,
  page,
) {
  await page.waitForSelector(citySelector); // 等待选择器加载完成
  const cityOptions = await selectOptions(citySelector, page);
  for (const cityOption of cityOptions) {
    await cityOption.evaluate((b) => b.click());
    const city = await cityOption.evaluate((b) => b.textContent);
    if (city === '省份' && cityOptions.length <= 1) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, timeoutSelector));
    const yearOptions = await selectOptions(yearSelector, page);
    for (const yearOption of yearOptions) {
      await yearOption.evaluate((b) => b.click());
      const year = await yearOption.evaluate((b) => b.textContent);
      await new Promise((resolve) => setTimeout(resolve, timeoutSelector));
      const wenliOptions = await selectOptions(wenliSelector, page);
      for (const wenliOption of wenliOptions) {
        await wenliOption.evaluate((b) => b.click());
        const wenli = await wenliOption.evaluate((b) => b.textContent);
        await new Promise((resolve) => setTimeout(resolve, timeoutSelector));
        let knownSchoolScoreFields = {
          schoolId,
          schoolName,
          city,
          year,
          wenli,
        };
        let currentSchoolScore = await getCurrentSchoolScoreBySelector(page);
        currentSchoolScore = currentSchoolScore.map((score) => {
          return { ...knownSchoolScoreFields, ...score };
        });
        currentSchoolScoreList.push(...currentSchoolScore);
      }
    }
  }
}

async function selectOptions(selector, page) {
  await page.evaluate((selector) => {
    document.querySelector(selector).click();
  }, selector);
  await page.waitForSelector(dropdownSelector, { visible: true });
  return await page.$$(dropdownSelector);
}

async function getCurrentSchoolScoreBySelector(page) {
  return await page.$eval(schoolTableSelector, (table) => {
    return Array.from(table.querySelectorAll('tbody > tr')).map((row) => {
      const columns = row.querySelectorAll('td');
      return {
        admissionBatch: columns[1].textContent.trim(),
        enrollmentType: columns[2].textContent.trim(),
        minScorePosition: columns[3].textContent.trim(),
        provinceControlLine: columns[5].textContent.trim(),
        majorGroup: columns[6]?.textContent.trim(),
        subjectRequirements: columns[7]?.textContent.trim(),
      };
    });
  });
}
