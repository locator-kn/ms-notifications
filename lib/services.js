'use strict';

const bluebird = require('bluebird');

const fns = {};

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


module.exports = fns;