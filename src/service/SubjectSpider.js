const citySelector = '#scoreline > div > div.flex-scx.mb20 > div > div:nth-child(1)';
const yearSelector = '#scoreline > div > div.flex-scx.mb20 > div > div:nth-child(2)';
const wenliSelector = '#scoreline > div > div.flex-scx.mb20 > div > div:nth-child(3)';
const piciSelector = '#scoreline > div > div.flex-scx.mb20 > div > div:nth-child(4)';
const schoolTableSelector = '#scoreline > div > div:nth-child(2) > div > table';
const dropdownSelector = '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-dropdown-menu-item';
// const '#scoreline > div > div.laypage > div';
const timeoutSelector = 300

export async function getCurrentSubjectScore(currentSubjectScoreList, schoolId, schoolName, page) {
  await page.waitForSelector(citySelector); // 等待选择器加载完成
  const cityOptions = await selectOptions(citySelector, page);
  for (const cityOption of cityOptions) {
    await cityOption.evaluate(b => b.click());
    const city = await cityOption.evaluate(b => b.textContent);
    await new Promise(resolve => setTimeout(resolve, timeoutSelector));
    const yearOptions = await selectOptions(yearSelector, page);
    for (const yearOption of yearOptions) {
      await yearOption.evaluate(b => b.click());
      const year = await yearOption.evaluate(b => b.textContent);
      await new Promise(resolve => setTimeout(resolve, timeoutSelector));
      const wenliOptions = await selectOptions(wenliSelector, page);
      for (const wenliOption of wenliOptions) {
        await wenliOption.evaluate(b => b.click());
        const wenli = await wenliOption.evaluate(b => b.textContent);
        await new Promise(resolve => setTimeout(resolve, timeoutSelector));
        const piciOptions = await selectOptions(piciSelector, page);
        for (const piciOption of piciOptions) {
          await piciOption.evaluate(b => b.click());
          const pici = await piciOption.evaluate(b => b.textContent);
          await new Promise(resolve => setTimeout(resolve, timeoutSelector));
          let knownSubjectScoreFields = {schoolId, schoolName, city, year, wenli, pici};
          let currentSubjectScore = await getCurrentSubjectScoreBySelector(page);
          currentSubjectScore = currentSubjectScore.map(score => {
            return {...knownSubjectScoreFields, ...score}
          })
          currentSubjectScoreList.push(...currentSubjectScore);
        }
      }
    }
  }
}

async function selectOptions(selector, page) {
  await page.click(selector);
  await page.waitForSelector(dropdownSelector, {visible: true});
  return await page.$$(dropdownSelector);
}

async function getCurrentSubjectScoreBySelector(page) {
  return await page.$eval(schoolTableSelector, table => {
    return Array.from(table.querySelectorAll('tbody > tr')).map(row => {
      const columns = row.querySelectorAll('td');
      return {
        subjectName: columns[0].textContent.trim(),
        admissionBatch: columns[1].textContent.trim(),
        minScorePosition: columns[3].textContent.trim(),
        subjectRequirements: columns[4]?.textContent.trim()
      }
    });
  });
}
