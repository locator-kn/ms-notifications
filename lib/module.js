'use strict';

const Joi = require('joi');

const log = require('ms-utilities').logger;

const service = require('./services');
const validation = require('./validation');
const push = require('./push');

const TRANSLATE = {
    video: 'Video',
    image: 'Bild',
    audio: 'Ton'
};

module.exports = {
    notifyFollowerNewLocation,
    notifyNewFollower,
    notifyMyLocationHasNewFavorator,
    notifyNewImpression
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
            .catch(err=> log.error(err, 'Error executing notify new location service'));
    });

}

//Someone follows you
function notifyNewFollower(message, next) {

    let seneca = this;

    Joi.validate(message.data, validation.notifyNewFollower, (err, data) => {

        if (err) {
            log.error(err, 'Validation failed of new follower notify service');
            return next(err);
        }

        log.info('composing push-notifications for new follower');

        next(null, {ok: true});

        // compose message
        let messageData = {
            message: '',
            entity: 'user',
            entity_id: data.user_id
        };

        let user = service.getUserById(data.user_id, seneca);
        let device = service.getDevices([data.follow_id], seneca);

        Promise.all([user, device])
            .then(results => {

                messageData.message = results[0].name + ' folgt dir jetzt!';
                push.sendPush(results[1], messageData);

            })
            .catch(err=> {
                log.error(err, 'Error executing notify new follower service');
            });
    });
}

//Someone favorites a location of you
function notifyMyLocationHasNewFavorator(message, next) {

    let seneca = this;

    Joi.validate(message.data, validation.notifyNewLocFavorator, (err, data) => {

        if (err) {
            log.error(err, 'Validation failed of new location follower notify service');
            return next(err);
        }

        log.info('composing push-notifications for new location like');

        next(null, {ok: true});

        // compose message
        let messageData = {
            message: '',
            entity: 'location',
            entity_id: ''
        };


        let favorator = service.getUserById(data.favorator_id, seneca);
        let location = service.getLocationById(data.loc_id, seneca);

        Promise.all([favorator, location])
            .then(values => {

                let favoratorName = values[0].name;
                let locationTitle = values[1].title;
                let locationId = values[1]._id.toString();

                messageData.message = favoratorName + ' gefällt deine Location ' + locationTitle + '!';
                messageData.entity_id = locationId;

                return service.getDevices([values[1].user_id], seneca)
            })
            .then(receiverDevice => push.sendPush(receiverDevice, messageData))
            .catch(err => {
                log.error(err, 'Error executing notify new favorator of location service');
            });
    });
}

function notifyNewImpression(message, next) {

    let seneca = this;

    Joi.validate(message.data, validation.notifyNewLocation, (err, data) => {

        if (err) {
            log.error(err, 'Validation failed of new locations notify service');
            return next(err);
        }

        log.info('composing push-notifications for new location');

        next(null, {ok: true});

        let type = TRANSLATE[data.type];

        // compose message
        let messageData = {
            message: data.user_name + ' hat eine neue ' + type + '-impression erstellt.',
            entity: 'location',
            entity_id: data.location_id
        };

        service.getFollowersByUserId(data.user_id, seneca)
            .then(follower => service.getDevices(follower, seneca))
            .then(followerDevices => push.sendPush(followerDevices, messageData))
            .catch(err=> log.error(err, 'Error executing notify new impression service'));
    });
}

