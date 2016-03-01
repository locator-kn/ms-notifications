'use strict';

const Joi = require('joi');

const validations = {};

validations.mongoId = Joi.string().optional();
validations.mongoIdRequired = Joi.string().required();

// TODO: maybe extend with more information about the user or message
validations.notify = Joi.object().keys({
    user_to: validations.mongoIdRequired,
    user_from: validations.mongoIdRequired,
    message: Joi.string().required()
}).required();

validations.notifyNewLocation = Joi.object().keys({
    user_id: validations.mongoIdRequired,
    location_id: validations.mongoIdRequired,
    user_name: Joi.string().required()
}).required();


module.exports = validations;
