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
    console.log('Opening User 1...');
    const page1 = await browser.newPage();
    page1.on('console', msg => console.log('PAGE1:', msg.text()));
    await page1.goto('http://localhost:5173');
    
    // Generate code
    await page1.waitForSelector('.generate-btn');
    await page1.click('.generate-btn');
    
    // Get code
    const roomCode = await page1.$eval('.input-field', el => el.value);
    console.log('Room Code generated:', roomCode);
    
    // Join Room
    await page1.click('.join-btn');
    
    // Wait for the room to render
    await page1.waitForSelector('.room-container');
    console.log('User 1 joined room.');

    console.log('Opening User 2...');
    const page2 = await browser.newPage();
    page2.on('console', msg => console.log('PAGE2:', msg.text()));
    await page2.goto('http://localhost:5173');
    
    // Type code
    await page2.waitForSelector('.input-field');
    await page2.type('.input-field', roomCode);
    
    // Join Room
    await page2.click('.join-btn');
    await page2.waitForSelector('.room-container');
    console.log('User 2 joined room.');

    // Verify connection status
    console.log('Waiting for WebRTC connection...');
    
    // The status text should become "Connected!" when remote stream is ready
    await page1.waitForFunction(() => {
      const badge = document.querySelector('.status-badge');
      return badge && badge.innerText.includes('Connected!');
    }, { timeout: 10000 });
    
    await page2.waitForFunction(() => {
      const badge = document.querySelector('.status-badge');
      return badge && badge.innerText.includes('Connected!');
    }, { timeout: 10000 });

    console.log('SUCCESS: Both users successfully connected and established WebRTC connection!');
  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
