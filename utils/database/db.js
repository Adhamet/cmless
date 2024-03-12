const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const databaseConfig = require('../../config/database');


class dbClient {
    constructor() {
      this.username = databaseConfig.user;
      this.password = databaseConfig.password;
      this.dbName = "cmless";
      this.client = new MongoClient(`'mongodb://${this.username}:${this.password}@localhost:27017'`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        loggerLevel: 'error'
      });
      this.db = null;
    }

    async connect() {
      try {
        await this.client.connect();
        this.db = this.client.db(this.dbName);
      } catch (error) {
        console.error("CONNECTION ERR: " + error.message);
        throw error;
      }
    }

    async intializeDatabase() {
      const adminDb = this.client.db('admin');

      const dbList = await adminDb.admin().command({ listDatabases: 1 });
      const dbNames = dbList.databases.map(db => db.name);

      const dbExists = dbNames.includes(this.dbName);

      if (!dbExists) {
        await adminDb.admin().command({ create: this.dbName });
      }

      const targetDb = this.client.db(this.dbName);
      const userInfo = await targetDb.command({ usersInfo: this.username });

      if (userInfo.users.length === 0) {
        await targetDb.command({
          createUser: this.username,
          pwd: this.password,
          roles: [{ role: 'readWrite', db: this.dbName }]
        });

        this.db = targetDb;
      }
    }

    async setupDatabase() {
      process.on('warning', (warning) => {
        // Ignore warnings.
      });

      try {
        await this.connect();
      } catch (error) {
        console.error('Error connecting to database:', error.message);
      }

      try {
        await this.intializeDatabase();
      } catch (error) {
        console.error('Error intializing database:', error.message);
      }
    }

    isAlive() {
        return !!this.db;
    }

    async createCollection(collectionName) {
      if(!this.db) {
        console.error('Not connected to the database');
        return;
      }

      const existingCollection = await this.db.listCollections({ name: collectionName }).toArray();
      if (existingCollection.length == 0) {
        const status = await this.db.createCollection(collectionName);
        return { status: "okay" };
      }
      else {
        return { status: "Already exists" }
      }
    }

    async insertDocument(articleName, docData) {
      if(!this.db) {
        console.error('Not connected to the database');
        return;
      }

      return this.db.collection(articleName).insertOne(docData);
    }

    async updateDocument(collectionName, objectId, updateData) {
      if (!this.db) {
          console.error('Not connected to the database');
          return;
      }

      return await this.db.collection(collectionName).updateOne({ _id: ObjectId(objectId) }, { $set: updateData });
    }

    async deleteCollection(collectionName) {
      if(!this.db) {
        console.error('Not connected to the database');
        return;
      }

      try {
        await this.db.collection(collectionName).drop();
        return true;
      } catch (error) {
        return false;
      }
    }

    async deleteDocument(collectionName, objectId) {
      if(!this.db) {
        console.error('Not connected to the database');
        return;
      }

      return await this.db.collection(collectionName).deleteOne({ _id: ObjectId(objectId) });
    }

    async showCollections() {
      if(!this.db) {
        console.error('Not connected to the database');
        return;
      }

      const collections = await this.db.listCollections().toArray();
      const articleNames = collections.map(collection => collection.name).filter(name => name !== 'system.indexes');
      return articleNames;
    }

    async showDocuments(collectionName) {
      if(!this.db) {
        console.error('Not connected to the database');
        return [];
      }

      const collection = this.db.collection(collectionName);
      const content = await collection.find().toArray();
      return content;
    }

    async disconnect() {
      try {
        await this.client.close();
      } catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
        throw error;
      }
    }
}

const mySchemaClient = new dbClient();
module.exports = mySchemaClient;
