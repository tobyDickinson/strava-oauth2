# strava-oauth2
A simple Node.JS OAuth2 client for connecting your app to the Strava API

## Installation

Using npm:
```bash
npm install strava-oauth2
```

## API Reference

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
The below uses express to redirect a connecting client to the Strava authentication page before parsing the resultant code and obtaining a `Token`.

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
