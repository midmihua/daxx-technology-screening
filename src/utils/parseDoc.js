const fetch = require('node-fetch');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const baseUrl = 'https://news.ycombinator.com';

async function getDomPage(url = baseUrl, time = 0) {
    try {
        const page = await fetch(url);
        const html = await page.text();
        return new JSDOM(html);
    } catch (error) {
        throw new Error(`getDomPage: ${error.message}`);
    }
}

function getItemlists(domPage, itemlist = 'itemlist', tag = 'tr') {
    try {
        const itemlists = domPage.window.document.getElementsByClassName(itemlist);
        const trList = Object.values(itemlists)[0].getElementsByTagName(tag);
        return Object.entries(trList);
    } catch (error) {
        throw new Error(`getItemlists: ${error.message}`);
    }
}

function getUsersData(itemlists) {
    const usersData = [];
    try {
        for (let i = 0; i < itemlists.length - 2; i += 3) {

            const storylinkText =
                Object.values(itemlists[i][1].getElementsByClassName("storylink"))[0].text;

            const hnuser =
                Object.values(itemlists[i + 1][1].getElementsByClassName("hnuser"))[0].text;

            const href =
                Object.values(itemlists[i + 1][1].getElementsByClassName("hnuser"))[0].getAttribute("href");

            const comment =
                Object.values(Object.values(itemlists[i + 1][1].getElementsByTagName("a")).slice(-1))[0].text;

            usersData.push({
                title: storylinkText,
                author: hnuser,
                comments_count: comment,
                href: `${baseUrl}/${href}`
            });
        }
        return usersData;
    } catch (error) {
        throw new Error(`getUsersData: ${error.message}`);
    }
}

function sortByComments(usersData) {
    try {
        return usersData.sort((current, next) => {
            const currentComment = +current.comments_count.replace("comments", "").trim() || 0;
            const nextComment = +next.comments_count.replace("comments", "").trim() || 0;
            return nextComment - currentComment;
        });
    } catch (error) {
        throw new Error(`sortByComments: ${error.message}`);
    }
}

function printStoriesToConsole(usersData) {
    try {
        usersData.map((user, index) => {
            console.log(`[${++index}]. (${user.comments_count}) ${user.title}`);
        });
    } catch (error) {
        throw new Error(`printStoriesToConsole: ${error.message}`);
    }
}

async function getAllAuthors(usersData) {
    try {
        return await Promise.all(
            usersData.map(user => getDomPage(user.href))
        );
    } catch (error) {
        throw new Error(`getAllAuthors: ${error.message}`);
    }

}

function getAutorsKarma(authors) {
    try {
        return authors.map(author => {
            if (!author) {
                throw new Error('"Author" page has not been loaded')
            }
            const rawBodyData = Object.values(author.window.document.getElementsByTagName("tbody"))[0];
            if (!rawBodyData) {
                throw new Error('"Author" page does not include necessary information');
            }
            const rawKarma = Object.values(rawBodyData.getElementsByTagName('td'))[10] || {};
            return rawKarma.innerHTML ? rawKarma.innerHTML.trim() : () => { throw new Error('"Karma" is not found') };
        });
    } catch (error) {
        throw new Error(`getAutorsKarma: ${error.message}`);
    }
}

function printKarmas(karmas) {
    try {
        karmas.sort((x, y) => y - x);
        karmas.map((element, idx) => console.log(`[${++idx}]. ${element}`));
    } catch (error) {
        throw new Error(`printKarmas: ${error.message}`);
    }
}

module.exports = {
    getDomPage,
    getItemlists,
    getUsersData,
    sortByComments,
    printStoriesToConsole,
    getAllAuthors,
    getAutorsKarma,
    printKarmas
}