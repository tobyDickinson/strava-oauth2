const axios = require('axios');
const { Token } = require('../lib/token');

describe('getAxiosInstance()', () => {
    let token;

    beforeAll(() => {
        token = new Token(
            'bearer_token',
            (Date.now() / 1000) + 21600,
            21600,
            'abc123',
            'def456',
            {
                athlete_id: 1234,
                firstname: 'toby'
            }
        );
    });

    it('should return an axios instance with the token set in a default authorization header', () => {
        const instance = token.getAxiosInstance();
        expect(instance.defaults.headers).toHaveProperty('Authorization');
        expect(instance.defaults.headers.Authorization).toEqual(`Bearer ${token.access_token}`);
    });

    it('should throw an error if the access token has expired', () => {
        token.expires_at = (Date.now() / 1000) - 10;
        expect(() => token.getAxiosInstance()).toThrow();
    });
});

describe('hasExpired()', () => {
    it.todo('should return true if the access token has expired');

    it.todo('should return false if access token has not expired');
});