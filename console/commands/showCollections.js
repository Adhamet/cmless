const mySchemaClient = require('../../utils/database/db');

async function showCollectionsCommand() {
    if (!mySchemaClient.isAlive) {
        mySchemaClient.setupDatabase();
    }

    const articles = await mySchemaClient.showCollections();
    console.log("List of collections in the database:");
    articles.forEach(article => console.log(article));
    return;
}

module.exports = showCollectionsCommand;
