// /messages/id/309

const striptags = require('striptags'); //ES5 <-- pick one

const axios = require('axios');

var headersLia = {
    headers: {
        'li-api-session-key': '9zcSAFPro6s8UhWfhMXq4G2F93dtwh-Ri8JbO3yc9X0.'    }
};


axios.get('http://localhost:8080/lia/restapi/vc/messages/id/309?restapi.response_format=json',
 headersLia  )
    .then((res) => {
        console.log(`Status: ${res.status}`);
        console.log('Body: ', striptags(res.data.response.message.body.$));
    }).catch((err) => {
        console.error('Error is : ', err.message);
});