const mySchemaClient = require('../../utils/database/db');

async function showArticlesCommand() {
    if (!mySchemaClient.isAlive) {
        mySchemaClient.setupDatabase();
    }

    const articles = await mySchemaClient.showCollections();
    console.log("List of articles in the database:");
    articles.forEach(article => console.log(article));
    return;
}

module.exports = showArticlesCommand;
