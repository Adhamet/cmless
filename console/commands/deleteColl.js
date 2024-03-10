const mySchemaClient = require('../../utils/database/db');

async function deleteCollCommand(command) {
    if (!mySchemaClient.isAlive) {
        mySchemaClient.setupDatabase();
    }

    const parts = command.split(/\s+/);

    if (parts.length != 1) {
        return "Invalid format.\nUSAGE: delete collection"
    }

    const collectionName = parts[0];

    const existingCollection = await mySchemaClient.db.listCollections({ name: collectionName }).toArray();

    if (existingCollection.length === 0) {
        return "The collection provided doesn't exist. Please provide an existing collection."
    }

    const result = await mySchemaClient.deleteCollection(collectionName);
    if (result === true) {
        return `Collection ${collectionName} deleted successfully.`;
    } else {
        return `Collection ${collectionName} deletion failed.`;
    }
}

module.exports = deleteCollCommand;
