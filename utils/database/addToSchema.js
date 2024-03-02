const fs = require('fs');
const path = require('path');

function addToSchema(articleName, typesAndNames) {
    const schemaPath = path.resolve(__dirname, '../../src/schema/content.json');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    const schema = JSON.parse(schemaContent);

    schema[articleName] = {};
    typesAndNames.forEach(pair => {
        schema[articleName][pair.name] = pair.type;
    });

    fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
}

module.exports = addToSchema;
