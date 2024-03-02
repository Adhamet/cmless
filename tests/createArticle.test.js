#!/usr/bin/env node
const schemaClient = require('../utils/database/schema');

async function testCreateArticle() {
    const mySchemaClient = new schemaClient();

    await mySchemaClient.setupDatabase();

    const result = await mySchemaClient.createArticle("sampleArticle");

    console.log('Result:', result);
}

testCreateArticle();
