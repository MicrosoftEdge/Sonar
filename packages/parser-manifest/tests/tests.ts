import test, { Context, GenericTestContext } from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import * as sinon from 'sinon';

import Parser from '../src/parser';
import { Manifest, ManifestInvalidJSON, ManifestInvalidSchema, ManifestParsed } from '../src/types';
import { ProblemLocation, ISchemaValidationError } from 'hint/dist/src/lib/types';

const elementLinkEventName = 'element::link';
const getElementLinkEventValue = (relAttribute: string = 'manifest', hrefAttribute: string = 'site.webmanifest') => {
    return {
        element: {
            getAttribute: (value: string) => {
                if (value === 'href') {
                    return hrefAttribute;
                }

                return relAttribute;
            },
            nodeName: 'LINK'
        },
        resource: 'https://example.com'
    };
};

const fetchEndEventName: string = 'fetch::end::manifest';
const fetchErrorEventName: string = 'fetch::error::manifest';
const fetchStartEventName: string = 'fetch::start::manifest';

const parseStartEventName: string = 'parse::start::manifest';
const parseEndEventName: string = 'parse::end::manifest';
const parseErrorSchemaEventName: string = 'parse::error::manifest::schema';
const parseJSONErrorEventName: string = 'parse::error::manifest::json';

const scanEndEventName: string = 'scan::end';
const scanEndEventValue = { resource: 'https://example.com' };

const createNetworkDataObject = (manifestContent: string = '', statusCode: number = 200) => {
    return {
        request: {
            headers: null,
            url: ''
        },
        response: {
            body: {
                content: manifestContent,
                rawContent: null,
                rawResponse: null
            },
            charset: '',
            headers: {},
            hops: [],
            mediaType: '',
            statusCode,
            url: ''
        }
    };
};

const createMissingTest = async (t: GenericTestContext<Context<any>>, relAttribute: string = 'manifest', hrefAttribute: string = '') => {
    const elementLinkEventValue = getElementLinkEventValue(relAttribute, hrefAttribute);
    const sandbox = sinon.createSandbox();
    const engine = t.context.engine;

    sandbox.spy(engine, 'emitAsync');

    new Parser(engine); // eslint-disable-line no-new

    await engine.emitAsync(elementLinkEventName, elementLinkEventValue);
    await engine.emitAsync(scanEndEventName, scanEndEventValue);

    t.is(engine.emitAsync.callCount, 2);
    t.is(engine.emitAsync.args[0][0], elementLinkEventName);
    t.is(engine.emitAsync.args[1][0], scanEndEventName);
    t.is(engine.emitAsync.args[1][1], scanEndEventValue);

    sandbox.restore();
};

const createParseTest = async (t: GenericTestContext<Context<any>>, manifestContent: string, expectedStartEventName: string, expectedEndEventName: string, verifyResult: Function) => {
    const elementEventValue = getElementLinkEventValue();
    const sandbox = sinon.createSandbox();
    const engine = t.context.engine;

    sandbox.spy(engine, 'emitAsync');
    sandbox.stub(engine, 'fetchContent');

    t.context.engine.fetchContent.onCall(0)
        .returns(createNetworkDataObject(manifestContent));

    new Parser(engine); // eslint-disable-line no-new

    await engine.emitAsync(elementLinkEventName, elementEventValue);

    t.is(engine.emitAsync.callCount, 5);
    t.is(engine.emitAsync.args[0][0], elementLinkEventName);
    t.is(engine.emitAsync.args[1][0], fetchStartEventName);
    t.is(engine.emitAsync.args[2][0], fetchEndEventName);
    t.is(engine.emitAsync.args[3][0], expectedStartEventName);
    t.is(engine.emitAsync.args[4][0], expectedEndEventName);

    verifyResult(t, engine.emitAsync.args[4][1]);

    sandbox.restore();
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

test.beforeEach((t) => {
    t.context.engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    });
    t.context.engine.fetchContent = () => {};
});

test(`No event is emitted when no web app manifest file is specified`, async (t) => {
    const sandbox = sinon.createSandbox();
    const engine = t.context.engine;

    sandbox.spy(engine, 'emitAsync');

    new Parser(engine); // eslint-disable-line no-new

    await engine.emitAsync(scanEndEventName, scanEndEventValue);

    t.is(engine.emitAsync.callCount, 1);
    t.is(engine.emitAsync.args[0][0], scanEndEventName);
    t.is(engine.emitAsync.args[0][1], scanEndEventValue);

    sandbox.restore();
});

test(`No event is emitted when '<link rel="manifest" href=''>' is specified`, async (t) => {
    await createMissingTest(t);
});

test(`No event is emitted when only a '<link rel="stylesheet"...>' is specified`, async (t) => {
    await createMissingTest(t, 'stylesheet', 'style.css');
});

test(`'${fetchErrorEventName}' event is emitted when the manifest cannot be fetched`, async (t) => {
    const elementEventValue = getElementLinkEventValue();
    const sandbox = sinon.createSandbox();
    const engine = t.context.engine;

    sandbox.spy(engine, 'emitAsync');
    sandbox.stub(engine, 'fetchContent');

    engine.fetchContent.onCall(0).throws(createNetworkDataObject());

    new Parser(engine); // eslint-disable-line no-new

    await engine.emitAsync(elementLinkEventName, elementEventValue);
    await engine.emitAsync(scanEndEventName, scanEndEventValue);

    t.is(engine.emitAsync.callCount, 4);
    t.is(engine.emitAsync.args[0][0], elementLinkEventName);
    t.is(engine.emitAsync.args[1][0], fetchStartEventName);
    t.is(engine.emitAsync.args[2][0], fetchErrorEventName);
    t.not(typeof engine.emitAsync.args[2][1].error, 'undefined');
    t.is(engine.emitAsync.args[3][0], scanEndEventName);

    sandbox.restore();
});

test(`'${fetchErrorEventName}' event is emitted when the response for the web app manifest has a status code differenr the 200`, async (t) => {
    const elementEventValue = getElementLinkEventValue();
    const manifestContent = '500 Internal Server Error';
    const sandbox = sinon.createSandbox();
    const engine = t.context.engine;

    sandbox.spy(engine, 'emitAsync');
    sandbox.stub(engine, 'fetchContent');

    t.context.engine.fetchContent.onCall(0)
        .returns(createNetworkDataObject(manifestContent, 500));

    new Parser(engine); // eslint-disable-line no-new

    await engine.emitAsync(elementLinkEventName, elementEventValue);
    await engine.emitAsync(scanEndEventName, scanEndEventValue);

    t.is(engine.emitAsync.callCount, 4);
    t.is(engine.emitAsync.args[0][0], elementLinkEventName);
    t.is(engine.emitAsync.args[1][0], fetchStartEventName);
    t.is(engine.emitAsync.args[2][0], fetchErrorEventName);
    t.not(typeof engine.emitAsync.args[2][1].error, 'undefined');
    t.is(engine.emitAsync.args[3][0], scanEndEventName);

    sandbox.restore();
});

test(`'${parseEndEventName}' event is emitted when manifest content is valid`, async (t) => {
    const manifestContent = { name: '5' };
    const manifestContentParsed = {
        dir: 'auto',
        display: 'browser',
        name: '5',
        prefer_related_applications: false // eslint-disable-line camelcase
    } as Manifest;

    await createParseTest(t, JSON.stringify(manifestContent), parseStartEventName, parseEndEventName, (tt: GenericTestContext<Context<any>>, result: ManifestParsed) => {
        tt.deepEqual(result.parsedContent, manifestContentParsed);
    });
});

test(`'${parseEndEventName}' event includes location information`, async (t) => {
    const manifestContent =
`{
    "name": "5"
};`;

    await createParseTest(t, manifestContent, parseStartEventName, parseEndEventName, (tt: GenericTestContext<Context<any>>, result: ManifestParsed) => {
        const nameLocation = result.getLocation('name');
        const valueLocation = result.getLocation('name', { at: 'value' });

        tt.is(nameLocation && nameLocation.line, 1);
        tt.is(nameLocation && nameLocation.column, 5);
        tt.is(valueLocation && valueLocation.line, 1);
        tt.is(valueLocation && valueLocation.column, 12);
    });
});

test(`'${parseJSONErrorEventName}' event is emitted when manifest content is not valid JSON`, async (t) => {
    const manifestContent = 'invalid';

    await createParseTest(t, manifestContent, parseStartEventName, parseJSONErrorEventName, (tt: GenericTestContext<Context<any>>, result: ManifestInvalidJSON) => {
        tt.not(typeof result.error, 'undefined');
    });
});

test(`'${parseErrorSchemaEventName}' event is emitted when manifest content is not valid because of an additional property`, async (t) => {
    const expectedPrettifiedErrors = [
        `'root' should NOT have additional properties. Additional property found 'additionalProperty'.`,
        `'root' should NOT have additional properties. Additional property found 'unknown_proprietary_extension'.`,
        `'icons[0]' should NOT have additional properties. Additional property found 'density'.`
    ];

    /* eslint-disable camelcase */
    const manifestContent = {
        additionalProperty: 'x',

        /*
         * Known proprietary extension.
         * https://www.w3.org/TR/appmanifest/#extensibility
         */
        gcm_sender_id: { a: 5 },

        icons: [{
            density: 2,
            src: '/a.png'
        }],

        // Unknown proprietary extension.
        unknown_proprietary_extension: 5
    };
    /* eslint-enable camelcase */

    await createParseTest(t, JSON.stringify(manifestContent), parseStartEventName, parseErrorSchemaEventName, (tt: GenericTestContext<Context<any>>, result: ManifestInvalidSchema) => {
        tt.is(result.prettifiedErrors.length, expectedPrettifiedErrors.length);
        tt.true(result.prettifiedErrors.every((e: any) => {
            return expectedPrettifiedErrors.includes(e);
        }));
    });
});

test(`'${parseErrorSchemaEventName}' event includes location information`, async (t) => {
    const expectedLocations: {[message: string]: ProblemLocation } = {
        [`'icons[0]' should NOT have additional properties. Additional property found 'density'.`]: {
            column: 9,
            line: 4
        },
        [`'root' should NOT have additional properties. Additional property found 'additionalProperty'.`]: {
            column: 5,
            line: 1
        },
        [`'root' should NOT have additional properties. Additional property found 'unknown_proprietary_extension'.`]: {
            column: 5,
            line: 7
        }
    };

    const manifestContent =
`{
    "additionalProperty": "x",
    "gcm_sender_id": { "a": 5 },
    "icons": [{
        "density": 2,
        "src": "/a.png"
    }],
    "unknown_proprietary_extension": 5
}`;

    await createParseTest(t, manifestContent, parseStartEventName, parseErrorSchemaEventName, (tt: GenericTestContext<Context<any>>, result: ManifestInvalidSchema) => {

        result.errors.forEach((error: ISchemaValidationError, i: number) => {
            const message = result.prettifiedErrors[i];
            const expectedLocation = expectedLocations[message];

            tt.is(error.location && error.location.line, expectedLocation.line);
            tt.is(error.location && error.location.column, expectedLocation.column);
        });
    });
});
