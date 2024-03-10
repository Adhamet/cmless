const fs = require('fs');
const path = require('path');

function showCollAttrs(collectionName) {
    const collectionsPath = path.resolve(__dirname, '../../src/schema/content.json');
    const collectionsContent = fs.readFileSync(collectionsPath, 'utf-8');
    const collections = JSON.parse(collectionsContent);

    const schema = collections[collectionName];
    
    return `Example object from collection "${collectionName}": \n${JSON.stringify(schema, null, 2)}`
}

module.exports = showCollAttrs;
