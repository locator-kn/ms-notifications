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
    .add(patternPin + ',cmd:notify,entity:newFollower', myModule.notifyNewFollower)
    .add(patternPin + ',cmd:notify,entity:location,action:newFavorator', myModule.notifyMyLocationHasNewFavorator)


    /*    .act({
     role: 'notifications',
     cmd: 'notify',
     entity: 'location',
     action: 'newFavorator',
     data: {
     favorator_id: '5708eca5dfc4f33d332d5105',
     loc_id: '5712484fb693cc428c605ba4',
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

