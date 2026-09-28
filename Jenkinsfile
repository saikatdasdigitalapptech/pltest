pipeline {
  agent { label 'playwright-linux' }
  options { timestamps(); disableConcurrentBuilds(); timeout(time: 30, unit: 'MINUTES') }
  parameters {
    choice(name: 'SUITE', choices: ['smoke', 'regression', 'cross-browser', 'mobile', 'audit', 'api'], description: 'Test suite')
  }
  environment { CI = 'true'; WORKERS = '2'; RETRIES = '1' }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Install') { steps { sh 'npm ci'; sh 'npx playwright install chromium firefox webkit' } }
    stage('Quality') { steps { sh 'npm run check'; sh 'npm run test:framework' } }
    stage('Test') { steps { sh 'node scripts/run-suite.mjs "$SUITE"' } }
  }
  post {
    always {
      junit allowEmptyResults: true, testResults: 'reports/junit/results.xml'
      archiveArtifacts allowEmptyArchive: true, artifacts: 'reports/**,test-results/**'
    }
  }
}
