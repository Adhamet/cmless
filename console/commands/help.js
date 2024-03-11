function helpCommand(commands) {
    console.log(`┌──────────────────────┐`);
    console.log(`│  Available Commands  │`);
    console.log(`└──────────────────────┘`);
    
    for (const [cmd, description] of Object.entries(commands)) {
        console.log(`${cmd}: ${description}`);
    }

    console.log(`┌─────────────────────────────────────────────────┐`);
    console.log(`│  Note: Types available are: string, bool, int.  │`);
    console.log(`└─────────────────────────────────────────────────┘`);
}

module.exports = helpCommand;
