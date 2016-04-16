'use strict';

const bluebird = require('bluebird');

module.exports = {
    getUserById,
    getFollowersByUserId,
    getPushTokenByUserIds,
    getDevices
};

function getUserById(userId, seneca) {
    let act = bluebird.promisify(seneca.act, {context: seneca});
    return act({
        role: 'user',
        cmd: 'getUserById',
        data: {
            user_id: userId
        }
    });
}

function getFollowersByUserId(userId, seneca) {

    return new Promise((resolve, reject) => {
        
        seneca.act({
            role: 'user',
            cmd: 'getfollowers',
            data: {
                user_id: userId
            }
        }, (err, result) => {

            if (err || result.err) {
                return reject(err, result);
            }

            resolve(result.data)
        });
    })
}

function getDevices(ids, seneca) {
    return new Promise((resolve, reject) => {

        seneca.act({
            role: 'user',
            cmd: 'get',
            entity: 'device',
            data: {
                user_id: ids
            }
        }, (err, result) => {

            if (err || result.err) {
                return reject(err, result);
            }

            resolve(result.data)
        });
    })

}

function getPushTokenByUserIds(userIds, seneca) {

    let act = bluebird.promisify(seneca.act, {context: seneca});

    return act({
        role: 'user',
        cmd: 'get',
        entity: 'pushToken',
        data: {
            user_ids: userIds
        }
    }).then(response => response.data);
}
