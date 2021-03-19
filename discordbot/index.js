const config = require("../config/config.json");
const {Commands} = require('./Commands');
// const CommandHandler = require("./CommandHandler");
const {Team} = require('../models');
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log("FusionBot is ready with version: " + require('../package.json').version);
    client.user.setActivity('Bot running version: ' + require('../package.json').version);
    require("./workers")(client);
});
client.on('error', console.error);

client.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
    Team.createTeam(guild.id, guild.name, guild.iconURL);
});
client.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildMemberAdd", member => {
    console.log(member.user.username + " joined " + member.guild.name);
});
client.on("guildMemberRemove", member => {
    console.log(member.user.username + " left " + member.guild.name);
    Team.getTeam(member.guild.id).removeMember({discordUser: member.user.id});
});

client.on('message', message => {
    if (message.author.bot) return;
    if (message.content.toLocaleLowerCase().indexOf(config.prefix) !== 0) return;
    const args = message.content.replace(/,[ ]+/g, '')
        .slice(config.prefix.length).trim().match(/(?:[^\s"]+|"[^"]*")+/g)
        .map(arg => arg.replace(/^"+|"+$/g, ''));
    const cmd = args.shift().toLowerCase();

    Commands.run(client, message, cmd, args).catch(console.error);
    // const c = new CommandHandler(client);
    // c.executeCommand(message, cmd, args);
});


client.login(config.token).catch(console.error);