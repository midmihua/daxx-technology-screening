const {
    getDomPage,
    getItemlists,
    getUsersData,
    sortByComments,
    printStoriesToConsole
} = require('./utils/parseDoc');

getDomPage()
    .then(data => {
        const itemlist = getItemlists(data);
        const userData = getUsersData(itemlist);
        printStoriesToConsole(sortByComments(userData));
    })
    .catch(err => {
        console.log(err);
    });