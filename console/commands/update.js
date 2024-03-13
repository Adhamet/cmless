const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');
const mySchemaClient = require('../../utils/database/db');
const stringToDT = require('../../utils/database/convertion');

async function updateCommand(command) {
    if (!mySchemaClient.isAlive) {
        mySchemaClient.setupDatabase();
    }

    const parts = command.split(/\s+/);

    // Check for format:
    if (parts.length < 3) {
        return "Invalid format.\nUSAGE: update <collection> <doc> <name1:value1> <name2:value2> ...";
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
    const values = {};
    for (let i = 1; i < parts.length; i++) {
        const pair = parts[i].split(':');
        if (pair.length !== 2) {
            return {
                error: `Invalid format for pair: ${parts[i]}`
            };
        }

        const name = pair[0];
        let value = "";

        if (pair[1].startsWith('"')) {
            pair[1] = pair[1].slice(1);
            value += pair[1];
            for(let j = i+1; j < parts.length; j++) {
                if(parts[j].endsWith('"')) {
                    parts[j] = parts[j].slice(0,-1);
                    value += ' ' + parts[j];
                    i++;
                    break;
                }
                value += ' ' + parts[j];
                i++;
            }
        }
        else {
            value = pair[1];
        }

        values[name] = value;
    }

    // Compare types and names with schema respectively:
    const schemaPath = path.resolve(__dirname, '../../src/schema/content.json');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    const schema = JSON.parse(schemaContent);

    const collectionSchema = schema[collectionName];

    const schemaKeys = Object.keys(collectionSchema);
    const schemaTypes = Object.values(collectionSchema);
    const inputKeys = Object.keys(values);
    const inputTypes = Object.values(values);

    if (schemaTypes.length !== inputTypes.length) {
        return "The count of attributes provided doesn't match the schema.";
    }

    for (let i = 0; i < schemaTypes.length; i++) {
        if (schemaKeys[i] !== inputKeys[i]) {
            return `Field at ${inputKeys[i]} doesn't match the schema`;
        }
        if (schemaTypes[i] === "bool") {
            if (inputValues[i] !== "0" && inputValues[i] !== "1")
                return `The type of the value of name ${inputKeys[i]} is not a ${schemaTypes[i]}`;
        }
        else if (schemaTypes[i] === "int") {
            const numberValue = parseFloat(inputValues[i]);
            if (isNaN(numberValue))
                return `The type of the value of name ${inputKeys[i]} is not an ${schemaTypes[i]}`;
        }
    }

    // Update in db:
    const result = await mySchemaClient.updateDocument(collectionName, id, values);
    if (result.modifiedCount === 1) {
        return `Document with _id ${id} updated successfully in ${collectionName} collection.`;
    } else {
        return `Document with _id ${id} not found in ${collectionName} collection.`;
    }
}

module.exports = updateCommand;
