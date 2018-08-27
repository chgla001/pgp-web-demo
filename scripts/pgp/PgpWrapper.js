class PgpWrapper {

    constructor() {
        this.openpgp = window.openpgp;
    }

    generateKeyPair(name, password) {
        let options = {
            userIds: [{
                name: name
            }],
            numBits: 2048,
            passphrase: password
        };

        return openpgp.generateKey(options).then((key) => {
            let privkey = key.privateKeyArmored;
            console.log(privkey);

            let pubkey = key.publicKeyArmored;
            //console.log(pubkey);

            console.log(`generated key pair for ${name}!`);
            return {
                pubkey,
                privkey
            };
        });
    }

    async encrypt(message, receiver) {
        let publicKeys = (await openpgp.key.readArmored(receiver.pgpKey)).keys;

        let options = {
            message: openpgp.message.fromText(message),
            publicKeys: publicKeys
            /*, privateKeys: privateKeys*/ // when privateKeys is filled, the message will be signed. Then decryption is not (yet) possible in Android
        };

        return openpgp.encrypt(options).then((ciphertext) => {
            let encryptedData = ciphertext.data;
            console.log('encryptedData', encryptedData);
            return encryptedData;
        });
    }

    async decrypt(message, receiver) {
        console.log(receiver);

        let publicKey = receiver.pgpKey;
        let privateKey = receiver.privkey;
        let publicKeys = (await openpgp.key.readArmored(publicKey)).keys;
        let privateKeys = (await openpgp.key.readArmored(privateKey)).keys;

        // decrypt the private key with password
        let success = await privateKeys[0].decrypt(receiver.password);

        let options = {
            message: await openpgp.message.readArmored(message.text),
            publicKeys: publicKeys,
            privateKeys: privateKeys[0]
        };

        return openpgp.decrypt(options).then((plaintext) => {
            console.log(plaintext.data);
            return {
                body: plaintext.data,
                timestamp: message.timestamp
            };
        });
    }
}