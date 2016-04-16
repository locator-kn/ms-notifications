'use strict';

const bluebird = require('bluebird');

const fns = {};

fns.getUserById = (userId, seneca) => {
    let act = bluebird.promisify(seneca.act, {context: seneca});
    return act({
        role:'user',
        cmd: 'getUser',
        by: 'id',
        data: {
            user_id: userId
        }
    });
};

fns.getFollowersByUserId = function (userId, seneca) {

    let act = bluebird.promisify(seneca.act, {context: seneca});

    return act({
        role: 'user',
        cmd: 'getfollowers',
        data: {
            user_id: userId
        }
    }).then(response => response.data);
};

fns.getPushTokenByUserIds = (userIds, seneca) => {

    let act = bluebird.promisify(seneca.act, {context: seneca});

    return act({
        role: 'user',
        cmd: 'get',
        entity: 'pushToken',
        data: {
            user_ids: userIds
        }
    }).then(response => response.data);
};

module.exports = fns;
