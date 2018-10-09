import { promisify } from 'util';
import * as zlib from 'zlib';

import * as iconv from 'iconv-lite';
import * as brotli from 'iltorb';
import test, { Context, GenericTestContext } from 'ava';

import { createServer } from '@hint/utils-create-server';
import { Requester } from '../src/requester';
import { NetworkData } from 'hint/dist/src/lib/types';

const compressGzip: Function = promisify(zlib.gzip) as any;
const compressBrotli: Function = promisify(brotli.compress) as any;
const compress = {
    br: compressBrotli,
    gzip: compressGzip
};

const text = `This is a text
    with several characters <> "'
    áéíóúàèìòùâêîôûäëïöü`;

test.beforeEach(async (t) => {
    const server = createServer();
    const requester = new Requester();

    await server.start();

    t.context.server = server;
    t.context.requester = requester;
});

test.afterEach.always((t) => {
    const { server } = t.context;

    server.stop();
});

/*
 * ------------------------------------------------------------------------------
 * Encoding tests
 * ------------------------------------------------------------------------------
 */

/**
 * Supported encodings to test. `iconv-lite` supports more (as well as us)
 * but these are the most common that we want to verify
 * https://github.com/webhintio/hint/issues/89#issuecomment-292480515
 */

const supportedEncodings = [
    'utf-8',
    'iso-8859-1',
    'windows-1251'
];

const contentTypes = [
    'application/javascript',
    'application/json',
    'application/x-javascript',
    'application/xml',
    'application/xhtml+xml',
    'application/something+json',
    'image/svg+xml',
    'text/html',
    'text/something'
];

/**
 * This function verifies that we can decode the bytes for the expected `Content-Type`s
 * and the supported `charset`s, even when the server response is compressed.
 *
 */
const testTextDecoding = async (t: GenericTestContext<Context<any>>, encoding: string, contentType: string, compression?: 'gzip' | 'br') => {
    const { requester, server } = t.context;
    const originalBytes = iconv.encode(text, encoding);
    const transformedText = iconv.decode(originalBytes, encoding);
    const content: Buffer = compression ?
        await compress[compression](originalBytes) :
        originalBytes;

    server.configure({
        '/': {
            content,
            headers: {
                'Content-Encoding': compression ? compression : 'identity',
                'Content-Type': `${contentType}; charset=${encoding}`
            }
        }
    });

    const { response: { body } } = await requester.get(`http://localhost:${server.port}`);
    const rawResponse = await body.rawResponse();

    // body is a `string`
    t.is(body.content, transformedText);

    // rawBody is a `Buffer` with the uncompressed bytes of the response
    t.true(originalBytes.equals(body.rawContent), 'rawContent is not the same');

    // rawBodyResponse is a `Buffer` with the original bytes of the response
    t.true(content.equals(rawResponse));
};

supportedEncodings.forEach((encoding) => {
    contentTypes.forEach((contentType) => {
        test(`requester handles ${encoding} uncompressed`, testTextDecoding, encoding, contentType);
        test(`requester handles ${encoding} compressed with gzip`, testTextDecoding, encoding, contentType, 'gzip');
        test(`requester handles ${encoding} compressed with brotli`, testTextDecoding, encoding, contentType, 'br');
    });
});

/*
 * ------------------------------------------------------------------------------
 * Binary Content-Types
 * ------------------------------------------------------------------------------
 */

const binTypes = [
    'image/jpeg',
    'image/png'
];

/** This function verifies that no decoding is done if `Content-Type` doesn't expect it. */
const testBinaries = async (t: GenericTestContext<Context<any>>, binType: string) => {
    const { requester, server } = t.context;

    const content = iconv.encode(text, 'iso-8859-1');

    server.configure({
        '/': {
            content,
            headers: { 'Content-Type': `${binType}; charset=iso-8859-1` }
        }
    });

    const { response: { body } } = await requester.get(`http://localhost:${server.port}`);

    t.deepEqual(body.rawContent, content);

    // Body should be null
    t.is(body.content, null);
};

binTypes.forEach((binType) => {
    test(`requester doesn't transform content for ${binType}`, testBinaries, binType);
});

/*
 * ------------------------------------------------------------------------------
 * Hops
 * ------------------------------------------------------------------------------
 */

const hopsServerConfig = {
    '/': 'Final destination',
    '/hop301': {
        content: 'hop302',
        status: 301
    },
    '/hop302': {
        content: 'hop303',
        status: 302
    },
    '/hop303': {
        content: 'hop307',
        status: 303
    },
    '/hop307': {
        content: 'hop308',
        status: 307
    },
    '/hop308': {
        content: '/',
        status: 308
    }
};

const loopServerConfig = {
    '/hop301': {
        content: 'hop301',
        status: 301
    }
};

const loopServerMultiSteps = {
    '/hop301': {
        content: 'hop302',
        status: 301
    },
    '/hop302': {
        content: 'hop303',
        status: 302
    },
    '/hop303': {
        content: 'hop301',
        status: 303
    }
};

test(`Requester follows all hops, reports the right number and returns the final string content`, async (t) => {
    const { requester, server } = t.context;

    server.configure(hopsServerConfig);

    const { response } = await requester.get(`http://localhost:${server.port}/hop301`) as NetworkData;

    t.is(response.hops.length, Object.keys(hopsServerConfig).length - 1);
    t.is(response.body.content, hopsServerConfig['/']);
});

test(`Throws an error if number of hops exceeds the redirect limit`, async (t) => {
    const maxRedirectsRequester = new Requester({ maxRedirects: 4 });
    const server = t.context.server;

    server.configure(hopsServerConfig);

    const maxRedirectsRequesterError = await t.throws(maxRedirectsRequester.get(`http://localhost:${server.port}/hop301`));

    t.is(maxRedirectsRequesterError, 'The number of redirects(5) exceeds the limit(4).');
});

test(`Aborts the request if it exceeds the time limit to get response`, async (t) => {
    const timeoutRequester = new Requester({ timeout: 3000 });
    const server = t.context.server;
    const timeOutServerConfig = { '/timeout': { content: 'timeout' } };

    server.configure(timeOutServerConfig);

    const { error, uri } = await t.throws(timeoutRequester.get(`http://localhost:${server.port}/timeout`));

    t.is(error.code, 'ESOCKETTIMEDOUT');
    t.is(uri, `http://localhost:${server.port}/timeout`);
});

test(`Requester returns and exception if a loop is detected`, async (t) => {
    const { requester, server } = t.context;

    server.configure(loopServerConfig);

    t.plan(1);

    try {
        await requester.get(`http://localhost:${server.port}/hop301`) as NetworkData; // eslint-disable-line no-unused-expressions
    } catch (e) {
        t.is(e, `'http://localhost:${server.port}/hop301' could not be fetched using GET method (redirect loop detected).`);
    }
});

test(`Requester returns and exception if a loop is detected after few redirects`, async (t) => {
    const { requester, server } = t.context;

    server.configure(loopServerMultiSteps);

    t.plan(1);

    try {
        await requester.get(`http://localhost:${server.port}/hop301`) as NetworkData; // eslint-disable-line no-unused-expressions
    } catch (e) {
        t.is(e, `'http://localhost:${server.port}/hop303' could not be fetched using GET method (redirect loop detected).`);
    }
});
