function createCommand(command) {
    const parts = command.split(/\s+/);

    if (parts.length < 2) {
        console.log("Invalid format.");
        console.log("USAGE: create my_article name1:type1 name2:type2 ...");
        return;
    }

    const articleName = parts[0];
    const typesAndNames = [];

    for (let i = 1; i < parts.length; i++) {
        const pair = parts[i].split(':');
        if (pair.length !== 2) {
            console.log("Invalid format.");
            console.log("USAGE: create my_article name1:type1 name2:type2 ...");
            return;
        }
        const name = pair[0];
        const type = pair[1];
        typesAndNames.push({ name, type });
    }

    console.log('Article Name:', articleName);
    console.log('Names and Types:', typesAndNames);

    // Store the article name and types/names in your database
    // Replace the console.log statements with database storage logic
}

module.exports = {
    createCommand
};
