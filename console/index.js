#!/usr/bin/env node
// Interactive Command Line Terminal

const readline = require('readline');
const createCommand = require('./commands/create');
const insertCommand = require('./commands/insert');
const helpCommand = require('./commands/help');
const mySchemaClient = require('../utils/database/db');

class CLI {
    constructor() {
        this.commands = {
            // Database: creates a collection along with its schema.
            "create": "\tCreates an article of any attributes.\n\t\tUSAGE: create my_article name1:type1 name2:type2 ...",
            // Database: Inserts a document in an existing collection according to its schema.
            "insert": "\tInserts an entry in an existing article.\n\t\tUSAGE: insert article my_entry name1:type1 name2:type2 ...",
            // Database: Updates a document in an existing collection according to its schema.
            "update": "\tUpdates an entry in an existing article.\n\t\tUSAGE: update article my_entry name1:type1 name2:type2 ...",
            // Database: Gets a document in an existing collection.
            "get": "\t\tGets an entry from an existing article.\n\t\tUSAGE: get article my_entry",
            // Database: Deletes a document in an existing collection.
            "delete": "\tDelets an entry from an existing article.\n\t\tUSAGE: delete article my_entry"
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
        } else {
            console.log("Command not found, type 'help' for available commands.");
            return null;
        }
    }
}

const myCLI = new CLI();
myCLI.run();
