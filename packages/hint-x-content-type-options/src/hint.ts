/**
 * @fileoverview Check if responses are served with the
 * `X-Content-Type-Options` HTTP response header.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { IAsyncHTMLElement, FetchEnd, IHint } from 'hint/dist/src/lib/types';
import normalizeString from 'hint/dist/src/lib/utils/misc/normalize-string';
import isDataURI from 'hint/dist/src/lib/utils/network/is-data-uri';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import meta from './meta';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class XContentTypeOptionsHint implements IHint {

    public static readonly meta = meta;
    public constructor(context: HintContext) {

        const isHeaderRequired = (element: IAsyncHTMLElement | null): boolean => {
            if (!element) {
                return false;
            }

            const nodeName = normalizeString(element.nodeName);

            /*
             * See:
             *
             *  * https://github.com/whatwg/fetch/issues/395
             *  * https://fetch.spec.whatwg.org/#x-content-type-options-header
             */

            if (nodeName === 'script') {
                return true;

            }

            if (nodeName === 'link') {
                // We check if element exists before and `normalizeString` will return `''` as default
                const relValues = (normalizeString(element.getAttribute('rel'), ''))!.split(' ');

                return relValues.includes('stylesheet');
            }

            return false;
        };

        const validate = async ({ element, resource, response }: FetchEnd) => {
            // This check does not make sense for data URI.

            if (isDataURI(resource)) {
                debug(`Check does not apply for data URI: ${resource}`);

                return;
            }

            const headerValue: string | null = normalizeString(response.headers && response.headers['x-content-type-options']);

            if (isHeaderRequired(element)) {
                if (headerValue === null) {
                    await context.report(resource, `Response should include 'x-content-type-options' header.`, { element });

                    return;
                }

                if (headerValue !== 'nosniff') {
                    await context.report(resource, `'x-content-type-options' header value should be 'nosniff', not '${headerValue}'.`, { element });

                    return;
                }

                return;
            }

            if (headerValue) {
                await context.report(resource, `Response should not include unneeded 'x-content-type-options' header.`, { element });
            }
        };

        context.on('fetch::end::*', validate);
    }
}
