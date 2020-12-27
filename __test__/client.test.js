const { Client } = require('../lib/client');
const { Token } = require('../lib/token');
const lib_config = require('../lib/config');
const axios = require('axios');
jest.mock('axios');

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

describe('getToken(reqUrl)', () => {
    const config = {
        client_id: 1234,
        client_secret: 'mysecret',
        redirect_uri: 'https://localhost:8443',
        scopes: ['read', 'activity:write'],
    };

    const token_json = {
        token_type: 'Bearer',
        expires_at: 1568775134,
        expires_in: 21600,
        refresh_token: 'e5n567567',
        access_token: 'a4b945687g',
        athlete: {
          name: null
        }
    }

    const token = new Token(
        token_json.token_type,
        token_json.expires_at,
        token_json.expires_in,
        token_json.refresh_token,
        token_json.access_token,
        token_json.athlete
    );

    beforeAll(() => {
        client = new Client(config);
        axios.post.mockImplementation(async () => {return {data: token_json}});
    });

    it('should throw an exception if the request does not contain all scopes requested', async () => {
        const reqUrl = 'https://localhost:8443/?state=&code=db1baba06e40d4b3b3f999c8a0235c346c6b2547&scope=activity:write';
        await expect(client.getToken(reqUrl)).rejects;
    });

    it('should send a post request with the extracted data from the URL', async () => {
        const reqUrl = 'https://localhost:8443/?state=&code=db1baba06e40d4b3b3f999c8a0235c346c6b2547&scope=activity:write,read';
        await client.getToken(reqUrl);
        
        const expected_request_data = {
            client_id: config.client_id,
            client_secret: config.client_secret,
            code: 'db1baba06e40d4b3b3f999c8a0235c346c6b2547',    
            grant_type: 'authorization_code'    
        };
        
        expect(axios.post).toHaveBeenCalledWith(lib_config.token_uri, expected_request_data);
    });
    
    it('should create and return a token object based on the Strava auth response', async () => {
        const reqUrl = 'https://localhost:8443/?state=&code=db1baba06e40d4b3b3f999c8a0235c346c6b2547&scope=activity:write,read';
        const response_token = await client.getToken(reqUrl);
        
    });
    
    it('should create a token when passed a relative URL', async () => {
        const reqUrl = '/api/auth/callback?state=&code=8e8435a0e7c7f7027068611cfe0cd9a3392d974d&scope=read,activity:read_all'
        const response_token = await client.getToken(reqUrl);
        expect(response_token).toEqual(token);
    });
});