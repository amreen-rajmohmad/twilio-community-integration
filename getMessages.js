//voiceAssistance
// /restapi/vc/boards/id/video_cards/messages/post

const axios = require('axios');

var headersLia = {
    headers: {
        'li-api-session-key': 'r0Gld5jBxAF0N88mn6yZ1yhLjX1fzLjk2oGXNZlOuXU.'    }
};


axios.get('http://localhost:8080/lia/api/2.0/search?q=select * from messages where topic.id = ' + '\'304\''
+ '&restapi.response_format=json', headersLia  )
    .then((res) => {
        console.log(`Status: ${res.status}`);
        console.log('Body: ', res.data.data.items.length);
    }).catch((err) => {
        console.error('Error is : ', err.message);
});
