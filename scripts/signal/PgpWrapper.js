class PgpWrapper {

    constructor() {
        this.openpgp = window.openpgp;
        //this.store = new PgpWrapper(); //TODO: import

        // openpgp.initWorker({
        //     path: 'lib/openpgp.worker.js'
        // });
    }

    // generateIdentity() {
    //     return Promise.all([
    //         this.keyHelper.generateIdentityKeyPair(),
    //         this.keyHelper.generateRegistrationId(),
    //     ]).then(result => {
    //         return Promise.all([
    //             this.store.put('identityKey', result[0]),
    //             this.store.put('registrationId', result[1])
    //         ]);
    //     });
    // }

    generateKeyPair(name, password) {
        return new Promise((resolve) => {
            let options = {
                userIds: [{
                    name: name
                }],
                numBits: 2048,
                passphrase: password
            };

            openpgp.generateKey(options).then((key) => {
                let privkey = key.privateKeyArmored;
                //console.log(privkey);

                let pubkey = key.publicKeyArmored;
                //console.log(pubkey);

                console.log(`generated key pair for ${name}!`);
                resolve(pubkey);
            });
        });
    }

    // generatePreKeyBundle(signedPreKeyId) {
    //     return Promise.all([
    //         this.store.getIdentityKeyPair(),
    //         this.store.getLocalRegistrationId()
    //     ]).then(result => {
    //         let identity = result[0];
    //         let registrationId = result[1];

    //         const onetimePrekeyPromises = [];
    //         // important to begin at 1 instead of 0, because of libsignal-protocol.js line 36119!
    //         for (let keyId = 1; keyId < 6; keyId++) {
    //             onetimePrekeyPromises.push(this.keyHelper.generatePreKey(keyId));
    //         }

    //         return Promise.all([
    //             this.keyHelper.generateSignedPreKey(identity, signedPreKeyId),
    //             ...onetimePrekeyPromises
    //         ]).then(keys => {
    //             let signedPreKey = keys[0];
    //             this.store.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair);

    //             let preKeys = keys.slice(1);
    //             let preKeysPublicOnly = preKeys.map((preKey) => {
    //                 return {
    //                     keyId: preKey.keyId,
    //                     publicKey: preKey.keyPair.pubKey
    //                 }
    //             });
    //             preKeys.forEach(preKey => this.store.storePreKey(preKey.keyId, preKey.keyPair));

    //             return {
    //                 identityKey: identity.pubKey,
    //                 registrationId: registrationId,
    //                 preKeys: preKeysPublicOnly,
    //                 signedPreKey: {
    //                     keyId: signedPreKeyId,
    //                     publicKey: signedPreKey.keyPair.pubKey,
    //                     signature: signedPreKey.signature
    //                 }
    //             };
    //         });
    //     });
    // }

    // createSession(user) {
    //     let builder = new libsignal.SessionBuilder(this.store, this._getUserAddress(user.name));

    //     let keyBundle = {
    //         identityKey: signalUtil.base64ToArrayBuffer(user.identityKey), // public!
    //         registrationId: user.registrationId,
    //         signedPreKey: {
    //             keyId: user.signedPreKeyId,
    //             publicKey: signalUtil.base64ToArrayBuffer(user.pubSignedPreKey), // public!
    //             signature: signalUtil.base64ToArrayBuffer(user.signature)
    //         }
    //     };

    //     if (user.preKey) {  // optional!
    //         keyBundle.preKey = {
    //             keyId: user.preKey.keyId,
    //             publicKey: signalUtil.base64ToArrayBuffer(user.preKey.pubPreKey)
    //         }
    //     }

    //     return builder.processPreKey(keyBundle);
    // }

    // encrypt(message, recipient) {
    //     let sessionCipher = new libsignal.SessionCipher(this.store, this._getUserAddress(recipient.name));
    //     let messageAsArrayBuffer = signalUtil.toArrayBuffer(message);
    //     return sessionCipher.encrypt(messageAsArrayBuffer);
    // }

    encrypt(message, receiver, sender) {
        new Promise((resolve, reject) => {
            let publicKey = receiver.pgpKey;
            //let privateKey = fs.readFileSync(`./privkey_${sender}`, 'utf8');
            let publicKeys = openpgp.key.readArmored(publicKey).keys;
            //let privateKeys = openpgp.key.readArmored(privateKey).keys;

            // decrypt the private key with password
            //let success = privateKeys[0].decrypt(senderPassword);

            let options = {
                data: message,
                publicKeys: publicKeys
                /*, privateKeys: privateKeys*/ // when privateKeys is filled, the message will be signed. Then decryption is not (yet) possible in Android
            };

            openpgp.encrypt(options).then((ciphertext) => {
                let encryptedData = ciphertext.data;
                // let fileName = `msg_${sender}_to_${receiver}_${new Date().getTime()}`;
                // fs.writeFileSync(fileName, encryptedData);
                // console.log(fileName);
                log('encryptedData', encryptedData);
                resolve(encryptedData);
            });
        });
    }

    // decrypt(message, sender) {
    //     // Base64 -> ArrayBuffer -> String
    //     let ciphertext = signalUtil.base64ToArrayBuffer(message.body);
    //     let messageType = message.type;

    //     let sessionCipher = new libsignal.SessionCipher(this.store, this._getUserAddress(sender.name));

    //     let decryptPromise;
    //     if (messageType === 3) { // 3 = PREKEY_BUNDLE
    //         console.log('decryptPreKeyWhisperMessage');
    //         // Decrypt a PreKeyWhisperMessage by first establishing a new session
    //         // The session will be set up automatically by libsignal.
    //         // The information to do that is delivered within the message's ciphertext.
    //         decryptPromise = sessionCipher.decryptPreKeyWhisperMessage(ciphertext, 'binary');
    //     } else {
    //         console.log('decryptWhisperMessage');
    //         // Decrypt a normal message using an existing session
    //         decryptPromise = sessionCipher.decryptWhisperMessage(ciphertext, 'binary');
    //     }

    //     return decryptPromise
    //         .then(decryptedText => {
    //             message.body = signalUtil.toString(decryptedText);
    //             return message;
    //         });
    // }

    decryptMessage(receiver, receiverPassword, sender, msgFileName) {
        let publicKey = fs.readFileSync(`./pubkey_${sender}`, 'utf8');
        let privateKey = fs.readFileSync(`./privkey_${receiver}`, 'utf8');
        let publicKeys = openpgp.key.readArmored(publicKey).keys;
        let privateKeys = openpgp.key.readArmored(privateKey).keys;

        // decrypt the private key with password
        let success = privateKeys[0].decrypt(receiverPassword);

        let encryptedMessage = fs.readFileSync(`./${msgFileName}`, 'utf8');
        let options = {
            message: openpgp.message.readArmored(encryptedMessage),
            publicKeys: publicKeys,
            privateKey: privateKeys[0]
        };

        openpgp.decrypt(options).then((plaintext) => {
            console.log(plaintext.data);
        });
    }

    // _getUserAddress(username) {
    //     return new libsignal.SignalProtocolAddress(username, 0); // deviceId is always 0
    // }

    // preKeyBundleToBase64(bundle) {
    //     bundle.identityKey = signalUtil.arrayBufferToBase64(bundle.identityKey);
    //     bundle.preKeys.forEach(preKey => {
    //         preKey.publicKey = signalUtil.arrayBufferToBase64(preKey.publicKey);
    //     });
    //     bundle.signedPreKey.publicKey = signalUtil.arrayBufferToBase64(bundle.signedPreKey.publicKey);
    //     bundle.signedPreKey.signature = signalUtil.arrayBufferToBase64(bundle.signedPreKey.signature);
    //     return bundle;
    // }

}