import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanOutputs } from './clean.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const [suite = 'smoke', ...extra] = process.argv.slice(2);
const suites = {
  smoke: ['--project=chromium', '--grep=@smoke'],
  regression: ['--project=chromium'],
  'cross-browser': ['--project=chromium', '--project=firefox', '--project=webkit'],
  mobile: ['--project=mobile-chrome', '--project=mobile-safari', '--project=tablet'],
  api: ['--project=api'],
  a11y: ['--project=audit', '--grep=@a11y'],
  audit: ['--project=audit'],
  framework: ['--project=framework'],
  all: [],
  visual: ['--project=visual'],
  scheduler: ['--project=scheduler'],
};
if (!(suite in suites))
  throw new Error(`Unknown suite: ${suite}. Choices: ${Object.keys(suites).join(', ')}`);
const childEnv = { ...process.env };
if (suite === 'visual') childEnv.ENABLE_VISUAL = 'true';
if (suite === 'scheduler') childEnv.ENABLE_SCHEDULER = 'true';
if (extra.includes('--allure')) childEnv.ENABLE_ALLURE = 'true';
// Run from one checkout per job. Cleaning avoids mixing results/retries across separate runs.
cleanOutputs(root);
const cli = path.join(root, 'node_modules', '@playwright', 'test', 'cli.js');
const child = spawn(
  process.execPath,
  [cli, 'test', ...suites[suite], ...extra.filter((arg) => arg !== '--allure')],
  {
    cwd: root,
    env: childEnv,
    stdio: 'inherit',
    shell: false,
  },
);
child.on('error', (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
