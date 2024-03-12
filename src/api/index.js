const express = require('express');
const router = express.Router();
const schema = require('../schema/content.json');
const db = require('../../utils/database/db');
const mySchemaClient = require('../../utils/database/db');

async function setupAPIRoutes() {
  await mySchemaClient.setupDatabase();
  try {
    for (const collectionName in schema) {
      // Show Documents
      router.get(`/${collectionName}`, async (req, res) => {
        try {
          const documents = await db.showDocuments(collectionName);
          res.json(documents);
        } catch (error) {
          res.status(500).json({ error: `Internal server error ${error}` });
        }
      });

      // Insert Document
      router.post(`/${collectionName}`, async (req, res) => {
        try {
          const query = req.query;
          const op = await db.insertDocument(collectionName, query);
          res.json({ insertedId: op.insertedId });
        } catch (error) {
          res.status(500).json({ error: `Internal server error. ${error}` });
        }
      });

      // Update Document
      router.put(`/${collectionName}/:id`, async (req, res) => {
        try {
          const update = req.query;
          const modifiedCount = await db.updateDocument(collectionName, req.params.id, update);
          res.json({ modifiedCount });
        } catch (error) {
          res.status(500).json({ error: `Internal server error. ${error}` });
        }
      });

      // Delete Document
      router.delete(`/${collectionName}/:id`, async (req, res) => {
        try {
          const deletedCount = await db.deleteDocument(collectionName, req.params.id);
          res.json({ deletedCount });
        } catch (error) {
          res.status(500).json({ error: `Internal server error. ${error}` });
        }
      });

      // Delete Collection
      router.delete(`/${collectionName}`, async (req, res) => {
        try {
          const result = await db.deleteCollection(collectionName);
          res.json({ result });
        } catch (error) {
          res.status(500).json({ error: `Internal server error. ${error}` });
        }
      });

      // Show Collections
      router.get('/', async (req, res) => {
        try {
          const collections = await db.showCollections();
          res.json(collections);
        } catch (error) {
          res.status(500).json({ error: `Internal server error. ${error}` });
        }
      });
    }
  } catch (error) {
    console.error('Error setting up API routes:', error);
  }

  // Create Collection
  router.post('/', async (req, res) => {
    try {
      const collectionName = req.query.name;
      const result = await db.createCollection(collectionName);
      res.json({ result });
    } catch (error) {
      res.status(500).json({ error: `Internal server error. ${error}` });
    }
  });
}



setupAPIRoutes();

module.exports = router;
