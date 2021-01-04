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
const PLACEHOLDER_URL = 'http://localhost';

class Client {
    constructor(config) {
        this.validateConfig(config);
        // Prioritise supplied configuration over default
        this.config = { ...default_config, ...config };
    }

    /**
     * Converts an array of scopes to a CSV format as mandated by the Strava API documentation
     * @param {[String]} scopes an array of scopes e.g. ['read', 'activity:read_all']
     * @returns {String} a string of the scopes in CSV format e.g. 'read,activity:read_all'
     * as required by the Strava API as a query string parameter.
     */
    scopesToString(scopes) {
        return scopes.reduce((prev, cur) => `${prev},${cur}`)
    }

    /**
     * Converts a CSV string of scopes to an array
     * @param {String} scope_string The string in format 'read,activity:read_all'
     * @returns {[String]} Scopes array in the format ['read', 'activity:read_all']
     */
    stringToScopes(scope_string) {
        return scope_string.split(',');
    }

    /**
     * Checks the supplied config to ensure it has a client_id and a 
     * client_secret. Throws an error if these are not provided.
     * @param {Object} config The configuration object
     * @returns {Boolean} True if the config is valid, else throw exception
     */
    validateConfig(config) {
        if (!config.client_id) {
            throw new Error('client_id must be specified');
        }
        if (!config.client_secret) {
            throw new Error('client_secret must be specified');
        }
        return true;
    }

    /**
     * Creates and returns a URI to redirect a client to for API OAuth authorization,
     * based on the supplied configuration object.
     * @returns {String} URI to redirect client.
     */
    getAuthorizationUri() {
        const uri = new URL(this.config.authorization_uri);
        uri.searchParams.append(CLIENT_ID, this.config.client_id);
        uri.searchParams.append(REDIRECT_URI, this.config.redirect_uri);
        uri.searchParams.append(RESPONSE_TYPE, RESPONSE_TYPE_CODE);
        uri.searchParams.append(APPROVAL_PROMPT, APPROVAL_PROMPT_AUTO);
        uri.searchParams.append(SCOPE, this.scopesToString(this.config.scopes));

        return uri.href;
    }

    /**
     * Takes a callback URL (redirected by Strava), extracts the code and scopes,
     * and exchanges them for an access token via the Strava OAuth token endpoint.
     * This function returns the associated Token object.
     * 
     * This function asserts that the scopes authorized are equivalent to the scopes
     * requested in the configuration and will throw an exception if they are not.
     * @param {String} req_url The callback URL accessed by the user.
     * @returns {Token} A Token object containing an access token and refresh token for the
     * user.
     */
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

    /**
     * Uses the request parameters provided by the Strava API and exchanges the
     * code for a Token object which is returned.
     * 
     * This function asserts that the scopes authorized are equivalent to the scopes
     * requested in the configuration and will throw an exception if they are not.
     * @param {Object} param_object An object containing the keys: state, code and scope
     * as provided by the Strava API in the callback URL requestParameters.
     * @returns {Token} A Token object containing an access token and refresh token for the
     * user.
     */
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