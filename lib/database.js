'use strict';

const util = require('./util');
const log = require('ms-utilities').logger;

const mongo = require('mongodb').MongoClient;
const mongoUrl = 'mongodb://' + process.env['DB_HOST'] + ':' + process.env['DB_PORT'] + '/' + process.env['DB_NAME'];

var database = {};

const fns = {};

const deletePassword = (elem => {
    delete elem.password;
    delete elem.temp_pw;
    return elem;
});


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


fns.getLocationById = (id) => {
    return fns.genericById(id, 'locations');
};

fns.getFollowersByUserId = userId => {

    return database.collection('users')
        .find({'following': userId})
        .toArray()
        .then(follower => follower.map(deletePassword));
};


fns.getDeviceByUserId = (id) => {
    //return util.safeObjectId(id)
    //.then(oId => {
    return database.collection('devices')
        .find({user_id: id})
        .toArray()
        .then(res => {
            if (!res || res.length === 0) {
                log.error('No device document found for user', {collection: 'devices', user_id: id});
                throw Error('not found');
            }
            return res;
        });
    //  });
};

fns.getUserNameById = (id) => {
    return util.safeObjectId(id)
        .then(oId=> {
            return database.collection('users')
                .find({_id: oId})
                .limit(-1)
                .next()
                .then(res => res.name);
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