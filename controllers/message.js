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
        'X-RapidAPI-Key': '438a4efff5msh2ed1867b0985d86p103321jsnb38485182c18',
        'X-RapidAPI-Host': 'phonenumbervalidatefree.p.rapidapi.com'
    }
    };

    axios.request(options).then(function (response) {
        console.log(response.data);
    }).catch(function (error) {
        console.error(error);
    });
}

module.exports = sendMessage;