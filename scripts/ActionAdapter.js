class ActionAdapter {

    constructor() {
        this.wrapper = new PgpWrapper();
        this.api = new Api();
    }

    register(username, password) {
        var privkeyTemp;
        return this.wrapper.generateKeyPair(username, password)
            .then(keyholder => {
                privkeyTemp = keyholder.privkey;
                return this.api.registerUser({
                    name: username,
                    email: 'email.not@set.yet',
                    password: password,
                    pgpkey: keyholder.pubkey
                });
            })
            .then(user => {
                user.privkey = privkeyTemp;
                return user
            });
    }

    loadAllUsers() {
        return this.api.loadAllUsers();
    }

    loadUserById(id) {
        return this.api.loadUserById(id);
    }

    encrypt(message, recipient) {
        return this.wrapper.encrypt(message, recipient)
            .then(function (encryptedData) {
                return encryptedData;
            })
    }

    decrypt(message, recipient) {
        return this.wrapper.decrypt(message, recipient);
    }

    sendMessage(sender, receiver, encryptedMessage) {
        return this.api.sendMessage(sender, receiver, encryptedMessage);
    }

    loadUnreadMessages(recipient, sender) {
        return this.api.loadUnreadMessages(recipient, sender);
    }

}