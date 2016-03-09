'use strict';

const db = require('./database');
const Joi = require('joi');

const validation = require('./validation');
const push = require('./push');

const log = require('ms-utilities').logger;

const fns = {};


/**
 * Test function to notify someone
 * @param message
 * @param next
 */
fns.notifyNewMessage = (message, next) => {

    Joi.validate(message.data, validation.notify, (err, data) => {

        if (err) {
            log.error(err, 'Validation failed of notify service');
            return next(err);
        }

        db.getDeviceByUserId(data.user_to, 'users')
            .then(reveiverDevices => {

                reveiverDevices.forEach(reveiverDevice => {
                    //TODO check for settings
                    push.sendPush(reveiverDevice, data.message);
                });

                return next(null, {data: {ok: true}});

            })
            .catch(err=> {
                log.error(err, 'Error executing notify new message service');
                next(err);
            });

    });

};

fns.notifyFollowerNewLocation = (message, next) => {

    Joi.validate(message.data, validation.notifyNewLocation, (err, data) => {

        if (err) {
            log.error(err, 'Validation failed of new locations notify service');
            return next(err);
        }

        next(null, {ok: true});

        let message = data.user_name + ' hat eine neue Location erstellt. Schau sie dir an!';

        Promise.all([db.getFollowersByUserId(data.user_id), db.getLocationById(data.location_id)])
            .then(values => {
                let users = values[0];
                users.forEach(user => {

                    return db.getDeviceByUserId(user._id)
                        .then(reveiverDevices => {

                            reveiverDevices.forEach(reveiverDevice => {
                                //TODO check for settings
                                push.sendPush(reveiverDevice, message);
                            });
                        });
                });
            })
            .catch(err=> {
                log.error(err, 'Error executing notify new message service');
                // next(err);
            });


    });

};

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

                let recieverDevice = {};
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


module.exports = fns;