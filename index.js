'use strict';

const path = require('path');
const pwd = path.join(__dirname, '..', '/.env');
require('dotenv').config({path: pwd});

const seneca = require('seneca')();
const myModule = require('./lib/module');
const database = require('./lib/database');


// select desired transport method
//const transportMethod = process.env['SENECA_TRANSPORT_METHOD'] || 'rabbitmq';


const patternPin = 'role:user';  // TODO: Change role

// init database and then seneca and expose functions
database.connect()
    .then(() => {
        seneca
            .add(patternPin + ',cmd:do', myModule.do)
            .add(patternPin + ',cmd:do,entity:something', myModule.doSomething)
            .add(patternPin + ',cmd:do,entity:else', myModule.doSomethingElse)
            .listen({type: 'tcp', port: 7001, pin: patternPin});
    });
