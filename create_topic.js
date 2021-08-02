//voiceAssistance
// /restapi/vc/boards/id/video_cards/messages/post

const axios = require('axios');
const FormData = require('form-data');

const formData = new FormData();
formData.append('message.author', 'login/admin');
formData.append('message.subject', 'testSubject');
formData.append('message.teaser', 'testTeaser');
formData.append('message.body', 'testBody');
formData.append('tag.add', 'vistaH');
const headers = Object.assign({
    'li-api-session-key': 'GbS1aFXPOqxzYkDSeKpbPxM3NkuCm0kygrJ0M9d8p3k.'
}, formData.getHeaders());



axios.post('http://localhost:8080/lia/restapi/vc/boards/id/voiceAssistance/messages/post?restapi.response_format=json',
 formData, { headers: headers }  )
.then((res) => {
    console.log(`Status: ${res.status}`);
    console.log('Body: ', res.data.response.message.id.$);
}).catch((err) => {
    console.error('Error is : ', err.message);
});
