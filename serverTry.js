const http = require('http');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const axios = require('axios');
const FormData = require('form-data');
const url = require('url');
let mongoose = require('mongoose');
let dbConfig = require('./DB/dbConfig.js');




const formAuthData = new FormData();
formAuthData.append('user.login', 'admin');
formAuthData.append('user.password', 'arfarf');

http.createServer((req, res) => {
  if (req.url === "/recordingStatus") {
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
    const queryObject = url.parse(req.url,true).query;
    console.log('query params : ', queryObject);
    let data = '';
    var textBody;
    var callSid;
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
      textBody = decodeURIComponent(jsonObj.TranscriptionText);
      callSid = jsonObj.CallSid;
    });

    // take session key from community
    var liaSession;
    axios.post('http://localhost:8080/lia/restapi/vc/authentication/sessions/login?restapi.response_format=json',
      formData, { headers: formData.getHeaders() } )
    .then((res) => {
      liaSession = res.data.response.value.$;
      console.log(`Status: ${res.status}`);
      console.log('Body: ', liaSession);
    }).catch((err) => {
      console.error(err);
    });

    if(queryObject.isTopic === true || queryObject.isTopic === 'true') {
      // how do we know it is supposed to be reply to previous post or a new topic?
      // make a post to the community
      const formPostData = new FormData();
      formPostData.append('message.author', 'login/admin');
      formPostData.append('message.subject', callSid);
      formPostData.append('message.body', textBody);
      formPostData.append('tag.add', 'vistaH');
      const postHeaders = Object.assign({
        'li-api-session-key': liaSession
      }, formPostData.getHeaders());
      var topicID;
      axios.post('http://localhost:8080/lia/restapi/vc/boards/id/voiceAssistance/messages/post?restapi.response_format=json',
      formPostData, { headers: postHeaders }  )
      .then((res) => {
        console.log(`Status: ${res.status}`);
        console.log('Body: ', res.data.response.message.id.$);
        topicID = res.data.response.message.id.$;
      }).catch((err) => {
        console.error('Error is : ', err.message);
      });

      if(topicID === undefined || topicID === null) {
        res.writeHead(200);
        res.end();
      }

      // insert into DB topic id and call Sid 
      let callToTopicData = new CallSidToTopicId({
        callSid: callSid,
        topicId: topicID,
        lastReplyId : topicID
      });
      callToTopicData.save()
      .then(doc => {
        console.log('insert : ' , doc);
      })
      .catch(err => {
        console.error(err);
      });
    } else {
      // fetch topic id and last reply id from last callSid
      var lastDocCallToTopic;
      let ansCallSidToTopicId = CallSidToTopicId
      .find({
        callSid: queryObject.callSid   // search query
      })
      .exec()
      .then(doc => {
        console.log('find :', doc);
        lastDocCallToTopic = doc[doc.length - 1];
      })
      .catch(err => {
        console.error(err)
      });

      if(lastDocCallToTopic === null || lastDocCallToTopic === undefined) {
        res.writeHead(200);
        res.end();      
      }

      // how do we know it is supposed to be reply to previous post or a new topic?
      // make a post to the community
      const formPostData = new FormData();
      formPostData.append('message.author', 'login/admin');
      formPostData.append('message.subject', 'Reply from customer : ' + callSid);
      formPostData.append('message.body', textBody);
      formPostData.append('tag.add', 'vistaH');
      const postHeaders = Object.assign({
        'li-api-session-key': liaSession
      }, formPostData.getHeaders());
      var replyToTopicId;
      axios.post('http://localhost:8080/lia/restapi/vc/messages/id/'+mid+'?restapi.response_format=json',
      formPostData, { headers: postHeaders }  )
      .then((res) => {
        console.log(`Status: ${res.status}`);
        console.log('Body: ', res.data.response.message.id.$);
        replyToTopicId = res.data.response.message.id.$;
      }).catch((err) => {
        console.error('Error is : ', err.message);
      });

      if(replyToTopicId === undefined || replyToTopicId === null) {
        res.writeHead(200);
        res.end();
      }

      // save into DB reply id and call Sid 
      // update the last read message id in DB.
      lastDocCallToTopic.lastReplyId = replyToTopicId;
      lastDocCallToTopic.save();
    }

    res.writeHead(200);
    res.end();
  } else if(req.url === "/voice") {
    // Use the Twilio Node.js SDK to build an XML response
    const twiml = new VoiceResponse();

    var phoneNumber;
    var callSidNumber;
    // fetch phone number from request
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
        console.log(decodeURIComponent(jsonObj.From));
        phoneNumber = decodeURIComponent(jsonObj.From);
        callSidNumber = jsonObj.CallSid;
        console.log('json Object : ', jsonObj);
        console.log(phoneNumber);
      });


    if(phoneNumber === null || phoneNumber === undefined) {
      twiml.say('Error occured. Call back later!');
      res.writeHead(200, {"Content-Type": "text/xml"});
      res.end(twiml.toString());
    }

    /** helper function to set up a <Gather> */
    function gather() {
      const gatherNode = twiml.gather({ numDigits: 1 });
      gatherNode.say('For creating topic, press 1. For listening to reply of last query , press 2.');

      // If the user doesn't enter input, loop
      twiml.redirect('/voice');
    }
    gather();
    // If the user entered digits, process their request
    if (req.body.Digits) {
      switch (req.body.Digits) {
        case '1':
          twiml.say('Hello, I will be recording this call. Please say your query after beep !');
          // insert phone number to call sid into db
          let phoneData = new PhoneToCallSidModel({
            phone: phoneNumber,
            callSid: callSidNumber
          });
          phoneData.save()
          .then(doc => {
            console.log('insert : ' , doc);
          })
          .catch(err => {
            console.error(err);
          });

          // simple record on call.
          twiml.record({
	          action : 'https://handler.twilio.com/twiml/EHb8ba0a97524296b01c438a851f89d7be',
	          recordingStatusCallback: 'https://5d501f95286c.ngrok.io/recordingStatus',
	          recordingStatusCallbackMethod: 'POST',
            recordingStatusCallbackEvent: 'completed',
	          transcribeCallback : 'https://5d501f95286c.ngrok.io/transcribeStatus?isTopic=true&callSid=' + callSidNumber,
	          timeout: 10,
            transcribe: true
          });
          break;
        case '2':
          twiml.say('Listening to latest messages from last query posted.!');        
          var lastDocPhoneToCall;
          // fetch last call sid to from phone number
          let ansPhoneToCallSid = PhoneToCallSidModel
                  .find({
                    phone: phoneNumber   // search query
                  })
                  .exec()
                  .then(doc => {
                    console.log('find :', doc);
                    lastDocPhoneToCall = doc[doc.length - 1];
                  })
                  .catch(err => {
                    console.error(err)
                  });
          
          if(lastDocPhoneToCall === null || lastDocPhoneToCall === undefined) {
            twiml.say('No call previously done');
            break;
          }
          
          // fetch topic id and last reply id from last callSid
          var lastDocCallToTopic;
          let ansCallSidToTopicId = CallSidToTopicId
          .find({
            callSid: lastDocPhoneToCall.callSid   // search query
          })
          .exec()
          .then(doc => {
            console.log('find :', doc);
            lastDocCallToTopic = doc[doc.length - 1];
          })
          .catch(err => {
            console.error(err)
          });
  
          if(lastDocCallToTopic === null || lastDocCallToTopic === undefined) {
            twiml.say('No call previously done');
          break;
          }


          // take session key from community
          var liaSession;
          axios.post('http://localhost:8080/lia/restapi/vc/authentication/sessions/login?restapi.response_format=json',
            formData, { headers: formData.getHeaders() } )
          .then((res) => {
            liaSession = res.data.response.value.$;
            console.log(`Status: ${res.status}`);
            console.log('Body: ', liaSession);
          }).catch((err) => {
            console.error(err);
          });

          var headersLia = {
            headers: {
              'li-api-session-key': liaSession    }
          };
      
          var messageList;
          axios.get('http://localhost:8080/lia/restapi/vc/threads/id/' + lastDocCallToTopic.topicId
          + '/messages/linear?restapi.response_format=json',
            headersLia  )
          .then((res) => {
            console.log(`Status: ${res.status}`);
            // resconsole.log('Body: ', res.data.response.messages.message[0].id.$);
            messageList = res.data.response.messages.message;
          }).catch((err) => {
            console.error('Error is : ', err.message);
          });
          if(messageList === null || messageList === undefined) {
            twiml.say('Error occured. Call back later!');
            break;
          }

          // read aloud the latest messages.
          for(var i = 0; i < messageList.length; i++) {
            if(lastDocCallToTopic.lastReplyId < messageList[i].id.$) {
              var bodyOfPost;
              axios.get('http://localhost:8080/lia/restapi/vc/messages/id/' + messageList[i].id.$ + '?restapi.response_format=json', headersLia  )
              .then((res) => {
                console.log(`Status: ${res.status}`);
                //console.log('Body: ', striptags(res.data.response.message.body.$));
                bodyOfPost = striptags(res.data.response.message.body.$);
              }).catch((err) => {
                console.error('Error is : ', err.message);
              });
              if(bodyOfPost === null || bodyOfPost === undefined) {
                continue;
              }
              twiml.say('Agent replied as ' + bodyOfPost);
            }
          }
          if(messageList.length === 1 ) {
            twiml.say('No new reply recieved. Check again later.');
          }

          // update the last read message id in DB.
          lastDocCallToTopic.lastReplyId = messageList[messageList.length - 1].id.$;
          lastDocCallToTopic.save();

          // do you want to give a new reply to this post?
          // if yes, please start speaking, and record. 
          twiml.say('do you want to give a new reply to this post?');
          const gatherNodeReply = twiml.gather({ numDigits: 1 });
          gatherNodeReply.say('For creating reply, press 3. Press any other key to exit.');
          // If the user entered digits, process their request
          if (req.body.Digits) {
            switch (req.body.Digits) {
              case '3':
                          // simple record on call.
                twiml.record({
	                action : 'https://handler.twilio.com/twiml/EHb8ba0a97524296b01c438a851f89d7be',
	                recordingStatusCallback: 'https://5d501f95286c.ngrok.io/recordingStatus',
	                recordingStatusCallbackMethod: 'POST',
                  recordingStatusCallbackEvent: 'completed',
	                transcribeCallback : 'https://5d501f95286c.ngrok.io/transcribeStatus?isTopic=false&callSid=' + lastDocPhoneToCall.callSid,
	                timeout: 10,
                  transcribe: true
                });
                break;
              default:
                break;
            }
          }
          // transcribeCallback : 'https://5d501f95286c.ngrok.io/transcribeStatus',
          // here, in the call back, append the parameter, newTopic, current callSid 
          // for replying to the old topic, append the parameter reply and callSid of the post you fetched from DB. 

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
    // Render the response as XML in reply to the webhook request
    res.writeHead(200, {"Content-Type": "text/xml"});
    res.end(twiml.toString());


    // Create TwiML response
    // const twiml = new VoiceResponse();
    // twiml.say('Hello from your pals at Twilio! Have fun. I will be recording this call. Thanks!');
      
    // simple response on call.
    //res.writeHead(200, { 'Content-Type': 'text/xml' });
    //res.end(twiml.toString());
    
    // simple record on call.
    // twiml.record({
	  //   action : 'https://handler.twilio.com/twiml/EHb8ba0a97524296b01c438a851f89d7be',
	  //   recordingStatusCallback: 'https://5d501f95286c.ngrok.io/recordingStatus',
	  //   recordingStatusCallbackMethod: 'POST',
    //   recordingStatusCallbackEvent: 'completed',
	  //   transcribeCallback : 'https://5d501f95286c.ngrok.io/transcribeStatus',
	  //   timeout: 10,
    //   transcribe: true
    // });
    // //console.log(twiml.toString());
    // res.writeHead(200, {"Content-Type": "text/xml"});
    // res.end(twiml.toString());

  } else {
    const twiml = new VoiceResponse();
    twiml.say('Wrong call.');
    res.writeHead(200, {"Content-Type": "text/xml"});
    res.end(twiml.toString());


  }
})
.listen(1337, '127.0.0.1');

console.log('TwiML server running at http://127.0.0.1:1337/');



// request parameters recieved when we recieve the call : https://www.twilio.com/docs/voice/twiml
// request parameters recieved when we get notified for transcription : https://www.twilio.com/docs/voice/twiml/record

//phone number, call sid 
//call sid, topic id. last reply heard - message id. by default, keep it same as topic id.


// press 1 for listening to replies for old query. 
// get the last query and hear reply to it only.
// press 2 for new query. 



// check the thread if there are new reply to it. 
// if no reply, say no reply yet.
// if there are new replies, and last reply id is same as topic id, 
//read them aloud and update in the db the message id of the latest one.
// if there are new replies, and last reply id is not as topic id,
// read new replies from the last reply id.




//save call sid for that particular user phone number and post id in lia. then check if there are any new replies to it.
// for each phone number, we will store list of call sids. and for each call sid, we will store a topic id.
// if they are trying to listen to the replies received on the call, 
// should we try to save the last reply heard also? give option for listening to the whole thread as well?
// i think for poc, knowing the last reply is enough.







// phone number -> call id -> topic id isTopic = true
// phone number ->  same as old call id -> reply id isTopic = false and along with it, update last reply id in db to this one.


// so when you are fetching replies, for phone number, get all call Sids and get the last one call id which has isTopic tag true.
// for that check the latest reply.




