#!/usr/bin/env node
// Interactive Command Line Terminal

const readline = require('readline');
const createCommand = require('./commands/create');
const insertCommand = require('./commands/insert');
const helpCommand = require('./commands/help');
const showsArticlesCommand = require('./commands/showArticles');
const showEntriesCommand = require('./commands/showEntries');
const mySchemaClient = require('../utils/database/db');

class CLI {
    constructor() {
        this.commands = {
            // Database: creates a collection along with its schema.
            "create": "\tCreates an article with abstract attributes.\n\t\tUSAGE: create my_article name1:type1 name2:type2 ...",
            // Database: Inserts a document in an existing collection according to its schema.
            "insert": "\tInserts an entry in an existing article.\n\t\tUSAGE: insert article my_entry name1:type1 name2:type2 ...",
            // Database: Updates a document in an existing collection according to its schema.
            "update": "\tUpdates an entry in an existing article.\n\t\tUSAGE: update article my_entry name1:type1 name2:type2 ...",
            // Database: Deletes a document in an existing collection.
            "delete": "\tDeletes an entry from an existing article.\n\t\tUSAGE: delete article my_entry",
            // Database: Shows the collections in the database.
            "showArticles": "\tShows the articles in the database.\n\t\tUSAGE: showCollection",
            // Database: Shows entries for a collection in the database.
            "showEntries": "\tShows entries for a collection in the database.\n\t\tUSAGE: showEntries <article>"
        };
    }

    async run() {
        console.log("Welcome to CMLess!");
        console.log("Type 'help' to see available commands.");

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.setPrompt("(cmless) ");

        await mySchemaClient.setupDatabase();

        rl.prompt();

        rl.on('line', async (input) => {
            const errMsg = await this.executeCommand(input.trim());
            if (errMsg) {
                console.log(errMsg);
            }
            process.stdout.write("(cmless) ");
        });

        rl.on('close', () => {
            console.log("\nExiting CMLess...");
            mySchemaClient.disconnect();
            process.exit(0);
        })
    }
    
    async executeCommand(command) {
        const parts = command.split(/\s+/);
        const action = parts[0];
        const argument = parts.slice(1).join(' ');

        if (action === 'help') {
            return helpCommand(this.commands);
        } else if (action === 'create') {
            return createCommand(argument);
        } else if (action === 'insert') {
            return insertCommand(argument);
        } else if (action === 'update') {
            return updateCommand(argument);
        } else if (action === 'get') {
            return getCommand(argument);
        } else if (action === 'delete') {
            return deleteCommand(argument);
        } else if (action === 'showArticles') {
            return showsArticlesCommand(argument);
        } else if (action === 'showEntries') {
            return showEntriesCommand(argument);
        } else {
            console.log("Command not found, type 'help' for available commands.");
            return null;
        }
    }
}

const myCLI = new CLI();
myCLI.run();
