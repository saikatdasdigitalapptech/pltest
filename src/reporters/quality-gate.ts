import { mkdirSync, writeFileSync } from 'node:fs';
import type { FullResult, Reporter, Suite } from '@playwright/test/reporter';

export default class QualityGateReporter implements Reporter {
  private suite?: Suite;
  onBegin(_config: unknown, suite: Suite): void {
    this.suite = suite;
  }
  onEnd(result: FullResult): void {
    const tests = this.suite?.allTests() ?? [];
    const count = (outcome: string) => tests.filter((test) => test.outcome() === outcome).length;
    mkdirSync('reports', { recursive: true });
    writeFileSync(
      'reports/quality-summary.json',
      JSON.stringify(
        {
          status: result.status,
          total: tests.length,
          expected: count('expected'),
          unexpected: count('unexpected'),
          flaky: count('flaky'),
          skipped: count('skipped'),
          durationMs: result.duration,
          note: 'CI fails on unexpected failures and flaky tests. Skipped optional suites are not passes.',
        },
        null,
        2,
      ),
    );
  }
}
