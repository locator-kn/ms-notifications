'use strict';

const path = require('path');
const pwd = path.join(__dirname, '..', '/.env');
require('dotenv').config({path: pwd});

// init opbeat, secret and orga will be loaded from env
require('opbeat').start({
    appId: 'fdf8d5f93d',
    active: process.env['NODE_ENV'] === 'production'
});

const seneca = require('seneca')();

const myModule = require('./lib/module');

// select desired transport method
//const transportMethod = process.env['SENECA_TRANSPORT_METHOD'] || 'rabbitmq';


const patternPin = 'role:notifications';

// init seneca
seneca
    .add(patternPin + ',cmd:notify,entity:newLocation', myModule.notifyFollowerNewLocation)
    .add(patternPin + ',cmd:notify,entity:newImpression', myModule.notifyNewImpression)
    .add(patternPin + ',cmd:notify,entity:newFollower', myModule.notifyNewFollower)
    .add(patternPin + ',cmd:notify,entity:location,action:newFavorator', myModule.notifyMyLocationHasNewFavorator)

/*
    .act({
        role: 'notifications',
        cmd: 'notify',
        entity: 'newFollower',
        data: {
            user_id: '56e82bd502e5a70b4fccab8c',
            follow_id: '56e82bd502e5a70b4fccab8c',
            //  message: 'noch ein follower'
        }
    }, (err, result)=> {
        if (err) {
            return console.log('Error executing service', err);
        }
        console.log('Service executed, push sent', result);
    })*/


    //.listen({type: 'tcp', port: 7004, pin: patternPin});
    .use('mesh', {auto: true, pin: patternPin});

