const { ObjectId } = require('mongodb');
const mySchemaClient = require('../../utils/database/db');
const addToSchema = require('../../utils/database/addToSchema');

async function deleteCommand(command) {
    if (!mySchemaClient.isAlive) {
        mySchemaClient.setupDatabase();
    }

    const parts = command.split(/\s+/);

    if (parts.length < 2) {
        return "Invalid format.\nUSAGE: delete article my_entry_id"
    }

    const articleName = parts[0];

    const existingCollection = await mySchemaClient.db.listCollections({ name: articleName }).toArray();

    if (existingCollection.length === 0) {
        return "The article provided doesn't exist. Please provide an existing article."
    }
    
    const id = parts[1];
    if (!ObjectId.isValid(id)) {
        return `Document with _id ${id} not found in ${articleName} collection.\nIt is also an invalid ObjectId format. Please provide a valid ObjectId.`;
    }
    
    const result = await mySchemaClient.delete(articleName, ObjectId(id));
    if (result.deletedCount === 1) {
        return `Document with _id ${id} deleted successfully from ${articleName} collection.`;
    } else {
        return `Document with _id ${id} not found in ${articleName} collection.`;
    }
}

module.exports = deleteCommand;
