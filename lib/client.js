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
const STATE = 'state'
const CODE = 'code';
const PLACEHOLDER_URL = 'http://myurl';

class Client {
    constructor(config) {
        this.validateConfig(config);
        // Prioritise supplied configuration over default
        this.config = { ...default_config, ...config };
    }

    scopesToString(scopes) {
        return scopes.reduce((prev, cur) => `${prev},${cur}`)
    }

    stringToScopes(scope_string) {
        return scope_string.split(',');
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
        const uri = new URL(this.config.authorization_uri);
        uri.searchParams.append(CLIENT_ID, this.config.client_id);
        uri.searchParams.append(REDIRECT_URI, this.config.redirect_uri);
        uri.searchParams.append(RESPONSE_TYPE, RESPONSE_TYPE_CODE);
        uri.searchParams.append(APPROVAL_PROMPT, APPROVAL_PROMPT_AUTO);
        uri.searchParams.append(SCOPE, this.scopesToString(this.config.scopes));

        return uri.href;
    }

    async getToken(req_url) {
        // A base URL must be included when a relative URL is passed to this function
        const url = new URL(req_url, PLACEHOLDER_URL);

        const param_object = {
            state: url.searchParams.get(STATE),
            code: url.searchParams.get(CODE),
            scope: url.searchParams.get(SCOPE)
        };

        return await this.getTokenFromObject(param_object);
    }

    async getTokenFromObject(param_object) {
        // Check that scopes granted match scopes requested
        const scope_string = param_object.scope;
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
            code: param_object.code,
            grant_type: GRANT_TYPE_AUTHORIZATION_CODE
        });

        const token = new Token(
            res.data.token_type,
            res.data.expires_at,
            res.data.expires_in,
            res.data.refresh_token,
            res.data.access_token,
            res.data.athlete
        )

        return token;
    }
}

module.exports = { Client };