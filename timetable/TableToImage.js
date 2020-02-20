const puppeteer = require('puppeteer');
// https://www.jqueryscript.net/time-clock/appointment-week-view-scheduler.html
// https://stackoverflow.com/questions/4668671/create-a-weekly-timetable-using-css-html

const webpage = __dirname + "/index.html";
const file = __dirname + "/schedule.png";

function generateTimeTable(events, available, team, interval = 15) {
    return new Promise(async (resolve, reject) => {
        const browser = await puppeteer.launch({
            // headless: false,
            args: ['--no-sandbox', '--headless', '--disable-gpu']
        });
        const page = await browser.newPage();
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        await page.goto("file://" + webpage, {waitUntil: 'domcontentloaded'});

        await page.evaluate(data => {
            function format(time) {
                time.start = moment(time.start);
                time.end = moment(time.end);
                return time;
            }

            setInterval(data.interval);
            createTable(data.events.map(format), data.available.map(format));
            setAvailability(data.available.map(format));
            setEvents(data.events.map(format));
            setTeam(data.team);
        }, {
            events, available, team, interval
        });
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
            width: dimensions.width,
            height: dimensions.height,
            deviceScaleFactor: 1,
        });
        await page.evaluate(() => document.body.style.background = 'transparent');
        await page.screenshot({path: file});
        await browser.close();
        resolve(file);
    });
}

module.exports = {generateTimeTable};
