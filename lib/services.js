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

    let act = bluebird.promisify(seneca.act, {context: seneca});
    return act({
        role: 'user',
        cmd: 'getfollowers',
        data: {
            user_id: userId
        }
    });
}

function getDevices(ids, seneca) {
    let act = bluebird.promisify(seneca.act, {context: seneca});

    return act({
        role: 'user',
        cmd: 'get',
        entity: 'device',
        data: {
            user_id: ids
        }
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
