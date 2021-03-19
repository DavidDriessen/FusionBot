class CommandHandler {
    constructor(client) {
        this._client = client;
    }

    executeCommand(message, command, args) {
        const _command = new (require("./commands/" + command.toLowerCase()))(this._client, message);
        // noinspection JSUnresolvedFunction
        _command.setArgs(args).then(r =>
            _command.execute(...r));
    }
}

module.exports = CommandHandler;