const { ObjectId } = require('mongodb');
const mySchemaClient = require('../../utils/database/db');

async function deleteDocCommand(command) {
    if (!mySchemaClient.isAlive) {
        mySchemaClient.setupDatabase();
    }

    const parts = command.split(/\s+/);

    if (parts.length < 2) {
        return "Invalid format.\nUSAGE: delete collection my_entry_id"
    }

    const collectionName = parts[0];

    const existingCollection = await mySchemaClient.db.listCollections({ name: collectionName }).toArray();

    if (existingCollection.length === 0) {
        return "The collection provided doesn't exist. Please provide an existing collection."
    }

    const id = parts[1];
    if (!ObjectId.isValid(id)) {
        return `Document with _id ${id} not found in ${collectionName} collection.\nIt is also an invalid ObjectId format. Please provide a valid ObjectId.`;
    }

    const result = await mySchemaClient.deleteDocument(collectionName, id);
    if (result.deletedCount === 1) {
        return `Document with _id ${id} deleted successfully from ${collectionName} collection.`;
    } else {
        return `Document with _id ${id} not found in ${collectionName} collection.`;
    }
}

module.exports = deleteDocCommand;
