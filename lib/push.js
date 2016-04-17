'use strict';

const log = require('ms-utilities').logger;

const gcm = require('node-gcm');
const senderID = new gcm.Sender(process.env['ANDROID_PUSH_KEY']);

const apn = require('apn');
const apnOptions = {
    cert: '/home/locator/locator-new/ms-notifications/cert.pem',
    key: '/home/locator/locator-new/ms-notifications/key.pem'
};
const apnConnection = new apn.Connection(apnOptions);

const fns = {};

fns.sendPush = (receiver, messageData) => {


    log.info('going to send notification to', receiver, 'push type:', messageData.entity);

    if (!receiver) {
        return log.warn('error no user found for sending push notification');
    }

    if (!Array.isArray(receiver)) {
        receiver = [receiver];
    }

    let androidReceiver = [];
    let iosReceiver = [];
    

    receiver.forEach(receiver => {
        if (receiver.type.toLowerCase() === 'ios') {
            iosReceiver.push(receiver);
        } else if (receiver.type.toLowerCase() === 'android') {
            androidReceiver.push(receiver);
        }
    });

    if (androidReceiver.length) {
        let pushTokens = androidReceiver.map(device => device.pushToken);

        let message = new gcm.Message();

        message.addData('title', 'Locator');
        message.addData('icon', 'drawable-hdpi-icon');

        // add custom keys
        for (let key in messageData) {
            if (messageData.hasOwnProperty(key)) {
                message.addData(key, messageData[key]);
            }
        }

        log.info('sending push to', pushTokens.length, 'android devices');
        log.info('sending push to', pushTokens);
        senderID.send(message, pushTokens, 4, err => {
            if (err) {
                log.error(err, 'error sending push: ');
            }
        });
    }
    if (iosReceiver.length) {
        let devices = iosReceiver.map(device => new apn.Device(device.pushToken));
        let message = new apn.Notification();

        message.setAlertTitle('Locator');
        message.setAlertText(messageData.message);
        message.payload = {};
        message.payload[messageData.entity] = messageData.entity_id;

        message.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        message.sound = 'default';

        log.info('sending push to', devices.length, 'ios devices');
        devices.forEach(device => {
            apnConnection.pushNotification(message, device);
        });
    }
};


module.exports = fns;
