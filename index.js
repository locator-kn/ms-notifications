'use strict';

const path = require('path');
const pwd = path.join(__dirname, '..', '/.env');
require('dotenv').config({path: pwd});

const seneca = require('seneca')();
const myModule = require('./lib/module');
const database = require('./lib/database');

const log = require('ms-utilities').logger;


// select desired transport method
//const transportMethod = process.env['SENECA_TRANSPORT_METHOD'] || 'rabbitmq';


const patternPin = 'role:notifications';

// init database and then seneca and expose functions
database.connect()
    .then(() => {
        seneca
            .add(patternPin + ',cmd:notify,entity:message', myModule.notifyNewMessage)
            .listen({type: 'tcp', port: 7001, pin: patternPin});
    })
    .catch(err => {
        log.fatal(err, 'MS-Notification is unable to connect to Database');
    });
