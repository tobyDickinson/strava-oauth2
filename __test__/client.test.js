const { Client } = require('../lib/client');

describe('getAuthorizationUri()', () => {
    const config = {
        client_id: 1234,
        client_secret: 'mysecret',
        redirect_uri: 'https://localhost:8443',
        scopes: ['read', 'activity:write'],
    }

    let client;

    beforeAll(() => {
        client = new Client(config);
    });

    it('should return the correct uri', () => {
        const uri = client.getAuthorizationUri();
        expect(uri).toEqual('https://www.strava.com/api/v3/oauth/authorize?client_id=1234&redirect_uri=https%3A%2F%2Flocalhost%3A8443&response_type=code&approval_prompt=auto&scope=read%2Cactivity%3Awrite');
    });
});