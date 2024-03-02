const fs = require('fs');
const path = require('path');
const mySchemaClient = require('../../utils/database/db');

async function insertCommand(command) {
    if (!mySchemaClient.isAlive) {
        mySchemaClient.setupDatabase();
    }

    const parts = command.split(/\s+/);

    // Check for format:
    if (parts.length < 2) {
        return "Invalid format.\nUSAGE: insert article name1:type1 name2:type2 ...";
    }

    const articleName = parts[0];

    // Checks if article exists in the database:
    const existingCollection = await mySchemaClient.db.listCollections({ name: articleName }).toArray();

    if (existingCollection.length === 0) {
        return "The article provided doesn't exist. Please provide an existing article."
    }

    // Take in types and names:
    const typesAndNames = {};
    for (let i = 1; i < parts.length; i++) {
        const [name, type] = parts[i].split(':');
        typesAndNames[name] = type;
    }

    // Compare types and names with schema respectively:
    const schemaPath = path.resolve(__dirname, '../../src/schema/content.json');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    const schema = JSON.parse(schemaContent);

    const articleSchema = schema[articleName];

    if (Object.keys(typesAndNames).length !== Object.keys(articleSchema).length) {
        return "The count of attributes provided doesn't match the schema.";
    }

    const schemaTypes = Object.values(articleSchema);
    const inputKeys = Object.keys(typesAndNames);
    const inputTypes = Object.values(typesAndNames);

    if (schemaTypes.length !== inputTypes.length) {
        return "The count of attributes provided doesn't match the schema.";
    }

    for (let i = 0; i < schemaTypes.length; i++) {
        if (schemaTypes[i] !== inputTypes[i]) {
            return `Type at index ${inputKeys[i]} doesn't match the schema.`;
        }
    }

    // Insert in db:
    mySchemaClient.insertEntry(articleName, typesAndNames);
}

module.exports = insertCommand
