class ActionAdapter {

    constructor() {
        this.wrapper = new PgpWrapper();
        this.api = new Api();
    }

    // register(username, password) {
    //     return this.wrapper
    //         .generateIdentity(username) // password has no use for Signal
    //         .then(() => {
    //             return this.wrapper.generatePreKeyBundle(signalUtil.randomId());
    //         })
    //         .then(preKeyBundle => {
    //             return this.api.registerUser({
    //                 username: username,
    //                 preKeyBundle: this.wrapper.preKeyBundleToBase64(preKeyBundle)
    //             });
    //         });
    // }

    register(username, password) {
        return this.wrapper.generateKeyPair(username, password)
            .then(pubkey=> {
                console.log('api.registerUser wurde aufgerufen');
                
                return this.api.registerUser({
                    name: username,
                    email: 'email.not@set.yet',
                    password: password,
                    pgpkey: pubkey
                });
            });
    }

    loadAllUsers() {
        return this.api.loadAllUsers();
    }

    loadUserById(id) {
        return this.api.loadUserById(id);
    }

    // createSession(user) {
    //     return this.wrapper.createSession(user);
    // }

    encrypt(message, recipient, currentUser) {
        return this.wrapper.encrypt(message, recipient, currentUser).then(encryptedData);
    }

    decrypt(message, sender) {
        return this.wrapper.decrypt(message, sender);
    }

    sendMessage(sender, encryptedMessage) {
        // String -> ArrayBuffer -> Base64
        encryptedMessage.body = signalUtil.toArrayBuffer(encryptedMessage.body);
        encryptedMessage.body = signalUtil.arrayBufferToBase64(encryptedMessage.body);
        return this.api.sendMessage(sender, encryptedMessage);
    }

    loadUnreadMessages(recipient, sender) {
        return this.api.loadUnreadMessages(recipient, sender);
    }

}