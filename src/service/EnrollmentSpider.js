const citySelector =
  '#zs_plan > div > div.flex-scx.mb20 > div > div:nth-child(1)';
const yearSelector =
  '#zs_plan > div > div.flex-scx.mb20 > div > div:nth-child(2)';
const wenliSelector =
  '#zs_plan > div > div.flex-scx.mb20 > div > div:nth-child(3)';
const piciSelector =
  '#zs_plan > div > div.flex-scx.mb20 > div > div:nth-child(4)';
const enrollmentTableSelector =
  '#zs_plan > div > div:nth-child(2) > div > table';
const dropdownSelector =
  '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-dropdown-menu-item';
const pageSelector =
  '#zs_plan > div > div.laypage > div > ul > li.ant-pagination-next';
const timeoutSelector = 300;

export async function getCurrentEnrollmentPlan(
  currentEnrollmentPlanList,
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
        const piciOptions = await selectOptions(piciSelector, page);
        for (const piciOption of piciOptions) {
          await piciOption.evaluate((b) => b.click());
          const pici = await piciOption.evaluate((b) => b.textContent);
          await new Promise((resolve) => setTimeout(resolve, timeoutSelector));
          let knownEnrollmentPlanFields = {
            schoolId,
            schoolName,
            city,
            year,
            wenli,
            pici,
          };
          let currentEnrollmentPlan =
            await getCurrentEnrollmentPlanBySelector(page);
          currentEnrollmentPlan = currentEnrollmentPlan.map(
            (enrollmentPlan) => {
              return { ...knownEnrollmentPlanFields, ...enrollmentPlan };
            },
          );
          currentEnrollmentPlanList.push(...currentEnrollmentPlan);
        }
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

async function getCurrentEnrollmentPlanBySelector(page) {
  let results = [];

  while (true) {
    const currentPageData = await page.$eval(
      enrollmentTableSelector,
      (table) => {
        return Array.from(table.querySelectorAll('tbody > tr')).map((row) => {
          const columns = row.querySelectorAll('td');
          return {
            subjectName: columns[0].textContent.trim(),
            enrollmentNumber: columns[1].textContent.trim(),
            studyYear: columns[2].textContent.trim(),
            tuition: columns[3].textContent.trim(),
            subjectRequirements:
              columns[4]?.textContent.trim() === '填报'
                ? null
                : columns[4]?.textContent.trim(),
          };
        });
      },
    );
    results = results.concat(currentPageData);
    const nextPageExists = await page.evaluate((pageSelector) => {
      const nextPageButton = document.querySelector(pageSelector);
      return nextPageButton?.ariaDisabled === 'false';
    }, pageSelector);
    if (!nextPageExists) {
      break;
    }

    await page.click(pageSelector);
    // await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await new Promise((resolve) => setTimeout(resolve, timeoutSelector));
  }
  return results;
}
