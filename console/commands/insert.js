const schemaClient = require('../../utils/database/schema');
const mySchemaClient = schemaClient();

function insertCommand(command) {
    mySchemaClient.setupDatabase();

    const parts = command.split(/\s+/);

    if (parts.length < 3) {
        console.log("Invalid format.");
        console.log("USAGE: insert article my_entry name1:type1 name2:type2 ...");
        return;
    }

    const articleName = parts[0];
    // Checks if it exists in the database:
    const existingArticle = await mySchemaClient.db
    const typesAndNames = [];

    for (let i = 1; i < parts.length; i++) {
        const pair = parts[i].split(':');
        if (pair.length !== 2) {
            console.log("Invalid format.");
            console.log("USAGE: create my_article name1:type1 name2:type2 ...");
            return;
        }
        const name = pair[0];
        const type = pair[1];
        typesAndNames.push({ name, type });
    }

    console.log('Article Name:', articleName);
    console.log('Names and Types:', typesAndNames);

    const mySchemaClient = schemaClient.connect();
    mySchemaClient.addToSchema(articleName, typesAndNames);

    mySchemaClient.createArticle(articleName);
}

module.exports = createCommand
