const Schedule = require("./schedule");

module.exports = function (client) {
    const schedule = new Schedule(client);
    schedule.start()

};