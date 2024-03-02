#!/usr/bin/env node
const schemaClient = require('../utils/database/schema');

async function testCreateArticle() {
    const mySchemaClient = new schemaClient();

    await mySchemaClient.setupDatabase();
    
    const articleData = {
        title: 'Sample Article',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    };

    const result = await mySchemaClient.createArticle("sampleArticle", articleData);

    console.log('Result:', result);
}

testCreateArticle();
