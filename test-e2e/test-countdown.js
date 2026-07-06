const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream',
      '--mute-audio'
    ]
  });

  try {
    const page1 = await browser.newPage();
    const page2 = await browser.newPage();
    
    // Setup logs
    page1.on('console', msg => { if (!msg.text().includes('vite')) console.log('PAGE1:', msg.text()); });
    page2.on('console', msg => { if (!msg.text().includes('vite')) console.log('PAGE2:', msg.text()); });

    console.log('Connecting User 1...');
    await page1.goto('http://localhost:5173');
    await page1.waitForSelector('.generate-btn');
    await page1.click('.generate-btn');
    const roomCode = await page1.$eval('.input-field', el => el.value);
    await page1.click('.join-btn');
    await page1.waitForSelector('.room-container');

    console.log('Connecting User 2...');
    await page2.goto('http://localhost:5173');
    await page2.waitForSelector('.input-field');
    await page2.type('.input-field', roomCode);
    await page2.click('.join-btn');
    
    // Wait for connection
    console.log('Waiting for WebRTC connection...');
    await page1.waitForFunction(() => {
      const video = document.querySelector('.remote-video video');
      return video && video.style.display === 'block';
    }, { timeout: 10000 });

    await page2.waitForFunction(() => {
      const video = document.querySelector('.remote-video video');
      return video && video.style.display === 'block';
    }, { timeout: 10000 });

    console.log('Users connected. Clicking Start Countdown on User 1...');
    await page1.waitForSelector('.capture-btn');
    await page1.click('.capture-btn');

    console.log('Waiting for capture (thumbnails container to appear) on both pages...');
    
    // We expect thumbnails to appear after ~3.5 seconds
    const p1Wait = page1.waitForSelector('.thumbnails-container', { timeout: 8000 });
    const p2Wait = page2.waitForSelector('.thumbnails-container', { timeout: 8000 });
    
    await Promise.all([p1Wait, p2Wait]);

    console.log('SUCCESS: Thumbnails rendered on both pages, meaning countdown and capture worked synchronously!');
  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
