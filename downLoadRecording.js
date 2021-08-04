const accountSid = '*';
const authToken = '*';
const client = require('twilio')(accountSid, authToken);

client.recordings('RE0ff7ecec483bcbbeb0d76eb8bfe5b6e0')
      .fetch()
      .then(recording => console.log(recording.callSid));

client.recordings
      .list({callSid: 'CAc171381f0271647a58f4b30e02a14d23', limit: 20})
      .then(recordings => recordings.forEach(r => {
		 console.log(r.sid); 
		 console.log(r);
	}));
