'use strict';

const util = require('./util');
const log = require('ms-utilities').logger;

const mongo = require('mongodb').MongoClient;
const mongoUrl = 'mongodb://' + process.env['DB_HOST'] + ':' + process.env['DB_PORT'] + '/' + process.env['DB_NAME'];

var database = {};

const fns = {};


fns.genericById = (id, collectionId) => {
    return util.safeObjectId(id)
        .then(oId => {
            return database.collection(collectionId)
                .find({_id: oId})
                .limit(-1)
                .next()
                .then(res => {
                    if (!res) {
                        log.error('No document found for', {collection: collectionId, id: id});
                        throw Error('not found');
                    }
                    return res;
                });
        });
};


fns.getDeviceByUserId = (id) => {
    return util.safeObjectId(id)
        .then(oId => {
            return database.collection('devices')
                .find({user_id: oId})
                .toArray()
                .then(res => {
                    if (!res || res.length === 0) {
                        log.error('No device document found for user', {collection: 'devices', user_id: id});
                        throw Error('not found');
                    }
                    return res;
                });
        });
};

/**
 * connects to the database
 * @returns {Promise|*}
 */
fns.connect = () => {
    console.log('open database', mongoUrl);
    return mongo.connect(mongoUrl)
        .then(db => {
            console.log('database successfully connected');
            database = db;
        })
        .catch(err => {
            console.error('unable to connect to database', err);
            throw err;
        });
};


module.exports = fns;