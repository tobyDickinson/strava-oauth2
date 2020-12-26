const { Client } = require('../lib/client');
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

    beforeAll(() => {
        client = new Client(config);
        axios.post.mockImplementation(async () => {
            return {
                token_type: 'Bearer',
                expires_at: 1568775134,
                expires_in: 21600,
                refresh_token: 'e5n567567',
                access_token: 'a4b945687g',
                athlete: {
                  name: null
                }
              }
        });
    });

    it('should throw an exception if the request does not contain all scopes requested', () => {
        const reqUrl = 'https://localhost:8443/?state=&code=db1baba06e40d4b3b3f999c8a0235c346c6b2547&scope=activity:write';
        expect(() => client.getToken(reqUrl)).toThrow();
    });

    it('should send a post request with the extracted data from the URL', () => {
        const reqUrl = 'https://localhost:8443/?state=&code=db1baba06e40d4b3b3f999c8a0235c346c6b2547&scope=activity:write,read';
        client.getToken(reqUrl);
        
        const expected_request_data = {
            client_id: config.client_id,
            client_secret: config.client_secret,
            code: 'db1baba06e40d4b3b3f999c8a0235c346c6b2547',    
            grant_type: 'authorization_code'    
        };
        
        expect(axios.post).toHaveBeenCalledWith(lib_config.token_uri, expected_request_data);
    });
    
    it.todo('should create and return a token object based on the Strava auth response');
});