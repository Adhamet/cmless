#!/usr/bin/env node
// Interactive Command Line Terminal

const readline = require('readline');
const helpCommand = require('./commands/help');
const createCommand = require('./commands/create');
const insertCommand = require('./commands/insert');
const updateCommand = require('./commands/update');
const deleteCommand = require('./commands/delete');
const showsArticlesCommand = require('./commands/showArticles');
const showEntriesCommand = require('./commands/showEntries');
const mySchemaClient = require('../utils/database/db');
const { spawn } = require('child_process');

let apiProcess;

function startAPI() {
    apiProcess = spawn('node', ['routes/APIServer.js']);

    // Log API output
    apiProcess.stdout.on('data', (data) => {
        console.log(`API: ${data}`);
    });

    apiProcess.stderr.on('data', (data) => {
        console.error(`API Error: ${data}`);
    });

    apiProcess.on('close', (code) => {
        console.log(`API process exited with code ${code}`);
    });
}

// Function to restart the Express API
function restartAPI() {
    if (apiProcess) {
        console.log('Restarting API...');
        apiProcess.kill('SIGTERM'); // or 'SIGKILL' if SIGTERM doesn't work
        startAPI();
    } else {
        console.log('API is not running. Starting API...');
        startAPI();
    }
}

startAPI();

class CLI {
    constructor() {
        this.commands = {
            // Database: creates a collection along with its schema.
            "create": "\t\tCreates an collection with abstract attributes.\n\t\t\tUSAGE: create my_collection name1:type1 name2:type2 ...",
            // Database: Inserts a document in an existing collection according to its schema.
            "insert": "\t\tInserts an entry in an existing collection.\n\t\t\tUSAGE: insert collection name1:type1 name2:type2 ...",
            // Database: Updates a document in an existing collection according to its schema.
            "update": "\t\tUpdates an entry through its 'id' in an existing collection.\n\t\t\tUSAGE: update collection my_entry_id name1:type1 name2:type2 ...",
            // Database: Deletes a document in an existing collection.
            "delete": "\t\tDeletes an entry through its 'id' from an existing collection.\n\t\t\tUSAGE: delete collection my_entry_id",
            // Database: Shows the collections in the database.
            "showCollection": "\tShows the collection in the database.\n\t\t\tUSAGE: showCollection",
            // Database: Shows entries for a collection in the database.
            "showEntries": "\t\tShows entries for a collection in the database.\n\t\t\tUSAGE: showEntries <collection>"
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
            if (apiProcess) {
                apiProcess.kill('SIGTERM');
            }
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
            const res = createCommand(argument);
            restartAPI();
            return res;
        } else if (action === 'insert') {
            return insertCommand(argument);
        } else if (action === 'update') {
            return updateCommand(argument);
        } else if (action === 'get') {
            return getCommand(argument);
        } else if (action === 'delete') {
            return deleteCommand(argument);
        } else if (action === 'showCollection') {
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
