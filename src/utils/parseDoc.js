const fetch = require('node-fetch');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;


const baseUrl = 'https://news.ycombinator.com';


async function getDomPage(url = baseUrl, time = 0) {

    const page = await fetch(url);
    const html = await page.text();

    return new JSDOM(html);
}

function getItemlists(domPage, itemlist = 'itemlist', tag = 'tr') {

    const itemlists = domPage.window.document.getElementsByClassName(itemlist);
    const trList = Object.values(itemlists)[0].getElementsByTagName(tag);

    return Object.entries(trList);
}

function getUsersData(itemlists) {

    const usersData = [];

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
}

function sortByComments(usersData) {
    return usersData.sort((current, next) => {
        const currentComment = +current.comments_count.replace("comments", "").trim() || 0;
        const nextComment = +next.comments_count.replace("comments", "").trim() || 0;
        return nextComment - currentComment;
    });
}

function printStoriesToConsole(usersData) {
    usersData.map((user, index) => {
        console.log(`[${++index}]. (${user.comments_count}) ${user.title}`);
    });
}

async function getAllAuthors(usersData) {
    return await Promise.all(
        usersData.map(user => getDomPage(user.href))
    );
}

function getAutorsKarma(authors) {
    return authors.map(author => {
        if (author) {
            const rawBodyData = Object.values(author.window.document.getElementsByTagName("tbody"))[0];
            if (rawBodyData) {
                const rawKarma = Object.values(rawBodyData.getElementsByTagName('td'))[10] || {};
                return rawKarma.innerHTML ? rawKarma.innerHTML.trim() : 0;
            }
        }
        return 0;
    });
}

function printKarmas(karmas) {
    karmas.sort((x, y) => y - x);
    karmas.map((element, idx) => console.log(`[${++idx}]. ${element}`));
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