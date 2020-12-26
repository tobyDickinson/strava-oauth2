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
        this.athelete = athlete;
    }
}

module.exports = { Token };