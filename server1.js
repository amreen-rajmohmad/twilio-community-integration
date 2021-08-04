const http = require('http');
const VoiceResponse = require('twilio').twiml.VoiceResponse;

http.createServer((req, res) => {
    // Create TwiML response
    const twiml = new VoiceResponse();
    twiml.say('Hello from your pals at Twilio!');
      
    /** helper function to set up a <Gather> */
  function gather() {
    const gatherNode = twiml.gather({ numDigits: 1 });
    gatherNode.say('For sales, press 1. For support, press 2.');

    // If the user doesn't enter input, loop
    twiml.redirect('/voice?');
  }


    let data = '';
    var jsonObj = {};
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
	    var sampleArray = data.split('&');
	    for (var i = 0, len = sampleArray.length; i < len; i++) {
        jsonObj[sampleArray[i].split('=')[0]] = sampleArray[i].split('=')[1];
	    }	
      console.log(decodeURIComponent(jsonObj.From));
      // If the user entered digits, process their request
        if (jsonObj.Digits) {
            switch (jsonObj.Digits) {
            case '1':
            twiml.say('You selected sales. Good for you!');
            break;
            case '2':
                twiml.say('You need support. We will help!');
                break;
            default:
            twiml.say("Sorry, I don't understand that choice.");
            twiml.pause();
            gather();
            break;
            }
        } else {
        // If no input was sent, use the <Gather> verb to collect user input
        gather();
    }
    //simple response on call.
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
    });


  
    

})
.listen(1337, '127.0.0.1');

console.log('TwiML server running at http://127.0.0.1:1337/');