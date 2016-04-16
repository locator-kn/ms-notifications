'use strict';

const service = require('./services');
const Joi = require('joi');

const validation = require('./validation');
const push = require('./push');

const log = require('ms-utilities').logger;

module.exports = {
    notifyFollowerNewLocation,
    notifyNewFollower,
    notifyMyLocationHasNewFavorator
};

//Someone you follow creates a new location
function notifyFollowerNewLocation(message, next) {

    let seneca = this;

    Joi.validate(message.data, validation.notifyNewLocation, (err, data) => {

        if (err) {
            log.error(err, 'Validation failed of new locations notify service');
            return next(err);
        }

        log.info('composing push-notifications for new location');

        next(null, {ok: true});
        
        // compose message
        let messageData = {
            message: data.user_name + ' hat eine neue Location erstellt.',
            entity: 'location',
            entity_id: data.location_id
        };

        service.getFollowersByUserId(data.user_id, seneca)
            .then(follower => service.getDevices(follower, seneca))
            .then(followerDevices => push.sendPush(followerDevices, messageData))
            .catch(err=> log.error(err, 'Error executing notify new message service'));
    });

}

//Someone follows you
function notifyNewFollower(message, next) {


    Joi.validate(message.data, validation.notifyNewFollower, (err, data) => {

        if (err) {
            log.error(err, 'Validation failed of new follower notify service');
            return next(err);
        }

        log.info('composing push-notifications for new follower');

        Promise.all([db.getUserNameById(data.user_id), db.getDeviceByUserId(data.follow_id)])
            .then(results => {
                let messageText = results[0] + ' folgt dir jetzt!';

                push.sendPush(results[1], messageText, 'user', data.user_id);
                next(null, {ok: true});

            })
            .catch(err=> {
                log.error(err, 'Error executing notify new message service');
            });
    });

}

//Someone favorites a location of you
function notifyMyLocationHasNewFavorator(message, next) {
    Joi.validate(message.data, validation.notifyNewLocFavorator, (err, data) => {

        if (err) {
            log.error(err, 'Validation failed of new location follower notify service');
            return next(err);
        }

        log.info('composing push-notifications for new location like');

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
                    .catch(err => {
                        log.error(err, 'Error executing notify new message service');
                        next(null, {ok: false});
                    });
            }).catch(err=> {
            log.error(err, 'Error executing notify new message service');
            // next(err);
        });
    });

}
