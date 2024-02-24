#!/usr/bin/env node
// Interactive Command Line Terminal

const readline = require('readline');
const { createCommand } = require('./commands/create');
const { helpCommand } = require('./commands/help');

class CLI {
    constructor() {
        this.commands = {
            "create": "\tCreates an article of any attributes.\n\t\tUSAGE: create my_article name1:type1 name2:type2 ..."
        };
    }

    run() {
        console.log("Welcome to CMLess!");
        console.log("Type 'help' to see available commands.");

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.setPrompt("(cmless) ");

        rl.prompt();

        rl.on('line', (input) => {
            this.executeCommand(input.trim());
            process.stdout.write("(cmless) ");
        });

        rl.on('close', () => {
            console.log("\nExiting CMLess...");
        })
    }
    
    executeCommand(command) {
        const parts = command.split(/\s+/);
        const action = parts[0];
        const argument = parts.slice(1).join(' ');

        if (action === 'help') {
            helpCommand(this.commands);
        } else if (action === 'create') {
            createCommand(argument);
        } else {
            console.log("Command not found, type 'help' for available commands.");
        }
    }
}

const myCLI = new CLI();
myCLI.run();
