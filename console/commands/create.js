const mySchemaClient = require('../../utils/database/db');
const addToSchema = require('../../utils/database/addToSchema');
const stringToDT = require('../../utils/database/convertion');

function createCommand(command) {
    if (!mySchemaClient.isAlive) {
        mySchemaClient.setupDatabase();
    }

    const parts = command.split(/\s+/);

    if (parts.length < 2) {
        return "Invalid format.\nUSAGE: create <collection> <name1:type1> <name2:type2> ..."
    }

    const articleName = parts[0];
    const typesAndNames = [];

    for (let i = 1; i < parts.length; i++) {
        const pair = parts[i].split(':');
        if (pair.length !== 2) {
            return "Invalid format.\nUSAGE: create <collection> <name1:type1> <name2:type2> ..."

        }

        const name = pair[0];
        const type = stringToDT(pair[1]);
        if(type === null) {
            return `Invalid data-type for ${name}.\nTypes available: string, bool or int.`;
        }
        typesAndNames.push({ name, type });
    }


    console.log('Collection Name:', articleName);
    console.log('Names and Types:', typesAndNames);

    addToSchema(articleName, typesAndNames);
    mySchemaClient.createCollection(articleName);
    return "";
}

module.exports = createCommand
