const axios = require('axios');
const URL = require('url').URL;

const default_config = require('./config');

const RESPONSE_TYPE_CODE = 'code';
const APPROVAL_PROMPT_AUTO = 'auto';
const CLIENT_ID = 'client_id';
const REDIRECT_URI = 'redirect_uri'
const RESPONSE_TYPE = 'response_type'
const APPROVAL_PROMPT = 'approval_prompt'
const SCOPE = 'scope'

class Client {
    constructor(config) {
        this.validateConfig(config);
        // Prioritise supplied configuration over default
        this.config = { ...default_config, ...config };
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
        uri.searchParams.append(SCOPE, this.config.scopes.reduce((prev, cur) => `${prev},${cur}`));

        return uri.href;
    }
}

module.exports = { Client };