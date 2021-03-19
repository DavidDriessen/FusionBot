const {pageToImage} = require("../PageToImage");
const {refresh} = require("../functions");
const {Team, Event} = require("../../models");
const {Op} = require("sequelize");
const moment = require('moment');
const {CronJob} = require('cron');

class Worker extends CronJob {
    constructor(client, cron) {
        super(cron);
        this.client = client;
        this.addCallback.call(this, this.run);
        this.lastExecution = moment.unix(0).toDate();
        this.fireOnTick.call(this);
    }
}

class Schedule extends Worker {
    constructor(client) {
        super(client, "0 */30 * * * *");
    }

    async updateSchedule(team) {
        await refresh(this.client, this.message.channel, async () => {
            return pageToImage(config.host + "/timetable?team=" + team.name,
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

    getTeamsWithChangedSchedule() {
        return Team.findAll({
            include: [{
                as: "events",
                model: Event,
                where: {
                    updatedAt: {
                        [Op.gte]: this.lastDate()
                    }
                }
            }]
        });
    }

    async run() {
        const teams = await this.getTeamsWithChangedSchedule();
        for (const team of teams)
            this.updateSchedule(team);
    }
}

module.exports = Schedule;