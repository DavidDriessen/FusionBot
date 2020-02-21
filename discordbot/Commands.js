const moment = require("moment");
const {Team, Member} = require("../models");
const config = require('../config/config');
const fnArgs = require('get-function-arguments');
const {choice} = require("./functions");
const Discord = require('discord.js');
const {broadcast} = require("./functions");
const {downloadAttachment} = require("./functions");
const {acceptProposal} = require("./functions");
const {getDefaultChannel} = require("./functions");
const {refresh, confirm} = require("./functions");
const {pageToImage} = require("./PageToImage");
const Op = require('sequelize').Op;

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

class Commands {
    constructor(client, message) {
        this.client = client;
        this.message = message;
        message.delete(1000).catch(console.error);
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

    checkPermission(roles) {
        if (!this.message.member.roles.some(r => roles.includes(r.name)))
            throw new CommandError("Sorry, you don't have permissions to use this!");
    }

    static async run(client, message, cmd, args) {
        try {
            const c = new Commands(client, message);
            if (c[cmd]) {
                const params = fnArgs(c[cmd]).map(r => r.split('__')[1].split('_'));
                if (args.length < params.filter(r => r.slice(-1)[0] !== '').length) throw new CommandError('Not enough arguments.');
                for (let i = 0; i < params.length; i++) {
                    args[i] = await c.parseArg(args[i], params[i]);
                }
                c[cmd](...args);
            } else throw new CommandError('Unknown command ' + cmd);
        } catch (e) {
            if (e instanceof CommandError)
                e.handle(message.channel);
            else console.error(e);
        }
    }

    async broadcastproposal(name__string, start__moment, end__moment_float) {
        if (!isNaN(end__moment_float))
            end__moment_float = start__moment.clone().add(end__moment_float, "hours");
        if (await confirm(this.message, "**Are these details correct?**\n" +
            "\n**Teams:** " + (await Team.findAll()).map(t => t.name).join(", ") +
            "\n**Name:** " + name__string +
            "\n**Start:** " + start__moment.format("dddd Do of MMMM [at] hh:mm a") +
            "\n**End:** " + end__moment_float.format("dddd Do of MMMM [at] hh:mm a"))) {
            const team = await Team.getTeam(this.message.guild.id);
            const proposal = team.createProposal({
                name: name__string,
                start: start__moment,
                end: end__moment_float
            });
            let a = [];
            for (const toTeam of await Team.findAll()) {
                const guild = this.client.guild.get(toTeam.guild);
                let channel = guild.channels.get(toTeam.channel);
                if (!channel) channel = getDefaultChannel(guild);
                a.push([acceptProposal, [channel, team, proposal, toTeam]])
            }
            broadcast(a, 1).then((t) => {
                this.message.channel.send(new Discord.RichEmbed().setTitle("Proposal is accepted.")
                    .setDescription("Team **" + t.name + "** have accepted your proposal."));
                proposal.setTo_team(t);
                proposal.accept = 1;
                proposal.save();
            }).catch(() => {
                this.message.channel.send(new Discord.RichEmbed().setTitle("Proposals were denied.")
                    .setDescription("All the teams have denied your proposal."));
                proposal.destroy();
            });
        }
    }

    async proposeevent(team__team, name__string, start__moment, end__moment_float) {
        if (!isNaN(end__moment_float))
            end__moment_float = start__moment.clone().add(end__moment_float, "hours");
        if (await confirm(this.message, "**Are these details correct?**\n" +
            "\n**Team:** " + team__team.name +
            "\n**Name:** " + name__string +
            "\n**Start:** " + start__moment.format("dddd Do of MMMM [at] hh:mm a") +
            "\n**End:** " + end__moment_float.format("dddd Do of MMMM [at] hh:mm a"))) {
            const team = await Team.getTeam(this.message.guild.id);
            const proposal = await team.createProposal({
                name: name__string,
                start: start__moment,
                end: end__moment_float
            });
            const guild = this.client.guilds.get(team__team.guild);
            let channel = guild.channels.get(team__team.channel);
            if (!channel) channel = getDefaultChannel(guild);
            acceptProposal(channel, team, proposal, team__team).then(() => {
                this.message.channel.send(new Discord.RichEmbed().setTitle("Proposal is accepted.")
                    .setDescription("Team **" + team__team.name + "** has accepted your proposal."));
                proposal.setTo_team(team__team);
                proposal.accept = 1;
                proposal.save();
            }).catch(() => {
                this.message.channel.send(new Discord.RichEmbed().setTitle("Proposal was denied.")
                    .setDescription("Team **" + team__team.name + "** has denied your proposal."));
                proposal.destroy();
            });
        }
    }

    async teams() {
        this.message.channel.send((await Team.findAll()).map(t => t.name).join("\n")).then(r => r.delete(2 * 6000));
    }

    async team(team__team_) {
        let team = team__team_;
        if (!team) team = await Team.getTeam(this.message.guild.id);
        const members = await team.getMembers();
        this.message.channel.send(new Discord.RichEmbed().setTitle('Members of ' + team.name)
            .setDescription(members.map(m => m.name).join("\n"))).then(r => r.delete(5 * 6000));
    }

    async setteamname(name__string) {
        this.checkPermission(["Admin", "Team Captain"]);
        const team = await Team.getTeam(this.message.guild.id);
        team.name = name__string;
        team.save();
    }

    async setchannel(channel__channel) {
        const team = await Team.getTeam(this.message.guild.id);
        team.channel = channel__channel.id;
        team.save();
    }

    async addteammember(user__mention, name__string_) {
        this.checkPermission(["Admin", "Team Captain"]);
        const team = await Team.getTeam(this.message.guild.id);
        const member = await Member.findOne({where: {discordUser: user__mention.id}});
        if (member) {
            member.setTeam(team);
        } else {
            team.createMember({
                discordUser: user__mention.id,
                name: (name__string_) ? name__string_ : user__mention.username
            });
        }
    }

    async removeteammember(user__mention) {
        this.checkPermission(["Admin", "Team Captain"]);
        const team = await Team.getTeam(this.message.guild.id);
        const member = await Member.findOne({where: {discordUser: user__mention.id}});
        if (member)
            team.removeMember(member);
    }

    async events() {
        this.message.channel.send(new Discord.RichEmbed()
            .setDescription((await (await Team.getTeam(this.message.guild.id)).getEvents({
                where: {
                    start: {[Op.gt]: moment().startOf("week")}
                }
            }).then(e => (e.length === 0) ? "No events planned." :
                e.map(i => i.id + "=" + i.name + ": " + i.start.format("dd hh:mm")
                    + "-" + i.end.format("dd hh:mm")).join("\n")
            )))).then(m => m.delete(5 * 6000));
    }

    async addevent(name__string, start__moment, end__moment_float) {
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

    async removeevent(event__float) {
        const event = (await (await Team.getTeam(this.message.guild.id)).getEvents({where: {id: event__float}}))[0];
        if (!event) throw new CommandError('Event with id: ' + event__float + ' not found.');
        if (await confirm(this.message, "**Are you sure you want to delete this event?**\n" +
            "**Name:** " + event.name +
            "\n**Start:** " + event.start.format("dddd Do [of] MMMM [at] hh:mm a") +
            "\n**End:** " + event.end.format("dddd Do [of] MMMM [at] hh:mm a")))
            event.destroy();
    }

    async schedule(team__team_float_) {
        let team = await team__team_float_;
        if (!(team instanceof Team)) team = await Team.getTeam(this.message.guild.id);
        await refresh(this.client, this.message.channel, async () => {
            return pageToImage("http://localhost:8080/timetable?team=" + team.name,
                __dirname + "/../tmp/" + team.name + ".jpg")
                .then((fileUrl) => {
                    const attachment = new Discord.Attachment(fileUrl);
                    return new Discord.RichEmbed().attachFile(attachment);
                }).catch((e) => {
                    console.error(e);
                    return "Something went wrong:\n" + e.message();
                });
        });
    }

    ping() {
        this.message.channel.send("Ping?").then(m => {
            m.edit(`Pong! Latency is ${m.createdTimestamp - this.message.createdTimestamp}ms. API Latency is ${Math.round(this.client.ping)}ms`);
            m.delete(5000);
        });
    }

    clear() {
        // this.message.channel.fetchMessages().then(msgs => msgs.forEach(msg => msg.delete().catch(e => console.error(e))));
    }

    help() {
        this.message.channel.send(new Discord.RichEmbed().setTitle("Team scheduling bot commands:").setDescription(
            "**" + config.prefix + "setteamname <name>**:\n Change the name of the team. Default is Discord server name.\n" +
            "**" + config.prefix + "team**:\n List members in the team.\n" +
            "**" + config.prefix + "teams**:\n List all teams.\n" +
            "**" + config.prefix + "addteammember <@discord_user> <name>**:\n Add user to the main team. <name> defaults to <@discord_user> username.\n" +
            "**" + config.prefix + "removeteammember <@discord_user>**:\n Remove from the main team.\n" +
            "**" + config.prefix + "events**:\n List events on the schedule.\n" +
            "**" + config.prefix + "removeevent <event_id>**:\n Remove a event from the schedule.\n" +
            "**" + config.prefix + "addevent \"<name>\" \"<start>\" \"<end>\"**:\n Add an event to the schedule.\n" +
            "**" + config.prefix + "proposeevent \"<team_name>\" \"<name>\" \"<start>\" \"<end>\"**:\n Propose an event to a team.\n" +
            " - <start> and <end> are datetime type '" + config.prefix + "formats' to get acceptable time dateTimeFormats.\n" +
            " - <end> can also be the length of the event. For example '1.5' is 1 hour and 30 minutes.\n" +
            "**" + config.prefix + "schedule <team>**:\n Show the schedule of a team with availability from the website FusionBot.my-server.nl. <team> defaults to your team.\n")
        ).then(m => m.delete(5 * 6000));
    }

    formats() {
        let text = "Format: example uk time\n";
        for (const format of dateTimeFormats) {
            text += format + ": " + moment().subtract(1, "hour").add(1, "day").format(format) + "\n";
        }
        this.message.channel.send(new Discord.RichEmbed().setTitle("Time dateTimeFormats:").setDescription(text)
        ).then(m => m.delete(5 * 6000));
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

module.exports = {CommandError, Commands};
