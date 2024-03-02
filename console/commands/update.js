const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');
const mySchemaClient = require('../../utils/database/db');

function stringToDataType(str) {
    switch(str.toLowerCase()) {
        case "bool":
            return Boolean;
        case "int":
            return Number;
        case "string":
            return String;
        default:
            return null; // or throw an error if the string is not recognized
    }
}

async function updateCommand(command) {
    if (!mySchemaClient.isAlive) {
        mySchemaClient.setupDatabase();
    }

    const parts = command.split(/\s+/);

    // Check for format:
    if (parts.length < 3) {
        return "Invalid format.\nUSAGE: insert collection my_entry_id name1:value1 name2:value2 ...";
    }

    const collectionName = parts[0];

    // Checks if collection exists in the database:
    const existingCollection = await mySchemaClient.db.listCollections({ name: collectionName }).toArray();

    if (existingCollection.length === 0) {
        return "The collection provided doesn't exist. Please provide an existing collection."
    }

    const id = parts[1];
    if (!ObjectId.isValid(id)) {
        return `Document with _id ${id} not found in ${collectionName} collection.\nIt is also an invalid ObjectId format. Please provide a valid ObjectId.`;
    }

    // Take in types and names:
    const namesAndValues = {};
    for (let i = 2; i < parts.length; i++) {
        const [name, value] = parts[i].split(':');
        namesAndValues[name] = value;
    }

    // Compare types and names with schema respectively:
    const schemaPath = path.resolve(__dirname, '../../src/schema/content.json');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    const schema = JSON.parse(schemaContent);

    const collectionSchema = schema[collectionName];

    const schemaKeys = Object.keys(collectionSchema);
    const schemaTypes = Object.values(collectionSchema);
    const inputKeys = Object.keys(namesAndValues);
    const inputTypes = Object.values(namesAndValues);

    if (schemaTypes.length !== inputTypes.length) {
        return "The count of attributes provided doesn't match the schema.";
    }

    for (let i = 0; i < schemaTypes.length; i++) {
        if (schemaKeys[i] !== inputKeys[i]) {
            return `Field at ${inputKeys[i]} doesn't match the schema`;
        }
        // if (stringToDataType(schemaTypes[i]) !== typeof inputKeys[i]) {
        //     return `Type at ${inputKeys[i]} doesn't match the schema.`;
        // }
    }

    // Update in db:
    const result = await mySchemaClient.updateEntry(collectionName, ObjectId(id), namesAndValues);
    if (result.modifiedCount === 1) {
        return `Document with _id ${id} updated successfully in ${collectionName} collection.`;
    } else {
        return `Document with _id ${id} not found in ${collectionName} collection.`;
    }
}

module.exports = updateCommand;
