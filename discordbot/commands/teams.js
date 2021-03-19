const Command = require("../Command");
const {Team} = require("../../models");

class teams extends Command {
    async execute() {
        this.message.channel.send((await Team.findAll()).map(t => t.name).join("\n")).then(r => r.delete(2 * 6000));
    }
}

module.exports = teams;