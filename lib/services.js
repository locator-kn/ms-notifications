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
    }).then(unwrap);
}

function getFollowersByUserId(userId, seneca) {

    let act = bluebird.promisify(seneca.act, {context: seneca});
    return act({
        role: 'user',
        cmd: 'getfollowers',
        data: {
            user_id: userId
        }
    }).then(unwrap);
}

function getDevices(ids, seneca) {
    let act = bluebird.promisify(seneca.act, {context: seneca});

    return act({
        role: 'user',
        cmd: 'get',
        entity: 'pushToken',
        data: {
            user_ids: ids
        }
    }).then(unwrap);

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
    }).then(unwrap);
}

function getLocationById(id, seneca) {
    let act = bluebird.promisify(seneca.act, {context: seneca});

    return act({
        role: 'location',
        cmd: 'locationById',
        data: {
            locationId: id
        }
    }).then(unwrap);
}

function unwrap(response) {

    if (response.err) {
        throw response.err;
    }

    return response.data;
}
