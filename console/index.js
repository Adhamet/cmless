#!/usr/bin/env node
// Interactive Command Line Terminal

const helpCommand = require("./commands/help");
const createCommand = require("./commands/create");
const insertCommand = require("./commands/insert");
const updateCommand = require("./commands/update");
const deleteCollCommand = require("./commands/deleteColl");
const deleteDocCommand = require("./commands/deleteDoc");
const showCollCommand = require("./commands/showCollections");
const showCollAttrsCommand = require("./commands/showCollAttrs");
const showDocCommand = require("./commands/showDocuments");
const mySchemaClient = require("../utils/database/db");
const { spawn } = require("child_process");

class CLI {
    constructor() {
        this.apiProcess;
        this.commands = {
            // Database: creates a collection along with its schema.
            create:
                "\t\tCreates an collection with abstract attributes or edit attributes.\n\t\t\tUSAGE: create <collection> <name1:type1> <name2:type2> ...\n",
            // Database: Inserts a document in an existing collection according to its schema.
            insert:
                "\t\tInserts a document in an existing collection.\n\t\t\tUSAGE: insert <collection> <name1:value1> <name2:value2> ...\n\t\t\tNote: For string put in between double qoutes.\n",
            // Database: Updates a document in an existing collection according to its schema.
            update:
                "\t\tUpdates a document through its 'id' in an existing collection.\n\t\t\tUSAGE: update <collection> <doc> <name1:value1> <name2:value2> ...\n\t\t\tNote: For string put in between double quotes.\n",
            // Database: Delets an existing collection.
            delColl:
                "\t\tDeletes an existing collection.\n\t\t\tUSAGE: delColl <collection>\n",
            // Database: Deletes a document in an existing collection.
            delDoc:
                "\t\tDeletes a document through its 'id' from an existing collection.\n\t\t\tUSAGE: delDoc <collection> <my_entry_id>\n",
            // Database: Shows the collections in the database.
            showColls:
                "\t\tShows the collection in the database.\n\t\t\tUSAGE: showColls\n",
            showAttrs:
                "\t\tShows an existing collection in the database's attributes.\n\t\t\tUSAGE: showAttrs <collection>\n",
            // Database: Shows entries for a collection in the database.
            showDocs:
                "\t\tShows documents for a collection in the database.\n\t\t\tUSAGE: showDocs <collection>",
        };
    }

    async startAPI() {
        return new Promise((resolve) => {
            let stdoutData = '(API) ';
    
            this.apiProcess = spawn("node", ["routes/APIServer.js"]);
    
            this.apiProcess.stdout.on("data", (data) => {
                const message = data.toString();
                stdoutData += message;
                if (data.toString().includes("Server is running")) {
                    resolve(stdoutData);
                }
            });
    
            this.apiProcess.stderr.on("data", (data) => {
                process.stdout.write(`(API) Error: ${data}`);
            });
        });
    } 
    async restartAPI() {
        if (this.apiProcess) {
            console.log("(API) Restarting API...");
            this.apiProcess.kill("SIGTERM"); // or 'SIGKILL' if SIGTERM doesn't work
            const res = await this.startAPI();
            if (res.includes("Server is running")) {
                console.log("(API) Restarted successfully.");
            }
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
        } else if (action === "delColl") {
            return deleteCollCommand(argument);
        } else if (action === "delDoc") {
            return deleteDocCommand(argument);
        } else if (action === "showColls") {
            return showCollCommand(argument);
        }   else if (action === "showAttrs") {
            return showCollAttrsCommand(argument);
        } else if (action === "showDocs") {
            return showDocCommand(argument);
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
  ┌──────────────────────────────────────────────┐
  │                                              │
  │   Welcome to CMLess!                         │
  │   Type 'help' to see available commands      │
  │                                              │
  └──────────────────────────────────────────────┘
`);


        process.stdout.write(await this.startAPI());
        this.setupInputHandlers(); // Set up input handlers
        process.stdout.write('(cmless) ');
    }
}

const myCLI = new CLI();
myCLI.run();
