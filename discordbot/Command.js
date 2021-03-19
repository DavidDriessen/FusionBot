const fnArgs = require('get-function-arguments');
const moment = require("moment");

const dateTimeFormats = ["H:mm", "h:mm a",
    "dd H:mm", "dd h:mm a", "ddd H:mm", "ddd h:mm a",
    "DD H:mm", "DD h:mm a",];

function getMomentFromString(string) {
    function checkFormat(format) {
        return moment(string, format, true).isValid();
    }

    for (let key in dateTimeFormats) {
        if (dateTimeFormats.hasOwnProperty(key))
            if (checkFormat(dateTimeFormats[key])) {
                let date = moment(string, dateTimeFormats[key]);
                switch (key) {
                    case 0:
                    case 1:
                        if (date < moment())
                            date.add(1, "day");
                        break;
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        if (date.isoWeekday() < moment().isoWeekday())
                            date.add(1, "week");
                        break;
                    case 6:
                        if (date.date() < moment().date())
                            date.add(1, "month");
                        break;
                    default:
                }
                return date;
            }
    }
}

class Command {
    _args = [];

    constructor(client, message) {
        // noinspection JSUnusedGlobalSymbols
        this.client = client;
        // noinspection JSUnusedGlobalSymbols
        this.message = message;
        if (this.constructor === Command) {
            throw new TypeError('Abstract class "Command" cannot be instantiated directly.');
        }

        if (this.execute === undefined) {
            throw new TypeError('The command has no function.');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    checkPermission(roles) {
        if (!this.message.member.roles.some(r => roles.includes(r.name)))
            throw new CommandError("Sorry, you don't have permissions to use this!");
    }

    async parseArg(arg, types) {
        let temp;
        for (const type of types) {
            switch (type) {
                case"string":
                    return arg;
                case "moment":
                    temp = getMomentFromString(arg);
                    if (temp) return temp;
                    break;
                case "float":
                    temp = +arg;
                    if (!isNaN(temp)) return temp;
                    break;
                case "team":
                    return await new Promise(async (resolve, reject) => {
                        if (!arg) return resolve();// resolve(Team.getTeam(this.message.guild.id));
                        let team = await Team.findByName(arg);
                        if (team.length === 0) return reject("Team '" + arg + "'not found.");
                        if (team.length === 1) return resolve(team[0]);
                        team = await choice(this.message, team, i => i.name);
                        if (team) resolve(team);
                        else reject();
                    }).catch(m => {
                        throw new CommandError(m)
                    });
                case "mention":
                    // The id is the first and only match found by the RegEx.
                    const mentionMatches = arg.match(/^<@!?(\d+)>$/);
                    // If supplied variable was not a mention, matches will be null instead of an array.
                    if (!mentionMatches) break;
                    // However the first element in the matches array will be the entire mention, not just the ID,
                    // so use index 1.
                    const user = this.client.users.get(mentionMatches[1]);
                    if (!user) break;
                    return user;
                case "channel":
                    // The id is the first and only match found by the RegEx.
                    const channelMatches = arg.match(/^<#?(\d+)>$/);
                    // If supplied variable was not a mention, matches will be null instead of an array.
                    if (!channelMatches) break;
                    // However the first element in the matches array will be the entire mention, not just the ID,
                    // so use index 1.
                    const channel = this.client.channels.get(channelMatches[1]);
                    if (!channel) break;
                    return channel;
                default:
                    return undefined;
            }
        }
        switch (types[0]) {
            case "moment":
                throw new CommandError(arg + ' is not a valid format');
            case "team":
                throw new CommandError(arg + ' not found');
            case "channel":
                throw new CommandError(arg + ' not a channel');
        }
    }

    async setArgs(args) {
        const params = fnArgs(this.execute).map(r => r.split('__')[1].split('_'));
        if (args.length < params.filter(r => r.slice(-1)[0] !== '').length) throw new CommandError('Not enough arguments.');
        for (let i = 0; i < params.length; i++) {
            this._args[i] = await this.parseArg(args[i], params[i]);
        }
        return this._args;
    }
}

class CommandError extends Error {
    constructor(args) {
        super(args);
        this.name = "Error:";
    }

    handle(channel) {
        channel.send(new Discord.RichEmbed().setTitle(this.name)
            .setDescription(this.message)).then(r => r.delete(6000));
    }
}

module.exports = Command;