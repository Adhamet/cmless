function helpCommand(commands) {
    console.log(`----------------------`);
    console.log(`| Available Commands |`);
    console.log(`----------------------`);
    for (const [cmd, description] of Object.entries(commands)) {
        console.log(`${cmd}: ${description}`);
    }
}

module.exports = helpCommand;
