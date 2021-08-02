let data = 'RecordingSource=RecordVerb&RecordingSid=RE0ff7ecec483bcbbeb0d76eb8bfe5b6e0&RecordingUrl=https%3A%2F%2Fapi.twilio.com%2F2010-04-01%2FAccounts%2FACf6a02ac6eb6d9b86ba23ff55298fff0e%2FRecordings%2FRE0ff7ecec483bcbbeb0d76eb8bfe5b6e0&RecordingStatus=completed&RecordingChannels=1&ErrorCode=0&CallSid=CAc171381f0271647a58f4b30e02a14d23&RecordingStartTime=Thu%2C%2029%20Jul%202021%2006%3A59%3A25%20%2B0000&AccountSid=ACf6a02ac6eb6d9b86ba23ff55298fff0e&RecordingDuration=3';

//console.log(data.split('&'));
//console.log(JSON.stringify(data).split('&'));
var sampleArray = data.split('&');
var jsonObj = {};
for (var i = 0, len = sampleArray.length; i < len; i++) {
    jsonObj[sampleArray[i].split('=')[0]] = sampleArray[i].split('=')[1];
}
console.log(decodeURIComponent(jsonObj.RecordingUrl));


