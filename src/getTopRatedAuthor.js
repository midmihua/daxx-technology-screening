const {
    getDomPage,
    getItemlists,
    getUsersData,
    getAllAuthors,
    getAutorsKarma,
    printKarmas
} = require('./utils/parseDoc');

getDomPage()
    .then(domData => getUsersData(getItemlists(domData)))
    .then(usersData => getAllAuthors(usersData))
    .then(authorsData => getAutorsKarma(authorsData))
    .then(karmas => printKarmas(karmas))
    .catch(err => {
        console.log(err);
    });