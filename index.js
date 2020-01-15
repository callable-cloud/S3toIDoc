const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const https = require('https');

exports.handler = function(event, context, callback) {
  var bucket = event.Records[0].s3.bucket.name;
  var key    = event.Records[0].s3.object.key;

  console.log(`receiving event for s3://${bucket}/${key}`);


  S3.getObject({Bucket: bucket,Key: key},(err,obj)=>{
    let buf = obj.Body;
    let options = {
      hostname: process.env.endpoint,
      port: 443,
      path: `/idoc/${process.env.idoc}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(buf),
        'Authorization': 'Basic '+ Buffer.from(process.env.user + ':' + process.env.password).toString('base64')
      }
    };
    console.log("requesting...");
    console.log(JSON.stringify(options,null,2));
    var req = https.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log(`${chunk}`);
      });
      res.on('end', () => {
        console.log('done');
        callback(null,"ok");
      });
    });
    
    req.on('error', (e) => {
      console.log(`problem with request: ${e.message}`);
    });
    
    req.write(buf);
    req.end();
  });
};