'use strict';

const db = require('./database');
const Joi = require('joi');

const validation = require('./validation');
const push = require('./push');

const log = require('ms-utilities').logger;

const fns = {};

//Someone you follow creates a new location
fns.notifyFollowerNewLocation = (message, next) => {

    Joi.validate(message.data, validation.notifyNewLocation, (err, data) => {

        if (err) {
            log.error(err, 'Validation failed of new locations notify service');
            return next(err);
        }

        next(null, {ok: true});

        let message = data.user_name + ' hat eine neue Location erstellt. Schau sie dir an!';

        db.getFollowersByUserId(data.user_id)
            .then(follower => {

                follower.forEach(user => {

                    return db.getDeviceByUserId(user._id)
                        .then(reveiverDevices => push.sendPush(reveiverDevices, message, 'location', data.location_id));
                });
            })
            .catch(err=> {
                log.error(err, 'Error executing notify new message service');
                // next(err);
            });


    });

};

//Someone follows you
fns.notifyNewFollower = (message, next) => {


    Joi.validate(message.data, validation.notifyNewFollower, (err, data) => {

        if (err) {
            log.error(err, 'Validation failed of new follower notify service');
            return next(err);
        }

        let user1 = db.getUserNameById(data.follow_id);
        let user2 = db.getUserNameById(data.user_id);
        Promise.all([user1, user2])
            .then(values => {
                let message = {};
                message.text = values[0] + ' folgt dir jetzt!';
                message.follower = data.follow_id;
                message.recName = values[1];

                let recieverDevice = {};//for development
                recieverDevice.pushToken = process.env['PUSH_TOKEN'];//for development
                recieverDevice.type = 'android';//for development

                /*
                 return db.getDeviceByUserId(data.user_id)
                 .then(recieverDevice => {
                 push.sendPush(recieverDevice, message);

                 });*/

                push.sendPush(recieverDevice, message);
                next(null, {ok: true});
                console.log('new follower test');
            }).catch(err=> {
                log.error(err, 'Error executing notify new message service');
                // next(err);
            });
    });

};

//Someone favorites a location of you
fns.notifyMyLocationHasNewFavorator = (message, next) => {
    Joi.validate(message.data, validation.notifyNewLocFavorator, (err, data) => {

        if (err) {
            log.error(err, 'Validation failed of new location follower notify service');
            return next(err);
        }

        let favorator = db.getUserNameById(data.favorator_id);
        let location = db.getLocationById(data.loc_id);

        Promise.all([favorator, location])
            .then(values => {

                let to = db.getUserNameById(values[1].user_id);
                Promise.resolve(to)
                    .then(owner => {

                        let message = {};
                        message.text = values[0] + ' folgt jetzt deiner Location ' + values[1].title + '!';
                        message.follower = data.favorator_id;

                        message.recName = owner;

                        let recieverDevice = {};//for development
                        recieverDevice.pushToken = process.env['PUSH_TOKEN'];//for development
                        recieverDevice.type = 'android';//for development


                        /*
                         return db.getDeviceByUserId(values[1].user_id)
                         .then(recieverDevice => {
                         push.sendPush(recieverDevice, message);

                         });*/

                        push.sendPush(recieverDevice, message);
                        next(null, {ok: true});
                        console.log('new favorator test');

                    }).catch (err => { log.error(err, 'Error executing notify new message service');
                    next(null, {ok: false});
                });
            }).catch(err=> {
                log.error(err, 'Error executing notify new message service');
                // next(err);
            });
    });

};


module.exports = fns;