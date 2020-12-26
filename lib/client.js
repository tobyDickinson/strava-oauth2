const axios = require('axios');
const URL = require('url').URL;

const default_config = require('./config');
const { Token } = require('./token');

const RESPONSE_TYPE_CODE = 'code';
const APPROVAL_PROMPT_AUTO = 'auto';
const GRANT_TYPE_AUTHORIZATION_CODE = 'authorization_code';
const CLIENT_ID = 'client_id';
const REDIRECT_URI = 'redirect_uri';
const RESPONSE_TYPE = 'response_type';
const APPROVAL_PROMPT = 'approval_prompt';
const SCOPE = 'scope';
const CODE = 'code';

class Client {
    constructor(config) {
        this.validateConfig(config);
        // Prioritise supplied configuration over default
        this.config = { ...default_config, ...config };
    }

    scopesToString(scopes) {
        return scopes.reduce((prev, cur) => `${prev},${cur}`)
    }

    stringToScopes(scopeString) {
        return scopeString.split(',');
    }

    validateConfig(config) {
        if (!config.client_id) {
            throw new Error('client_id must be specified');
        }
        if (!config.client_secret) {
            throw new Error('client_secret must be specified');
        }
        return true;
    }

    getAuthorizationUri() {
        const strava_query = {
            client_id: this.config.client_id,
            redirect_uri: this.config.redirect_uri,
            response_type: RESPONSE_TYPE_CODE,
            approval_prompt: APPROVAL_PROMPT_AUTO,
            scope: this.config.scopes.reduce((prev, cur) => `${prev},${cur}`),
        };

        const uri = new URL(this.config.authorization_uri);
        uri.searchParams.append(CLIENT_ID, this.config.client_id);
        uri.searchParams.append(REDIRECT_URI, this.config.redirect_uri);
        uri.searchParams.append(RESPONSE_TYPE, RESPONSE_TYPE_CODE);
        uri.searchParams.append(APPROVAL_PROMPT, APPROVAL_PROMPT_AUTO);
        uri.searchParams.append(SCOPE, this.scopesToString(this.config.scopes));

        return uri.href;
    }

    async getToken(reqUrl) {
        const url = new URL(reqUrl);

        // Check that scopes granted match scopes requested
        const scope_string = url.searchParams.get(SCOPE);
        const scopes = this.stringToScopes(scope_string);
        const e = new Error(`Requested scopes ${this.config.scopes} not granted. Got: ${scopes}`);
        if (scopes.length !== this.config.scopes.length) {
            throw e;
        }
        for (let scope of scopes) if (!scope in this.config.scopes) throw e;

        // Obtain access token
        const res = await axios.post(this.config.token_uri, {
            client_id: this.config.client_id,
            client_secret: this.config.client_secret,
            code: url.searchParams.get(CODE),
            grant_type: GRANT_TYPE_AUTHORIZATION_CODE
        });

        const token = new Token(
            res.token_type,
            res.expires_at,
            res.expires_in,
            res.refresh_token,
            res.access_token,
            res.athlete
        )

        return token;
    }
}

module.exports = { Client };