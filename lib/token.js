const axios = require('axios');

class Token {
    constructor(
            token_type,
            expires_at,
            expires_in,
            refresh_token,
            access_token,
            athlete) {
        this.token_type = token_type;
        this.expires_at = expires_at;
        this.expires_in = expires_in;
        this.refresh_token = refresh_token;
        this.access_token = access_token;
        this.athlete = athlete;
    }

    /**
     * Gets an axios HTTP client instance with authorization
     * headers for request signing.
     * @returns Axios instance
     */
    getAxiosInstance() {
        const now_seconds = Date.now() / 1000;
        if (now_seconds > this.expires_at) {
            throw new Error(`Tried to get axios instance for expired token. Expired time ${this.expires_at}, current time: ${now_seconds}`);
        }
        const instance = axios.create({
            headers: { 'Authorization': `Bearer ${this.access_token}`}
        });
        return instance;
    }
}

module.exports = { Token };