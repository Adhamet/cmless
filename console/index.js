#!/usr/bin/env node
// Interactive Command Line Terminal

const readline = require('readline');
const { createCommand } = require('./commands/create');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '(cmless) '
});

console.log('Welcome to CMLess!');
rl.prompt();

rl.on('line', (line) => {
    const command = line.trim();

    if (isValidCommand(command)) {
        
    } else {
        console.log(`Invalid command: ${command}`);
    }

    rl.prompt();
}).on('close', () => {
    console.log('\nExiting CMLess...');
    process.exit(0);
});

function isValidCommand(command) {
    let regex;
    return regex.test(command);
}
