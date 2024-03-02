const mySchemaClient = require('../../utils/database/db');

async function showEntriesCommand(collectionName) {
    if (!mySchemaClient.isAlive) {
        mySchemaClient.setupDatabase();
    }

    const existingCollection = await mySchemaClient.db.listCollections({ name: collectionName }).toArray();

    if (existingCollection.length === 0) {
        return "The article provided doesn't exist. Please provide an existing article."
    }

    const content = await mySchemaClient.showEntries(collectionName);
    await content.forEach(document => {
        console.log(document);
    });
    return;
}

module.exports = showEntriesCommand;
