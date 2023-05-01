// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);

// const sendMessage = (to, from, message) => {
//     client.messages
//     .create({
//         body: message,
//         from: from,
//         to: to
//     })
//     .then(message => console.log(message.sid, message));
// }

// module.exports = sendMessage;


const sendMessage = (to, text) => {
    const axios = require("axios");

    const options = {
    method: 'GET',
    url: 'https://phonenumbervalidatefree.p.rapidapi.com/ts_PhoneNumberValidateTest.jsp',
    params: {number: to, country: 'UY'},
    headers: {
        'X-RapidAPI-Key': process.env.XRapidAPIKey,
        'X-RapidAPI-Host': process.env.XRapidAPIHost
    }
    };

    axios.request(options).then(function (response) {
        console.log(response.data);
    }).catch(function (error) {
        console.error(error);
    });
}

module.exports = sendMessage;