function stringToDataType(str) {
    switch(str.toLowerCase()) {
        case "bool":
            return "bool";
        case "int":
            return "int";
        case "string":
            return "string";
        default:
            return null; // or throw an error if the string is not recognized
    }
}

module.exports = stringToDataType;
