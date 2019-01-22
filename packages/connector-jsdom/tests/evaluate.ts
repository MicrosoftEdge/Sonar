import { URL } from 'url';

import anyTest, { TestInterface } from 'ava';

import { createServer, Server } from '@hint/utils-create-server';
import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { IConnector, Events } from 'hint/dist/src/lib/types';
import { Engine } from 'hint';

import JSDOMConnector from '../src/connector';

type EvaluateContext = {
    connector?: IConnector;
    engine: Engine<Events>;
    server: Server;
};

const test = anyTest as TestInterface<EvaluateContext>;

const name: string = 'jsdom';

const scripts = [
    {
        code:
            `(function () {
    return 10;
}())`,
        result: 10
    },
    {
        code:
            `(function () {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('done');
        }, 1000);
    });
}())`,
        result: 'done'
    },
    {
        code:
            `(function () {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error('aborted'));
        }, 1000);
    });
}())`,
        result: new Error('aborted')
    },
    {
        code: 'return 10;',
        result: new Error()
    }
];

test.beforeEach(async (t) => {
    const engine: Engine<Events> = {
        emit(): boolean {
            return false;
        },
        async emitAsync(): Promise<any> { },
        timeout: 10000
    } as any;

    const server = createServer();

    await server.start();

    t.context = {
        engine,
        server
    };
});

test.afterEach.always(async (t) => {
    t.context.server.stop();
    await t.context.connector!.close();
});

test(`[${name}] Evaluate JavaScript`, async (t) => {
    const { engine } = t.context;
    const connector: IConnector = new JSDOMConnector(engine, {});
    const server = t.context.server;

    t.plan(scripts.length);
    t.context.connector = connector;

    server.configure(generateHTMLPage('', ''));

    await connector.collect(new URL(`http://localhost:${server.port}/`));

    for (let i = 0; i < scripts.length; i++) {
        const { code, result: expectedResult } = scripts[i];

        try {
            const result = await (connector.evaluate ? connector.evaluate(code) : null);

            t.is(result, expectedResult, `Result value "${result}" is the same`);
        } catch (error) {
            if (expectedResult instanceof Error) {
                t.pass('Expected exception');
            } else {
                t.fail('Unexpected exception thrown');
            }
        }
    }
});
