/* eslint-disable no-sync */

import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';

import * as sinon from 'sinon';
import test, { GenericTestContext, Context } from 'ava';

import { createServer, ServerConfiguration } from '@hint/utils-create-server';
import { IConnector, IConnectorConstructor } from 'hint/dist/src/lib/types';
import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import ChromeConnector from '../src/connector';

const name: string = 'chrome';

test.beforeEach(async (t) => {
    const engine = {
        emit() { },
        emitAsync() { }
    };

    const server = createServer();

    await server.start();

    sinon.spy(engine, 'emit');
    sinon.spy(engine, 'emitAsync');

    t.context = {
        engine,
        server
    };
});

test.afterEach.always((t) => {
    t.context.server.stop();
    t.context.engine.emit.restore();
    t.context.engine.emitAsync.restore();
});

const pathToFaviconInDir = path.join(__dirname, './fixtures/common/favicon.ico');
const pathToFaviconInLinkElement = path.join(__dirname, './fixtures/common/favicon-32x32.png');

const runTest = async (t: GenericTestContext<Context<any>>, ConnectorConstructor: IConnectorConstructor, serverConfig?: ServerConfiguration) => {
    const { engine } = t.context;
    const connector: IConnector = new ConnectorConstructor(engine, {});
    const server = t.context.server;

    if (serverConfig) {
        server.configure(serverConfig);
    }

    await connector.collect(new URL(`http://localhost:${server.port}/`));
    await connector.close();
};

test(`[${name}] The HTML is downloaded and the right event emitted`, async (t) => {
    const serverConfig: ServerConfiguration = { '/': generateHTMLPage(`<title>Test</title>`) };

    await runTest(t, ChromeConnector, serverConfig);

    t.is(t.context.engine.emitAsync.withArgs('fetch::end::html').callCount, 1);
});

test(`[${name}] Favicon is present in a 'link' element with 'rel' attribute set to 'icon' `, async (t) => {
    const faviconInLinkElementDir = `http://localhost:${t.context.server.port}/images/favicon-32x32.png`;
    const serverConfig: ServerConfiguration = {
        '/': generateHTMLPage(`<link rel="icon" type="image/png" href="/images/favicon-32x32.png" sizes="32x32">`),
        '/images/favicon-32x32.png': fs.readFileSync(pathToFaviconInLinkElement)
    };

    await runTest(t, ChromeConnector, serverConfig);

    t.is(t.context.engine.emitAsync.withArgs('fetch::end::image').callCount, 1);
    t.is(t.context.engine.emitAsync.withArgs('fetch::end::image').args[0][1].request.url, faviconInLinkElementDir);

});

test(`[${name}] Favicon is present in the root directory`, async (t) => {
    const faviconInRootDir = `http://localhost:${t.context.server.port}/favicon.ico`;
    const serverConfig: ServerConfiguration = { '/favicon.ico': fs.readFileSync(pathToFaviconInDir) };

    await runTest(t, ChromeConnector, serverConfig);

    t.is(t.context.engine.emitAsync.withArgs('fetch::end::image').callCount, 1);
    t.is(t.context.engine.emitAsync.withArgs('fetch::end::image').args[0][1].request.url, faviconInRootDir);
});

test(`[${name}] Favicon is present in both the root directory and the 'link' element`, async (t) => {
    const faviconInLinkElementDir = `http://localhost:${t.context.server.port}/images/favicon-32x32.png`;
    const serverConfig: ServerConfiguration = {
        '/': generateHTMLPage(`<link rel="icon" type="image/png" href="/images/favicon-32x32.png" sizes="32x32">`),
        '/favicon.ico': fs.readFileSync(pathToFaviconInDir),
        '/images/favicon-32x32.png': fs.readFileSync(pathToFaviconInLinkElement)
    };

    await runTest(t, ChromeConnector, serverConfig);

    t.is(t.context.engine.emitAsync.withArgs('fetch::end::image').callCount, 1);
    // Should load favicon from the link element if it exists
    t.is(t.context.engine.emitAsync.withArgs('fetch::end::image').args[0][1].request.url, faviconInLinkElementDir);
});

test(`[${name}] Favicon is present in both the root directory and the 'link' element, but the 'link' element has empty 'href'`, async (t) => {
    const faviconInRootDir = `http://localhost:${t.context.server.port}/favicon.ico`;
    const serverConfig: ServerConfiguration = {
        '/': generateHTMLPage(`<link rel="icon" type="image/png" href="" sizes="32x32">`),
        '/favicon.ico': fs.readFileSync(pathToFaviconInDir)
    };

    await runTest(t, ChromeConnector, serverConfig);

    t.is(t.context.engine.emitAsync.withArgs('fetch::end::image').callCount, 1);
    // Should load favicon from the root even though the link element exists because 'href' is empty.
    t.is(t.context.engine.emitAsync.withArgs('fetch::end::image').args[0][1].request.url, faviconInRootDir);
});

test(`[${name}] Favicon is not present in either the root directory or the 'link' element`, async (t) => {
    const faviconInRootDir = `http://localhost:${t.context.server.port}/favicon.ico`;
    const serverConfig: ServerConfiguration = { '/': generateHTMLPage() };

    await runTest(t, ChromeConnector, serverConfig);

    // Requests to `/favicon.ico` are always sent when favicon doesn't exist as a `link` tag in the html.
    t.is(t.context.engine.emitAsync.withArgs('fetch::end::image').callCount, 1);
    t.is(t.context.engine.emitAsync.withArgs('fetch::end::image').args[0][1].request.url, faviconInRootDir);
});
