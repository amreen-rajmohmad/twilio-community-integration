const http = require('http');
const url = require('url');
const VoiceResponse = require('twilio').twiml.VoiceResponse;

http.createServer((req, res) => {
  console.log(req.url);
  if (req.url.split('?')[0] === "/recordingStatus") {
    //console.log(req);
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
	    var sampleArray = data.split('&');
	    var jsonObj = {};
	    for (var i = 0, len = sampleArray.length; i < len; i++) {
        jsonObj[sampleArray[i].split('=')[0]] = sampleArray[i].split('=')[1];
	    }	
	  console.log(decodeURIComponent(jsonObj.RecordingUrl));
    });
    res.writeHead(200);
    res.end();
  } else if(req.url.split('?')[0] === "/transcribeStatus") {
	  let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      var sampleArray = data.split('&');
      var jsonObj = {};
      for (var i = 0, len = sampleArray.length; i < len; i++) {
        jsonObj[sampleArray[i].split('=')[0]] = sampleArray[i].split('=')[1];
      }
      console.log(decodeURIComponent(jsonObj.TranscriptionUrl));
      console.log(decodeURIComponent(jsonObj.TranscriptionText));
    });
    const queryObject = url.parse(req.url,true).query;
    console.log('query params : ', queryObject);
    res.writeHead(200);
    res.end();
  } else {
    // Create TwiML response
    const twiml = new VoiceResponse();
    twiml.say('Hello from your pals at Twilio! Have fun. I will be recording this call. Thanks!');
      
    // simple response on call.
    //res.writeHead(200, { 'Content-Type': 'text/xml' });
    //res.end(twiml.toString());
    
    // simple record on call.
    twiml.record({
	    action : 'https://handler.twilio.com/twiml/EHb8ba0a97524296b01c438a851f89d7be',
	    recordingStatusCallback: 'https://5d501f95286c.ngrok.io/recordingStatus',
	    recordingStatusCallbackMethod: 'POST',
      recordingStatusCallbackEvent: 'completed',
	    transcribeCallback : 'https://5d501f95286c.ngrok.io/transcribeStatus?isTopic=true',
	    timeout: 10,
      transcribe: true
    });
    //console.log(twiml.toString());
    res.writeHead(200, {"Content-Type": "text/xml"});
    res.end(twiml.toString());
  }
})
.listen(1337, '127.0.0.1');

console.log('TwiML server running at http://127.0.0.1:1337/');
