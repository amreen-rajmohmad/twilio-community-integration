const axios = require('axios');
const FormData = require('form-data');

const formData = new FormData();
formData.append('user.login', 'admin');
formData.append('user.password', 'arfarf');

axios.post('http://localhost:8080/lia/restapi/vc/authentication/sessions/login?restapi.response_format=json',
 formData, { headers: formData.getHeaders() } )
    .then((res) => {
        console.log(`Status: ${res.status}`);
        console.log('Body: ', res.data.response.value.$);
    }).catch((err) => {
        console.error(err);
    });


