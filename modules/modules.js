const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    crawl: async (urlData) => {
        try {
            // Send HTTP request to URL
            const response = await axios.get(urlData.href);

            if (response.status == 200) {
                // Load HTML content into Cheerio
                const $ = cheerio.load(response.data);
                console.log(urlData.href);

                const data = {
                    url: urlData.href,
                    url_data: urlData,
                    title: $('title').text(),
                    favicon: $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href'),
                    description: $('meta[name="description"]').attr('content') || $('h1').text() || $('h2').text() || $('p').text() || 'This is a website',
                    keywords: $('meta[name="keywords"]').attr('content'),
                    images: $('img').map((i, el) => $(el).attr('src')).get(),
                    html: $.html(),
                    links: $('a').map((i, el) => $(el).attr('href')).get(),
                };

                return data; // return data object
            } else {
                throw new Error('Url is not valid!'); // throw error if URL is not valid
            }
        } catch (err) {
            console.error(err);
            throw err; // throw any errors encountered
        }
    },
};
