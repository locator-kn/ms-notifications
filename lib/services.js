'use strict';

const bluebird = require('bluebird');

module.exports = {
    getUserById,
    getFollowersByUserId,
    getPushTokenByUserIds,
    getDevices,
    getLocationById
};

function getUserById(userId, seneca) {
    let act = bluebird.promisify(seneca.act, {context: seneca});
    return act({
        role: 'user',
        cmd: 'getUser',
        by: 'id',
        data: {
            user_id: userId
        }
    }).then(response => response.data);
}

function getFollowersByUserId(userId, seneca) {

    let act = bluebird.promisify(seneca.act, {context: seneca});
    return act({
        role: 'user',
        cmd: 'getfollowers',
        data: {
            user_id: userId
        }
    }).then(response => response.data);
}

function getDevices(ids, seneca) {
    let act = bluebird.promisify(seneca.act, {context: seneca});

    return act({
        role: 'user',
        cmd: 'get',
        entity: 'device',
        data: {
            user_ids: ids
        }
    }).then(response => response.data);

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

function getLocationById(id, seneca) {
    let act = bluebird.promisify(seneca.act, {context: seneca});

    return act({
        role: 'location',
        cmd: 'locationById',
        data: {
            locationId: id
        }
    }).then(response => response.data);
}
