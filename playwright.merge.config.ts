import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['html', { outputFolder: 'reports/merged-html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/merged.xml' }],
  ],
});
