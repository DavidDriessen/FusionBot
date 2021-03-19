const Command = require("../Command");
const {Team} = require("../../models");

class addevent extends Command {
    async execute(name__string, start__moment, end__moment_float) {
        if (!isNaN(end__moment_float))
            end__moment_float = start__moment.clone().add(end__moment_float, "hours");
        if (await confirm(this.message, "**Are these details correct?**\n" +
            "**Name:** " + name__string +
            "\n**Start:** " + start__moment.format("dddd Do of MMMM [at] hh:mm a") +
            "\n**End:** " + end__moment_float.format("dddd Do of MMMM [at] hh:mm a")))
            (await Team.getTeam(this.message.guild.id)).createEvent({
                name: name__string,
                start: start__moment,
                end: end__moment_float
            });
    }
}

module.exports = addevent;