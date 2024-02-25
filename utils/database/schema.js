const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectID } = require('mongodb');

class schemaClient {
    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || 27017;
        const database = process.env.DB_DATABASE || 'cmless';
        this.connected = false;

        this.mongoUri = `mongodb://${host}:${port}/${database}`;
        this.client = new MongoClient(this.mongoUri, { useUnifiedTopology: true });
    }

    connect() {
      return this.client.connect()
        .then(() => {
          this.db = this.client.db(database);
          this.connected = true;
        })
        .catch((error) => {
          console.log(error.message);
        });
    }

    isAlive() {
        return this.connected;
    }

    async createArticle(articleData) {
      if(!this.connected) {
        console.error('Not connected to the database');
        return;
      }

      const existingCollection = this.db.listCollections({ name: 'articles' }).toArray;
      if (existingCollection.length == 0) {
        await this.db.createCollection('articles');
      }
      
      const result = await this.db.collection('articles').insertOne(articleData);
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
