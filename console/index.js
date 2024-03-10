#!/usr/bin/env node
// Interactive Command Line Terminal

const helpCommand = require("./commands/help");
const createCommand = require("./commands/create");
const insertCommand = require("./commands/insert");
const updateCommand = require("./commands/update");
const deleteCollCommand = require("./commands/deleteColl");
const deleteDocCommand = require("./commands/deleteDoc");
const showsCollectionsCommand = require("./commands/showCollections");
const showDocumentsCommand = require("./commands/showDocuments");
const mySchemaClient = require("../utils/database/db");
const { spawn } = require("child_process");

class CLI {
    constructor() {
        this.apiProcess;
        this.cliStarted = false;
        this.commands = {
            // Database: creates a collection along with its schema.
            create:
                "\t\tCreates an collection with abstract attributes.\n\t\t\tUSAGE: create my_collection name1:type1 name2:type2 ...",
            // Database: Inserts a document in an existing collection according to its schema.
            insert:
                "\t\tInserts an entry in an existing collection.\n\t\t\tUSAGE: insert collection name1:type1 name2:type2 ...",
            // Database: Updates a document in an existing collection according to its schema.
            update:
                "\t\tUpdates an entry through its 'id' in an existing collection.\n\t\t\tUSAGE: update collection my_entry_id name1:type1 name2:type2 ...",
            // Database: Delets an existing collection.
            deleteCollection:
                "\tDeletes an existing collection.\n\t\t\tUSAGE: delete collection",
            // Database: Deletes a document in an existing collection.
            deleteDocument:
                "\tDeletes an entry through its 'id' from an existing collection.\n\t\t\tUSAGE: delete collection my_entry_id",
            // Database: Shows the collections in the database.
            showCollections:
                "\tShows the collection in the database.\n\t\t\tUSAGE: showCollection",
            // Database: Shows entries for a collection in the database.
            showDocuments:
                "\t\tShows entries for a collection in the database.\n\t\t\tUSAGE: showEntries <collection>",
        };
    }

    async startAPI() {
        return new Promise((resolve) => {
            let stdoutData = '(API) ';
    
            this.apiProcess = spawn("node", ["routes/APIServer.js"]);
    
            this.apiProcess.stdout.on("data", (data) => {
                const message = data.toString();
                stdoutData += message;
            });
    
            this.apiProcess.stderr.on("data", (data) => {
                process.stdout.write(`(API) Error: ${data}`);
            });
    
            this.apiProcess.stdout.on("data", (data) => {
                if (data.toString().includes("Server is running")) {
                    resolve(stdoutData);
                }
            });
        });
    } 
    async restartAPI() {
        if (this.apiProcess) {
            console.log("(API) Restarting API...");
            this.apiProcess.kill("SIGTERM"); // or 'SIGKILL' if SIGTERM doesn't work
            await this.startAPI();
        } else {
            console.log("(API) API is not running. Starting API...");
            await this.startAPI();
        }
    }

    async executeCommand(command) {
        const parts = command.split(/\s+/);
        const action = parts[0];
        const argument = parts.slice(1).join(" ");
        if (action === "help") {
            return helpCommand(this.commands);
        } else if (action === "create") {
            const res = createCommand(argument);
            if (res === "") {
                await this.restartAPI();
            }
            return res;
        } else if (action === "insert") {
            return insertCommand(argument);
        } else if (action === "update") {
            return updateCommand(argument);
        } else if (action === "deleteCollection") {
            return deleteCollCommand(argument);
        } else if (action === "deleteDocument") {
            return deleteDocCommand(argument);
        } else if (action === "showCollections") {
            return showsCollectionsCommand(argument);
        } else if (action === "showDocuments") {
            return showDocumentsCommand(argument);
        } else {
            return `Command not found, type 'help' for available commands.`;
        }
    }
    

    async setupInputHandlers() {
        await mySchemaClient.setupDatabase();

        process.stdin.setEncoding('utf8');

        process.stdin.on('data', async (data) => {
            const msg = await this.executeCommand(data.trim());
            if (msg) {
                process.stdout.write(`${msg}\n`);
            }
            process.stdout.write('(cmless) ');
        });
        
        process.on('SIGINT', () => {
            process.stdout.write("\nExiting CMLess...");
            mySchemaClient.disconnect();
            if (this.apiProcess) {
                this.apiProcess.kill("SIGTERM");
            }
            process.exit(0);
        });
    }

    async run() {
        console.log(`
---------------------------------------------
| Welcome to CMLess!                        |
| Type 'help' to see available commands.    |
---------------------------------------------
        `);

        process.stdout.write(await this.startAPI());
        this.setupInputHandlers(); // Set up input handlers
        process.stdout.write('(cmless) ');
    }
}

const myCLI = new CLI();
myCLI.run();
