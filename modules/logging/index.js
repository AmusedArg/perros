var appRoot = require('app-root-path'),
    winston = require('winston'),

    // singleton
    logger,

    createLogger = function createLogger() {

        if(logger){
            return logger;
        }

        /* Logger definition */
        logger = new (winston.Logger)({
            transports: [
                new (winston.transports.Console)(),
                new (winston.transports.File)({
                    name: 'info-file',
                    filename: appRoot+'/logs/app.log',
                    level: 'info'
                }),
                new (winston.transports.File)({
                    name: 'error-file',
                    filename: appRoot+'/logs/app-error.log',
                    level: 'error'
                })
            ]
        });

        return logger;
    };

module.exports = createLogger;