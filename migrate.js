const env = process.env.NODE_ENV || 'development';
const config = require('./config/config')[env];

const Sequelize = require('sequelize');
const Umzug = require("umzug");
const sequelize = new Sequelize(config.database, config.username, config.password, config);
var umzug = new Umzug({
    migrations: {
        params: [sequelize.getQueryInterface(), Sequelize],
        path: "migrations"
    },
    storage: "sequelize",
    storageOptions: {
        sequelize: sequelize
    },
    logging: false
});

umzug.up().then(function (migrations) {
    if(migrations.length > 0)
        console.log("Migrations finished");
}).catch((err) => {
    console.log("error migrating DB: ");
    throw err;
    process.exit();
});
