import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./insurance-tests',fullyParallel:true,workers:process.env.CI?2:4,
 retries:process.env.CI?1:0,timeout:45000,
 reporter:[['list'],['html',{outputFolder:'insurance-report',open:'never'}],['junit',{outputFile:'insurance-results/junit.xml'}]],
 outputDir:'insurance-results/artifacts',
 use:{baseURL:'http://127.0.0.1:4177',trace:'retain-on-failure',screenshot:'only-on-failure',video:'retain-on-failure'},
 projects:[{name:'chromium',use:{...devices['Desktop Chrome']}},{name:'firefox',use:{...devices['Desktop Firefox']}},{name:'webkit',use:{...devices['Desktop Safari']}}],
 webServer:{command:'node insurance-app/server.mjs',url:'http://127.0.0.1:4177/health',reuseExistingServer:!process.env.CI,timeout:20000}
});