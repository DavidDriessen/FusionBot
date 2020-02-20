const {Confirmation} = require('discord-interface');
const Discord = require('discord.js');
const axios = require('axios');
const fs = require('fs');

function confirm(message, text) {
    let confirmation = Confirmation.create(message, {time: 30000, userID: message.author.id, text: text});
    return new Promise((resolve, reject) => {
        confirmation.on('confirmation', confirmed => {
            if (confirmed) {
                resolve(confirmed);
                confirmation.collector.emit('end', undefined, 'time');
            } else {
                resolve(confirmed);
            }
        });
    });
}

function downloadAttachment(message, conditions = {ext: ['png', 'jpg', 'css'], file: './temp'}) {
    if (!message.attachments.first()) return;
    const ext = message.attachments.first().filename.split('.').pop();
    if (conditions.ext.indexOf(ext) >= 0) return;
    return new Promise(async (resolve, reject) => {
        const url = message.attachments.first().url;
        const writer = fs.createWriteStream(conditions.file + '.' + ext);
        const response = await axios({url, method: 'GET', responseType: 'stream'});
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
    })
}

function requestSub(event) {

}

function broadcast(funcsWithData, acceptNr, rejectNr) {
    return new Promise((resolve, reject) => {
        const eventEmitter = new EventEmitter();
        let nData = [];
        let rejected = 0;
        if (!acceptNr) acceptNr = 1;
        if (!rejectNr) rejectNr = funcsWithData.length - acceptNr + 1;
        const resolveOne = (response) => {
            nData.push(response);
            if (nData.length >= acceptNr) {
                eventEmitter.emit('cancel');
                if (acceptNr > 1)
                    resolve(nData);
                else
                    resolve(nData[0]);
            }
        };
        const rejectOne = () => {
            rejected++;
            if (rejected >= rejectNr) {
                eventEmitter.emit('cancel');
                reject();
            }
        };
        for (const funcWithData of funcsWithData) {
            funcWithData[0](...funcWithData[1], eventEmitter).then(resolveOne).catch(rejectOne);
        }
    });
}

function acceptProposal(channel, team, proposal, toTeam, eventEmitter) {
    return new Promise(async (resolve, reject) => {
        const reactions = ["✅", "❎", "0⃣", "1⃣", "2⃣"];
        const filter = (reaction, user) => (reactions.includes(reaction.emoji.name) || reactions.includes(reaction.emoji.id)) && !user.bot;
        const message = await channel.send(new Discord.RichEmbed()
            .setColor('BLUE')
            .setDescription("**Do you accept this event?**" +
                "\n**Team:** " + team.name +
                "\n**Name:** " + proposal.name +
                "\n**Start:** " + proposal.start.format("dddd Do of MMMM [at] hh:mm a") +
                "\n**End:** " + proposal.end.format("dddd Do of MMMM [at] hh:mm a") +
                "\n\nForce accept with:" +
                "\n0⃣ for full team." +
                "\n1⃣ team with 1 sub." +
                "\n2⃣ team with 2 subs."
            )
        );
        const collector = message.createReactionCollector(filter);
        const cancelFunc = () => {
            collector.stop();
        };
        if (eventEmitter) eventEmitter.on('cancel', cancelFunc);
        for (let reaction of reactions) {
            await message.react(reaction);
        }
        const onDelete = (deletedMessage) => {
            if (deletedMessage.id === message.id) {
                collector.stop();
            }
        };
        message.client.on('messageDelete', onDelete);
        collector.on('collect', async reaction => {
            if (reaction.emoji.name === reactions[0] || reaction.emoji.id === reactions[0]) {
                const uReactions = reaction.users.map(u => u.id);
                for (const member of await toTeam.getMembers()) {
                    if (uReactions.indexOf(member.discordUser) === -1) return;
                }
                resolve();
            } else if (reaction.emoji.name === reactions[1] || reaction.emoji.id === reactions[1]) {
                reject();
            } else if (reaction.emoji.name === reactions[2] || reaction.emoji.id === reactions[2]) {
                resolve();
            } else if (reaction.emoji.name === reactions[3] || reaction.emoji.id === reactions[3]) {
                resolve();
            } else if (reaction.emoji.name === reactions[4] || reaction.emoji.id === reactions[4]) {
                resolve();
            } else return;
            collector.stop();
        });
        collector.on('end', (collected, reason) => {
            message.client.removeListener('messageDelete', onDelete);
            if (eventEmitter) eventEmitter.removeListener('cancel', cancelFunc);
            message.delete();
        });
    });
}

function question(message, text) {
    const filter = response => {
        response.delete();
        // return !isNaN(response.content);
        return response.author === message.author;
    };
    return new Promise((resolve, reject) => {
        message.channel.send(text).then((q) => {
            message.channel.awaitMessages(filter, {maxMatches: 1, time: 60000, errors: ['time']})
                .then(collected => {
                    q.delete();
                    resolve(collected.first().content);
                    collected.first().delete();
                })
                .catch(collected => {
                    q.delete();
                    message.channel.send('Looks like nobody got the answer this time.').delete(1000);
                    reject();
                });
        });
    });
}

async function refresh(client, channel, func) {
    let m = await channel.send(await func());
    const reactions = ["🔄"];
    for (let i = 0; i < reactions.length; i++) {
        await m.react(reactions[i]);
    }

    let filter = (reaction, user) => (reactions.includes(reaction.emoji.name) || reactions.includes(reaction.emoji.id) || true);
    const collector = m.createReactionCollector(filter, this.options);

    const onDelete = (deletedMessage) => {
        if (deletedMessage.id === m.id) {
            collector.stop();
        }
    };
    m.client.on('messageDelete', onDelete);

    collector.on('collect', (reaction, user) => {
        if (reaction.users.some(u => !u.bot)) {
            collector.stop();
            refresh(client, channel, func);
            // await m.edit(await func());
            // for (const u of reaction.users)
            //     if (!u[1].bot)
            //         await reaction.remove(u[1]);
        }
    });

    collector.on('end', (collected, reason) => {
        m.client.removeListener('messageDelete', onDelete);
        m.delete();
    });
}

const reactions = ["0⃣", "1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"];

function choice(channel, options, map = i => i) {
    return new Promise(async (resolve, reject) => {
        let text = "";
        for (let i = 0; i < options.length; i++) {
            text += reactions[i] + ": " + await map(options[i]) + "\n";
        }
        let poll = await channel.send(new Discord.RichEmbed()
            .setColor('RANDOM')
            .setDescription(text)
        );

        let filter = (reaction, user) => (reactions.includes(reaction.emoji.name) || reactions.includes(reaction.emoji.id)) && !user.bot;
        const collector = poll.createReactionCollector(filter, this.options);

        collector.on('collect', reaction => {
            let option = reactions.indexOf(reaction.emoji.name);
            if (option < 0) option = reactions.indexOf(reaction.emoji.id);
            if (option < 0) return;
            poll.delete();
            resolve(options[option]);
        });

        collector.on('end', async (collected, reason) => {
            resolve();
            await poll.delete();
        });

        for (let i = 0; i < options.length; i++) {
            if (poll.deleted) return collector.stop();
            await poll.react(reactions[i]);
        }
    });
}

function getDefaultChannel(guild) {
    // get "original" default channel
    if (guild.channels.has(guild.id))
        return guild.channels.get(guild.id);

    // Check for a "general" channel, which is often default chat
    const generalChannel = guild.channels.find(channel => channel.name === "general");
    if (generalChannel)
        return generalChannel;
    // Now we get into the heavy stuff: first channel in order where the bot can speak
    // hold on to your hats!
    return guild.channels
        .filter(c => c.type === "text" &&
            c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
        .sort((a, b) => a.position - b.position ||
            Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
        .first();
}

module.exports = {question, confirm, refresh, choice, getDefaultChannel, acceptProposal, downloadAttachment, broadcast};
