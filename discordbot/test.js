// const puppeteer = require('puppeteer');
//
// (async () => {
//     const browser =await puppeteer.launch({
//         // executablePath: '/usr/bin/chromium-browser',
//         args: ['--no-sandbox', '--headless', '--disable-gpu']
//     });
//     const page = await browser.newPage();
//     await page.goto('https://news.ycombinator.com', {waitUntil: 'networkidle2'});
//     await page.pdf({path: 'hn.pdf', format: 'A4'});
//
//     await browser.close();
// })();

const {Availability} = require('../models');
