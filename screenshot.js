import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function takeScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });

  // Screenshot of the original M&G HTML file
  console.log('Taking screenshot of original M&G page...');
  const originalPage = await context.newPage();
  const originalPath = path.resolve('C:/Users/billy/Documents/Development/m-and-g-prototype/private files/web page export/MandG Container.htm');
  await originalPage.goto(`file:///${originalPath.replace(/\\/g, '/')}`);
  await originalPage.waitForTimeout(2000);
  await originalPage.screenshot({
    path: path.join(__dirname, 'screenshots', 'original-mandg.png'),
    fullPage: false
  });
  console.log('Saved: screenshots/original-mandg.png');

  // Screenshot of our React app (need dev server running)
  console.log('Taking screenshot of React app...');
  const appPage = await context.newPage();
  try {
    await appPage.goto('http://localhost:5173', { timeout: 5000 });
    await appPage.waitForTimeout(2000);
    // Scroll to top to ensure proper initial view
    await appPage.evaluate(() => window.scrollTo(0, 0));
    await appPage.waitForTimeout(500);
    await appPage.screenshot({
      path: path.join(__dirname, 'screenshots', 'react-app.png'),
      fullPage: false
    });
    console.log('Saved: screenshots/react-app.png');
  } catch (e) {
    console.log('React app not running. Start it with: npm run dev');
  }

  await browser.close();
  console.log('Done!');
}

// Create screenshots directory
import fs from 'fs';
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

takeScreenshots();
