'use strict';

const db = require('./database');
const Joi = require('joi');

const validation = require('./validation');

const log = require('ms-utilities').logger;

const fns = {};


/**
 * Test function to notify someone
 * @param message
 * @param next
 * @returns {Promise.<T>}
 */
fns.notifyNewMessage = (message, next) => {

    Joi.validate(message.data, validation.notify, (err, data)=> {

        if (err) {
            log.error(err, 'Validation failed of notify service');
            return next(err);
        }




    });

};


module.exports = fns;