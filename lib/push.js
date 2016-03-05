'use strict';

const log = require('ms-utilities').logger;

const gcm = require('node-gcm');
const senderID = new gcm.Sender(process.env['ANDROID_PUSH_KEY']);

const apn = require('apn');
const apnOptions = {};
const apnConnection = new apn.Connection(apnOptions);

const fns = {};


/**
 * Send a push message to a device
 * @param message
 * @param next
 * @returns {Promise.<T>}
 */
fns.sendPush = (receiver, text) => {

    if (!receiver) {
        return log.warn('error no user found for sending push notification');
    }

    var token =  receiver.pushToken;
    var platform =  receiver.type;

    if (platform.toLowerCase() === 'android') {

        // send push with google
        var message = new gcm.Message();

        message.addData('message', text);
        message.addData('title', 'TITEL FÜR DICH');
        message.addData('icon', 'drawable-hdpi-icon');
        message.addData('content-available', 1);

        var registrationIds = [];


        // At least one reg id required
        registrationIds.push(token);

        /**
         * Parameters: message-literal, registrationIds-array, No. of retries, callback-function
         */
        senderID.send(message, registrationIds, 4, function (err) {
            if (err) {
                log.error(err, 'error sending push: ');
            }
        });

    } else if (platform.toLowerCase() === 'ios') {

        // send  push with apple
        var apnDevice = new apn.Device(token);
        var note = new apn.Notification();

        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        note.sound = 'default';

        note.setAlertTitle('TITEL FÜR DICH');
        note.setAlertText(text);

        note.setContentAvailable(1);

        apnConnection.pushNotification(note, apnDevice);

    } else {
        log.warn('unable to send push. Not android nor ios device: ', {receiver: receiver});
    }


};


module.exports = fns;
