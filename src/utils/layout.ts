import { expect } from '@playwright/test';
import type { Page, TestInfo } from '@playwright/test';

export async function assertNoOverflow(page: Page, testInfo: TestInfo): Promise<void> {
  const layout = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return {
      viewport: width,
      document: document.documentElement.scrollWidth,
      offenders: Array.from(document.querySelectorAll('main *'))
        .map((element) => {
          const box = element.getBoundingClientRect();
          return {
            tag: element.tagName,
            id: element.id,
            class: element.className,
            left: box.left,
            right: box.right,
            width: box.width,
          };
        })
        .filter((box) => box.width > 0 && (box.left < -1 || box.right > width + 1))
        .slice(0, 30),
    };
  });
  await testInfo.attach('layout-measurements', {
    body: JSON.stringify(layout, null, 2),
    contentType: 'application/json',
  });
  expect(
    layout.document,
    'Document must fit the viewport without horizontal scrolling',
  ).toBeLessThanOrEqual(layout.viewport + 1);
}
