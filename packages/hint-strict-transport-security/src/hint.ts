/**
 * @fileoverview Check if responses served over HTTPS also have the Strict-Transport-Security header with a proper value max-age value.
 */
import * as url from 'url';
import { URL } from 'url'; // this is necessary to avoid TypeScript mixes types.

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { FetchEnd, IHint, NetworkData } from 'hint/dist/src/lib/types';
import isRegularProtocol from 'hint/dist/src/lib/utils/network/is-regular-protocol';

import meta from './meta';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class StrictTransportSecurityHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        /** The minimum period (in seconds) allowed for `max-age`. */
        let minMaxAgeValue: number;
        /** Whether or not check the preload attribute */
        let checkPreload: boolean;
        /** Endpoint to verify that the domain name has already been included in the `preload list` */
        const statusApiEndPoint = `https://hstspreload.org/api/v2/status?domain=`;
        /** Endpoint to verify that the domain name is qualified to be preloaded */
        const preloadableApiEndPoint = `https://hstspreload.org/api/v2/preloadable?domain=`;
        /** Set of unsupported domains to avoid make unnecessary requests. */
        const unsupportedDomains: Set<string> = new Set();

        /*
         * HACK: Need to do a require here in order to be capable of mocking
         * when testing the hint and `import` doesn't work here.
         */
        const isHTTPS = require('hint/dist/src/lib/utils/network/is-https').default;
        const normalizeString = require('hint/dist/src/lib/utils/misc/normalize-string').default;
        const requestJSONAsync = require('hint/dist/src/lib/utils/network/request-json-async').default;

        const loadHintConfigs = () => {
            minMaxAgeValue = (context.hintOptions && context.hintOptions.minMaxAgeValue) || 10886400; // 18 weeks
            checkPreload = (context.hintOptions && context.hintOptions.checkPreload);
        };

        /*
         * STS header Syntax:
         * Strict-Transport-Security: max-age=<expire-time>
         * Strict-Transport-Security: max-age=<expire-time>; includeSubDomains
         * Strict-Transport-Security: max-age=<expire-time>; preload
         * This function accomplishes the following:
         * "max-age=31536000; includesubdomains; preload" => {"max-age":31536000,"includesubdomains":true,"preload":true}
         */
        const parse = (headerValue: string) => {
            const parsedHeader: { [name: string]: string } = {};
            const directives = headerValue.toLowerCase().split(';');
            const nameValuePairRegex = /^ *([!#$%&'*+.^_`|~0-9A-Za-z-]+) *= *("(?:[~0-9])*"|[!#$%&'*+.^_`|~0-9]+) *$/;
            /*
             * Regex for name-value pairs. E.g.: max-age=31536000
             * Modified usage of https://github.com/jshttp/content-type/blob/64bde0d996ccb4334341662c0c7d25f7b370c4d9/index.js#L23
             */
            const tokenRegex = /^ *[!#$%&'*+.^_`|~0-9A-Za-z-]+$/; // Regex for single tokens. E.g.:  includesubdomains

            directives.forEach((directive) => {
                const match = tokenRegex.exec(directive) || nameValuePairRegex.exec(directive);

                if (!match) {
                    throw new Error(`'strict-transport-security' header has the wrong format: ${directive}`);
                }

                const [matchString, key, value] = match;
                const name = key || matchString.trim();

                if (parsedHeader[name]) {
                    throw new Error(`'strict-transport-security' header contains more than one '${name}'`);
                }

                parsedHeader[name] = value || 'true';
            });

            return parsedHeader;
        };

        const isUnderAgeLimit = (maxAge: string, limit: number): boolean => {
            return !!maxAge && parseInt(maxAge) < limit;
        };

        const isPreloaded = (hostname: string): Promise<{ [key: string]: any }> => {
            debug(`Waiting to get preload status for ${hostname}`);

            return requestJSONAsync(`${statusApiEndPoint}${hostname}`);
        };

        const issuesToPreload = (hostname: string): Promise<{ [key: string]: any }> => {
            debug(`Waiting to get preload eligibility for ${hostname}`);

            return requestJSONAsync(`${preloadableApiEndPoint}${hostname}`);
        };

        const verifyPreload = async (resource: string): Promise<{ [key: string]: any }> => {
            const originalDomain = new URL(resource).hostname;
            const mainDomain = originalDomain.replace(/^www./, '');
            // Some hostnames in the list include `www.`, e.g., `www.gov.uk`.
            let status: string;
            let issues: { [key: string]: any } = {};

            try {
                ({ status } = await isPreloaded(mainDomain) || await isPreloaded(originalDomain));
            } catch (err) {
                const message = `Error with getting preload status for ${resource}.`;

                debug(message, err);
                await context.report(resource, message);

                return issues;
            }

            debug(`Received preload status for ${resource}.`);

            if (!status) {
                const message = `Error with getting preload status for ${resource}. There might be something wrong with the verification endpoint.`;

                debug(message);
                await context.report(resource, message);

                return issues;
            }

            if (status !== 'preloaded') {
                try {
                    issues = await issuesToPreload(mainDomain);
                } catch (err) {
                    const message = `Error with getting preload eligibility for ${resource}.`;

                    debug(message, err);
                    await context.report(resource, message);
                }

                debug(`Received preload eligibility for ${resource}.`);
            }

            return issues;
        };

        const validate = async ({ element, resource, response }: FetchEnd) => {
            if (!isRegularProtocol(resource)) {
                debug(`Check does not apply for non HTTP(s) URIs`);

                return;
            }

            const headerValue: string = normalizeString(response.headers && response.headers['strict-transport-security']);
            let parsedHeader;

            if (!isHTTPS(resource) && headerValue) {
                const message = `'strict-transport-security' header should't be specified in pages served over HTTP.`;

                await context.report(resource, message, { element });

                return;
            }

            if (!isHTTPS(resource) && !headerValue) {
                const urlObject = new URL(resource);

                if (unsupportedDomains.has(urlObject.host)) {
                    debug(`${resource} ignored because the domain ${urlObject.host} does not support HTTPS.`);

                    return;
                }

                const httpsResource = url.format(Object.assign(urlObject, { protocol: `https` }));

                try {
                    const networkData: NetworkData = await context.fetchContent(httpsResource);

                    if (!networkData || !networkData.response) {
                        return;
                    }

                    if (networkData.response.statusCode === 200) {
                        validate({
                            element: null,
                            request: networkData.request,
                            resource: httpsResource,
                            response: networkData.response
                        });
                    }
                } catch (err) {
                    // HTTPS site can't be fetched, do nothing.
                    debug(`${resource} doesn't support HTTPS`);

                    /*
                     * If the HTTPS resource can't be fetched,
                     * add the domain to the unsupported list.
                     */
                    unsupportedDomains.add(urlObject.host);
                }

                return;
            }

            // Check if the header `Strict-Transport-Security` is sent for resources served over HTTPS.
            if (!headerValue) {
                await context.report(resource, `'strict-transport-security' header was not specified`, { element });

                return;
            }
            // Parse header and report repetitive attributes
            try {
                parsedHeader = parse(headerValue);
            } catch (err) {
                await context.report(resource, err.message, { element });

                return;
            }

            // Verify preload attribute
            if (checkPreload && parsedHeader.preload) {
                const { errors } = await verifyPreload(resource);

                if (errors) {
                    for (const error of errors) {
                        await context.report(resource, error.message, { element });
                    }

                    return;
                }
            }

            const maxAge = parsedHeader['max-age'];

            // Check if header `Strict-Transport-Security` contains `max-age` directive.
            if (!maxAge) {
                const message = `'strict-transport-security' header requires 'max-age' directive`;

                await context.report(resource, message, { element });

                return;
            }

            // Check if the `max-age` value is smaller than the minimum of max-age defined
            if (isUnderAgeLimit(maxAge, minMaxAgeValue)) {
                const message = `'strict-transport-security' header 'max-age' value should be more than ${minMaxAgeValue}`;

                await context.report(resource, message, { element });

                return;
            }
        };

        loadHintConfigs();

        context.on('fetch::end::*', validate);
    }
}
