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


module.exports = fns;