/**
 * @fileoverview Check if a `<meta charset="utf-8">` is specified
 * as the first thing in `<head>`.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as cheerio from 'cheerio';

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { IAsyncHTMLDocument, IAsyncHTMLElement, IRule, FetchEnd, RuleMetadata, TraverseEnd } from 'sonarwhal/dist/src/lib/types';
import { normalizeString } from 'sonarwhal/dist/src/lib/utils/misc';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class MetaCharsetUTF8Rule implements IRule {

    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.interoperability,
            description: 'Require `<meta charset="utf-8">`'
        },
        id: 'meta-charset-utf-8',
        schema: [],
        scope: RuleScope.any
    }

    public constructor(context: RuleContext) {
        let receivedDOM;
        /*
         * This function exists because not all connector (e.g.: jsdom)
         * support matching attribute values case-insensitively.
         *
         * https://www.w3.org/TR/selectors4/#attribute-case
         */

        const getCharsetMetaTags = (elements: Array<IAsyncHTMLElement>): Array<IAsyncHTMLElement> => {
            return elements.filter((element) => {
                return (element.getAttribute('charset') !== null) ||
                    (element.getAttribute('http-equiv') !== null && normalizeString(element.getAttribute('http-equiv')) === 'content-type');
            });
        };

        /** Stores the DOM received on the initial load */
        const setReceivedDom = (event: FetchEnd) => {
            // The first time we receive this event is the main content, we don't care about iframes, requests by ads, etc.
            /* istanbul ignore if */
            if (typeof receivedDOM !== 'undefined') {
                return;
            }

            receivedDOM = event.response.body.content ?
                cheerio.load(event.response.body.content) :
                cheerio.load('');
        };

        const validate = async (event: TraverseEnd) => {
            const { resource }: { resource: string } = event;

            /*
             * There are 2 versions of the charset meta tag:
             *
             *  * <meta charset="charset">
             *  * <meta http-equiv="content-type" content="text/html; charset=<charset>">
             *
             * Also, there is a XML declaration:
             *
             *  * <?xml version="1.0" encoding="<charset>"?>
             *
             * but for regular HTML, it should not be used.
             */

            const pageDOM: IAsyncHTMLDocument = context.pageDOM as IAsyncHTMLDocument;
            const charsetMetaTags: Array<IAsyncHTMLElement> = getCharsetMetaTags(await pageDOM.querySelectorAll('meta'));

            if (charsetMetaTags.length === 0) {
                await context.report(resource, null, 'No charset meta tag was specified');

                return;
            }

            /*
             * Treat the first charset meta tag as the one
             * the user intended to use, and check if it's:
             */

            const charsetMetaTag: IAsyncHTMLElement = charsetMetaTags[0];

            // * `<meta charset="utf-8">`

            if (charsetMetaTag.getAttribute('http-equiv') !== null) {
                await context.report(resource, charsetMetaTag, `Use shorter '<meta charset="utf-8">'`);
            } else if (normalizeString(charsetMetaTag.getAttribute('charset')) !== 'utf-8') {
                await context.report(resource, charsetMetaTag, `The value of 'charset' is not 'utf-8'`);
            }

            /*
             * * specified as the first thing in `<head>`
             *
             * Note: The Charset meta tag should be included completely
             *       within the first 1024 bytes of the document, but
             *       that check will be done by the html/markup validator.
             */
            const charsetMetaTagHTML = await charsetMetaTag.outerHTML();
            const firstHeadElement = receivedDOM('head :first-child')[0];
            const receivedMetas = receivedDOM('meta');
            const firstMeta = receivedMetas.length > 0 ? receivedMetas[0] : '';
            const firstMetaHTML = firstMeta ? receivedDOM.html(firstMeta) : '';
            const headElementContent: string = receivedDOM.html(receivedDOM('head'));

            if (!firstHeadElement ||
                firstHeadElement !== receivedMetas[0] ||
                !firstMetaHTML ||
                charsetMetaTagHTML !== firstMetaHTML ||
                !(/^<head[^>]*>\s*<meta/).test(headElementContent)) {

                await context.report(resource, charsetMetaTag, `Charset meta tag should be the first thing in '<head>'`);
            }

            // * specified in the `<body>`.

            const bodyMetaTags: Array<IAsyncHTMLElement> = getCharsetMetaTags(await pageDOM.querySelectorAll('body meta'));

            if ((bodyMetaTags.length > 0) && bodyMetaTags[0].isSame(charsetMetaTag)) {
                await context.report(resource, charsetMetaTag, `Meta tag should not be specified in the '<body>'`);

                return;
            }

            // All other charset meta tags should not be included.

            if (charsetMetaTags.length > 1) {
                const metaTags = charsetMetaTags.slice(1);

                for (const metaTag of metaTags) {
                    await context.report(resource, metaTag, 'A charset meta tag was already specified');
                }
            }

            /*
             * Same goes for the XML declaration.
             * TODO: Enable it once `jsdom` returns the correct content
             * const xmlDeclaration = context.pageContent.match(/^\s*(<\?xml\s[^>]*encoding=.*\?>)/i);
             *
             * if (xmlDeclaration) {
             *     await context.report(resource, null, `Unneeded XML declaration: '${xmlDeclaration[1]}'`);
             * }
             */
        };

        context.on('fetch::end::html', setReceivedDom);
        context.on('traverse::end', validate);
    }
}
