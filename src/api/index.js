const express = require('express');
const router = express.Router();
const schema = require('../schema/content.json');
const db = require('../../utils/database/db');
const mySchemaClient = require('../../utils/database/db');

async function setupAPIRoutes() {
  await mySchemaClient.setupDatabase();
  try {
    for (const collectionName in schema) {
      router.get(`/${collectionName}`, async (req, res) => {
        try {
          const documents = await db.showEntries(collectionName);
          res.json(documents);
        } catch (error) {
          res.status(500).json({ error: 'Internal server error' });
        }
      });

      router.post(`/${collectionName}`, async (req, res) => {
        try {
          const insertedId = await db.insertDocument(collectionName, req.body);
          res.json({ insertedId });
        } catch (error) {
          res.status(500).json({ error: 'Internal server error' });
        }
      });

      router.put(`/${collectionName}/:id`, async (req, res) => {
        try {
          const filter = { _id: req.params.id }; // Assuming documents have _id field
          const update = req.body;
          const modifiedCount = await db.updateDocument(collectionName, filter, update);
          res.json({ modifiedCount });
        } catch (error) {
          res.status(500).json({ error: 'Internal server error' });
        }
      });

      router.delete(`/${collectionName}/:id`, async (req, res) => {
        try {
          const filter = { _id: req.params.id }; // Assuming documents have _id field
          const deletedCount = await db.deleteDocument(collectionName, filter);
          res.json({ deletedCount });
        } catch (error) {
          res.status(500).json({ error: 'Internal server error' });
        }
      });
    }
  } catch (error) {
    console.error('Error setting up API routes:', error);
  }
}

setupAPIRoutes();

module.exports = router;
