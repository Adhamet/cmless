const { MongoClient, ObjectID } = require('mongodb');

class dbClient {
    constructor() {
      this.username = process.env.MONGO_INITDB_ROOT_USERNAME || "cmless_user";
      this.password = process.env.MONGO_INITDB_ROOT_PASSWORD || "cmless_pass";
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

    async createArticle(articleName) {
      if(!this.db) {
        console.error('Not connected to the database');
        return;
      }

      const existingCollection = await this.db.listCollections({ name: articleName }).toArray();
      if (existingCollection.length == 0) {
        return await this.db.createCollection(articleName);
      }
    }

    async insertEntry(articleName, docData) {
      if(!this.db) {
        console.error('Not connected to the database');
        return;
      }

      return this.db.collection(articleName).insertOne(docData);
    }

    async updateEntry(collectionName, objectId, updateData) {
      if (!this.db) {
          console.error('Not connected to the database');
          return;
      }

      return await this.db.collection(collectionName).updateOne({ _id: objectId }, { $set: updateData });
    }

    async delete(collectionName, objectId) {
      if(!this.db) {
        console.error('Not connected to the database');
        return;
      }

      return await this.db.collection(collectionName).deleteOne({ _id: objectId });
    }

    async showArticles() {
      if(!this.db) {
        console.error('Not connected to the database');
        return;
      }

      const collections = await this.db.listCollections().toArray();
      const articleNames = collections.map(collection => collection.name).filter(name => name !== 'system.indexes');
      return articleNames;
    }

    async showEntries(collectionName) {
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
