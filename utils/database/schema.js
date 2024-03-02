const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectID } = require('mongodb');

class schemaClient {
    constructor() {
      const url = 'mongodb://localhost:27017';
      this.url = url;
      this.dbName = 'cmless';
      this.username = "cmless_user";
      this.password = "cmless_pass";
      this.client = new MongoClient(`${this.url}/${this.dbName}`, { useNewUrlParser: true, useUnifiedTopology: true });
      this.db = null;
    }

    async connect() {
      try {
        await this.client.connect();
        this.db = this.client.db(this.dbName);
        console.log('Connected to MongoDB');
      } catch (error) {
        console.log("CONNECTION ERR: " + error.message);
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
        console.log('Database created successfully.');
      }

      const targetDb = this.client.db(this.dbName);
      const userInfo = await targetDb.command({ usersInfo: this.username });

      if (userInfo.users.length === 0) {
        await targetDb.command({
          createUser: this.username,
          pwd: this.password,
          roles: [{ role: 'readWrite', db: this.dbName }]
        });
        console.log('User created successfully');
      }

      console.log("Database setup completed sucessfully");
    }

    async setupDatabase() {
      try {
        await this.connect();
        await this.intializeDatabase();
      } catch (error) {
        console.error('Error while setting up database:', error);
      }
    }

    isAlive() {
        return !!this.db;
    }

    async createArticle(articleName, articleData) {
      if(!this.db) {
        console.error('Not connected to the database');
        return;
      }
      
      const existingCollection = await this.db.listCollections({ name: 'articles' }).toArray;
      if (existingCollection.length == 0) {
        await this.db.createCollection(`${articleName}`);
      }
      
      const result = await this.db.collection(`${articleName}`).insertOne(articleData);
      return result;
    }

    static async addToSchema(articleName, typesAndNames) {
        const schemaPath = path.resolve(__dirname, '../../src/schema/content.json');
        const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
        const schema = JSON.parse(schemaContent);
    
        schema[articleName] = {};
        typesAndNames.forEach(pair => {
            schema[articleName][pair.name] = pair.type;
        });
    
        fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
    }
}

module.exports = schemaClient;
