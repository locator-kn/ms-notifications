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

        Promise.all([db.getUserNameById(data.user_id), db.getDeviceByUserId(data.follow_id)])
            .then(results => {
                let messageText = results[0] + ' folgt dir jetzt!';

                push.sendPush(results[1], messageText, 'user', data.follow_id);
                next(null, {ok: true});

            })
            .catch(err=> {
                log.error(err, 'Error executing notify new message service');
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

                let favoratorName = values[0];
                let locationTitle = values[1].title;
                let locationId = values[1]._id.toString();

                db.getDeviceByUserId(values[1].user_id)
                    .then(receiverDevice => {

                        let messageText = favoratorName + ' gefällt deine Location ' + locationTitle + '!';

                        push.sendPush(receiverDevice, messageText, 'location', locationId);
                        next(null, {ok: true});

                    })
                    .catch (err => {
                        log.error(err, 'Error executing notify new message service');
                        next(null, {ok: false});
                    });
            }).catch(err=> {
            log.error(err, 'Error executing notify new message service');
            // next(err);
        });
    });

};


module.exports = fns;