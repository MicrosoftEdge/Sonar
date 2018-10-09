/**
 * @fileoverview Check if responses are served with the
 * `X-Content-Type-Options` HTTP response header.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { Category } from 'hint/dist/src/lib/enums/category';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { IAsyncHTMLElement, FetchEnd, Response, IHint, HintMetadata } from 'hint/dist/src/lib/types';
import normalizeString from 'hint/dist/src/lib/utils/misc/normalize-string';
import isDataURI from 'hint/dist/src/lib/utils/network/is-data-uri';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class XContentTypeOptionsHint implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.security,
            description: `Require 'X-Content-Type-Options' header`
        },
        id: 'x-content-type-options',
        schema: [],
        scope: HintScope.site
    }

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

        const validate = async (fetchEnd: FetchEnd) => {
            const { element, resource, response }: { element: IAsyncHTMLElement | null, resource: string, response: Response } = fetchEnd;

            // This check does not make sense for data URI.

            if (isDataURI(resource)) {
                debug(`Check does not apply for data URI: ${resource}`);

                return;
            }

            const headerValue: string | null = normalizeString(response.headers && response.headers['x-content-type-options']);

            if (isHeaderRequired(element)) {
                if (headerValue === null) {
                    await context.report(resource, element, `Response should include 'x-content-type-options' header.`);

                    return;
                }

                if (headerValue !== 'nosniff') {
                    await context.report(resource, element, `'x-content-type-options' header value should be 'nosniff', not '${headerValue}'.`);

                    return;
                }

                return;
            }

            if (headerValue) {
                await context.report(resource, element, `Response should not include unneeded 'x-content-type-options' header.`);
            }
        };

        context.on('fetch::end::*', validate);
    }
}
