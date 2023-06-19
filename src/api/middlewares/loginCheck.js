const querystring = require('querystring');

function logRequest(req, res, next) {
  

  next();
}

module.exports = logRequest;

function loginVerification(req, res, next) {

  const requestedUrl = req.originalUrl;
  const queryParams = req.query;
  const queryParamsString = querystring.stringify(queryParams);

  console.log(`Request: ${requestedUrl}?${queryParamsString}`);
  const key = req.query['key']?.toString();

  // Parse the request body
  const body = querystring.parse(req.body.toString());
  const message = body['message'];

  // Log the key value, requested URL, and message
  //  console.log('Key:', key);
  //console.log('Requested URL:', requestedUrl);
  //console.log('Message:', message);

  if (!key) {
    return res
      .status(403)
      .send({ error: true, message: 'no key query was present', requestedUrl });
  }

  const instance = WhatsAppInstances[key];
  if (!instance.instance?.online) {
    return res
      .status(401)
      .send({ error: true, message: "phone isn't connected", requestedUrl });
  }

  next();
}

module.exports = loginVerification;
