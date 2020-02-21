const puppeteer = require('puppeteer');
// https://www.jqueryscript.net/time-clock/appointment-week-view-scheduler.html
// https://stackoverflow.com/questions/4668671/create-a-weekly-timetable-using-css-html

const _file = __dirname + "/schedule.png";

function pageToImage(url, file = _file) {
    return new Promise(async (resolve, reject) => {
        const browser = await puppeteer.launch({
            // headless: false,
            args: ['--no-sandbox', '--headless', '--disable-gpu']
        });
        const page = await browser.newPage();
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        await page.goto(url, {waitUntil: 'networkidle0'});

        const dimensions = await page.evaluate(() => {
            const body = document.body,
                html = document.documentElement;
            return {
                clientWidth: document.documentElement.clientWidth,
                clientHeight: document.documentElement.clientHeight,
                width: Math.max(body.scrollWidth, body.offsetWidth,
                    html.clientWidth, html.scrollWidth, html.offsetWidth),
                height: Math.max(body.scrollHeight, body.offsetHeight,
                    html.clientHeight, html.scrollHeight, html.offsetHeight),
                deviceScaleFactor: window.devicePixelRatio
            };
        });
        await page.setViewport({
            width: 1080,
            height: dimensions.height,
            deviceScaleFactor: 1,
        });
        await page.screenshot({path: file});
        await browser.close();
        resolve(file);
    });
}

module.exports = {pageToImage};

// pageToImage("http://localhost:8080/timetable?team=Fusion");