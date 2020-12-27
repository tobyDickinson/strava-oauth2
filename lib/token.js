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
     * Helper method converts the current date to seconds
     * after epoch.
     * @returns {Number} Current time in number of seconds after epoch.
     */
    nowSeconds() {
        return Date.now() / 1000;
    }

    /**
     * Gets an axios HTTP client instance with authorization
     * headers for request signing.
     * @returns Axios instance
     */
    getSignedAxiosInstance() {
        if (this.hasExpired()) {
            throw new Error(`Tried to get axios instance for expired token. Expired time ${this.expires_at}, current time: ${this.nowSeconds()}`);
        }
        const instance = axios.create({
            headers: { 'Authorization': `Bearer ${this.access_token}`}
        });
        return instance;
    }

    /**
     * Returns whether the token has expired, based on the
     * expires_at field in the token.
     * @returns {Boolean} Whether the access token has expired.
     */
    hasExpired() {
        if (this.nowSeconds() > this.expires_at) {
            return true;
        } else {
            return false;
        }
    }
}

module.exports = { Token };