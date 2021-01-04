# strava-oauth2
A simple Node.JS OAuth2 client for connecting your app to the Strava API

## Installation

Using npm:
```bash
npm install strava-oauth2
```

## API Examples

### Class Instantiation
`strava-oauth2` exposes 2 classes which can be used to interact with the Strava authentication services.

A full list of configuration options and defaults are provided in [Config Defaults](#config-defaults).

```js
const { Client, Token } = require('strava-oauth2');

// The below configuration is the minimum required.
const config = {
    client_id: 194012,
    client_secret: 'abcdef1234567890',
    redirect_uri: 'https://localhost/auth/callback'
};

const client = new Client(config);
```

### Client Authentication
#### By URL
The below uses Express to redirect a connecting client to the Strava authentication page before parsing the resultant code and obtaining a `Token`.

```js
app.get('/auth', (req, res) => {
    res.redirect(client.getAuthorizationUri());
});

// Must be the same as the redirect_uri specified in the config
app.get('/auth/callback', async (req, res) => {
    const token = await client.getToken(req.originalUrl);
    // Process token...

    res.redirect('/home');
});

app.get('/home', (req, res) => {
    res.send('Welcome!');
});
```

#### By Request Parameters
You can also parse the request query string parameters yourself and pass them to `strava-oauth2`, via `Client.getTokenFromObject(params)`. The example below generates a token via the event passed by an [AWS API Gateway Lambda Proxy integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html).

```js
exports.handler = async (event) => {
    const params = event.queryStringParameters;
    console.info('Here are our params', params);
    const token = await client.getTokenFromObject(params);
}
```

Console output:
```
Here are our params {
  state: '',
  code: 'abcdef1234567890',
  scope: 'read,activity:read_all'
}
```

### Request Signing
To interact with the Strava API, you must sign your request with the access token. The `Token` class can provide an axios client which signs all requests made with it using your access token.

```js
if (!token.hasExpired()) {
    // If the token has expired the below will throw an exception
    const axios_instance = token.getSignedAxiosInstance();

    const athlete = axios_instance.get('https://www.strava.com/api/v3/athlete');
}
```

## Config Defaults
Full list of default configuration options and defaults is below. If you instantiate a `Client` class without specifying a `client_id` and a `client_secret`, an exception will be thrown. The other parameters are optional.
```js
const config = {
    authorization_uri: 'https://www.strava.com/api/v3/oauth/authorize',
    token_uri: 'https://www.strava.com/api/v3/oauth/token',
    revocation_uri: 'https://www.strava.com/api/v3/oauth/deauthorize',
    client_id: null,
    client_secret: null,
    redirect_uri: 'https://localhost',
    scopes: ['read'],
}
```
