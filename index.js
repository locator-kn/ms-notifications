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
            .add(patternPin + ',cmd:notify,entity:newLocation', myModule.notifyFollowerNewLocation)
            .add(patternPin + ',cmd:notify,entity:newFollower', myModule.notifyNewFollower)
            .add(patternPin + ',cmd:notify,entity:location,action:newFavorator', myModule.notifyMyLocationHasNewFavorator)

/*
           .act({
                role: 'notifications',
                cmd: 'notify',
                entity: 'newFollower',
                data: {
                    user_id: '569e4a83a6e5bb503b838306',
                    follower_id: '569e4a83a6e5bb503b838306',
                  //  message: 'noch ein follower'
                }
            }, (err, result)=> {
                if (err) {
                    return console.log('Error executing service', err);
                }
                console.log('Service executed, push sent', result);
            })*/


            //.listen({type: 'tcp', port: 7004, pin: patternPin});
            .use('mesh',{auto:true, pin:patternPin});
    })
    .catch(err => {
        log.fatal(err, 'MS-Notification is unable to connect to Database');
    });
