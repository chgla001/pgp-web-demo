class Api {

    constructor() {
        this.BASE_URL = '192.168.2.116';
        this.PORT = 4000;
        this.API_URL = `http://${this.BASE_URL}:${this.PORT}`;
    }

    registerUser(data) {
        return axios({
                method: 'post',
                url: `${this.API_URL}/login/userdata`,
                data: data
            })
            .then(function (response) {
                console.log('api registerUser', response)
                return response.data
            })
            .catch(error => {
                throw new Error(`Fehler bei der Registrierung: ${error.message}`);
            });
    }

    loadAllUsers() {
        return axios({
                method: 'get',
                url: `${this.API_URL}/login/allusers`
            })
            .then(function (response) {
                console.log('loadAllUsers -response', response);
                return response.data
            })
            .catch(error => {
                throw new Error(`Fehler beim Laden aller User: ${error.message}`);
            });
    }

    loadUserById(id) {
        return axios({
                method: 'get',
                url: `${this.API_URL}/login/userById?id=${id}`
            })
            .then(response => response.data)
            .catch(error => {
                throw new Error(`Fehler beim Laden des User mit ID ${id}: ${error.message}`);
            });
    }

    sendMessage(sender, receiver, encryptedMessage) {
        let data = {
            text: encryptedMessage,
            timestamp: new Date().getTime(),
            read: false,
            senderid: sender.id,
            receiverid: receiver.id

        };

        return axios({
                method: 'post',
                url: `${this.API_URL}/messages/new-message`,
                data: data
            })
            .catch(error => {
                throw new Error(`Fehler beim Senden einer Nachricht: ${error.message}`);
            });
    }

    loadUnreadMessages(recipient, sender) {
        return axios({
                method: 'get',
                url: `${this.API_URL}/messages/getMessages?senderid=${sender.id}&recipientid=${recipient.id}`
            })
            .then(response => {
                console.log('loadUnreadMessages', response.data);
                response.data.forEach(element => {
                    console.log('element - id', element.id);
                    axios({
                        method: 'post',
                        url: `${this.API_URL}/messages/updateMessage`,
                        data: {'id': element.id}
                    })
                });
                return response.data
            })
            .catch(error => {
                throw new Error(`Fehler beim Laden der ungelesenen Nachrichten: ${error.message}`);
            });
    }

}