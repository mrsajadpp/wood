let puppeteer = require('puppeteer');
const http = require('url');

module.exports = {
    getDirUrl: (url) => {
        return new Promise(async (resolve, reject) => {
            try {
                url = await new URL(url);
                url.protocol = await 'http' 
                const launch = await puppeteer.launch().catch((err) => { console.error(err) });;
                const page = await launch.newPage().catch((err) => { console.error(err) });;
                await page.goto(url.origin + url.pathname).catch((err) => { console.error(err) });
                let src = await page.$eval("video", n => n.getAttribute("src")).catch((err) => { console.error(err) });
                console.log("Url redierected to: " + src);
                resolve(src);
                await launch.close().catch((err) => { console.error(err) });
            } catch (err) {
                console.error(err)
                reject({ status: 500, message: 'internal server error' })
            }
        })
    }
}