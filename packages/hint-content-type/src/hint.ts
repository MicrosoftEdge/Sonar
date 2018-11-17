/**
 * @fileoverview Check the usage of the `Content-Type` HTTP response
 * header.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { MediaType, parse } from 'content-type';

import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { IHint, FetchEnd } from 'hint/dist/src/lib/types';
import getHeaderValueNormalized from 'hint/dist/src/lib/utils/network/normalized-header-value';
import isDataURI from 'hint/dist/src/lib/utils/network/is-data-uri';
import normalizeString from 'hint/dist/src/lib/utils/misc/normalize-string';
import { isTextMediaType } from 'hint/dist/src/lib/utils/content-type';
import { HintContext } from 'hint/dist/src/lib/hint-context';

import meta from './meta';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class ContentTypeHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        let userDefinedMediaTypes: { [regex: string]: string };

        const loadHintConfigs = () => {
            userDefinedMediaTypes = context.hintOptions || {};
        };

        const getLastRegexThatMatches = (resource: string): string | undefined => {
            const results = (Object.entries(userDefinedMediaTypes).filter(([regex]) => {
                const re = new RegExp(regex, 'i');

                return re.test(resource);
            }))
                .pop();

            return results && results[1];
        };

        const validate = async ({ element, resource, response }: FetchEnd) => {
            if (response.statusCode !== 200) {
                debug(`Check does not apply to status code !== 200`);

                return;
            }

            // This check does not make sense for data URIs.
            if (isDataURI(resource)) {
                debug(`Check does not apply for data URIs`);

                return;
            }

            const contentTypeHeaderValue: string | null = getHeaderValueNormalized(response.headers, 'content-type');

            // Check if the `Content-Type` header was sent.

            if (contentTypeHeaderValue === null) {
                await context.report(resource, `Response should include 'content-type' header.`, { element });

                return;
            }

            /*
             * If the current resource matches any of the regexes
             * defined by the user, use that value to validate.
             */

            const userDefinedMediaType: string | undefined = getLastRegexThatMatches(resource);

            if (userDefinedMediaType) {
                if (normalizeString(userDefinedMediaType) !== contentTypeHeaderValue) {
                    await context.report(resource, `'content-type' header value should be '${userDefinedMediaType}'.`, { element });
                }

                return;
            }

            // Check if the `Content-Type` value is valid.

            let contentType: MediaType;

            try {
                if (contentTypeHeaderValue === '') {
                    throw new TypeError('invalid media type');
                }

                contentType = parse(contentTypeHeaderValue);
            } catch (e) {
                await context.report(resource, `'content-type' header value should be valid (${e.message}).`, { element });

                return;
            }

            const originalCharset: string | null = normalizeString(contentType.parameters ? contentType.parameters.charset : '');
            const originalMediaType: string = contentType.type;

            /*
             * Determined values
             *
             * Notes:
             *
             *  * The connectors already did all the heavy lifting here.
             *  * For the charset, recommend `utf-8` for all text based
             *    bases documents.
             */

            const mediaType: string = response.mediaType;
            const charset: string = isTextMediaType(mediaType) ? 'utf-8' : response.charset;

            /*
             * Check if the determined values differ
             * from the ones from the `Content-Type` header.
             */

            // * media type

            if (mediaType && (mediaType !== originalMediaType)) {
                await context.report(resource, `'content-type' header media type value should be '${mediaType}', not '${originalMediaType}'.`, { element });
            }

            // * charset value

            if (charset) {
                if (!originalCharset || (charset !== originalCharset)) {
                    await context.report(resource, `'content-type' header charset value should be '${charset}'${originalCharset ? `, not '${originalCharset}'` : ''}.`, { element });
                }
            } else if (originalCharset &&
                ![
                    'text/html',
                    'application/xhtml+xml'
                ].includes(originalMediaType)) {
                await context.report(resource, `'content-type' header value should not contain 'charset=${originalCharset}'.`, { element });
            }
        };

        loadHintConfigs();

        context.on('fetch::end::*', validate);
    }
}
