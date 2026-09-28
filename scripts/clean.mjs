import { rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function cleanOutputs(root) {
  for (const directory of [
    'reports',
    'test-results',
    'allure-results',
    'allure-report',
    'blob-report',
  ]) {
    rmSync(path.join(root, directory), { recursive: true, force: true });
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  cleanOutputs(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'));
}
