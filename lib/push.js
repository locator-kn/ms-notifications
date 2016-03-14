'use strict';

const log = require('ms-utilities').logger;

const gcm = require('node-gcm');
const senderID = new gcm.Sender(process.env['ANDROID_PUSH_KEY']);

const apn = require('apn');
const apnOptions = {
    cert: 'cert.pem',
    key: 'key.pem'
};
const apnConnection = new apn.Connection(apnOptions);

const fns = {};

fns.sendPush = (receiver, text) => {

    if (!receiver) {
        return log.warn('error no user found for sending push notification');
    }

    let token = receiver.pushToken;
    let platform = receiver.type;

    if (platform.toLowerCase() === 'android') {

        // send push with google
        let message = new gcm.Message();

      /*  message.addData('message', text);
        message.addData('title', 'TITEL FÜR DICH');
        message.addData('icon', 'drawable-hdpi-icon');
        message.addData('content-available', 1);*/


        message.addData('message', text.text);
        message.addData('title', 'Hallo '+text.recName);
        message.addData('entity', 'user');
        message.addData('entity_id', text.follower);


        let registrationIds = [];


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
        let apnDevice = new apn.Device(token);
        let note = new apn.Notification();

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
