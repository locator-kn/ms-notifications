'use strict';

const Joi = require('joi');

const validations = {};

validations.mongoId = Joi.string().optional();
validations.mongoIdRequired = Joi.string().required();

// TODO: maybe extend with more information about the user
validations.notify = Joi.object().keys({
    user_to: Joi.string().required(),
    user_from: Joi.string().required(),
    message: Joi.string().required()
});


module.exports = validations;
