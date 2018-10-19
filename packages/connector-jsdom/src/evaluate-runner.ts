import * as vm from 'vm';

import { JSDOM, VirtualConsole } from 'jsdom';
import * as jsdomutils from 'jsdom/lib/jsdom/living/generated/utils';

import { debug as d } from 'hint/dist/src/lib/utils/debug';

import { beforeParse } from './before-parse';

const debug: debug.IDebugger = d(__filename);

const run = async (data: { source: string }) => {
    const { source } = data;
    const result = {
        error: null as Error | null,
        evaluate: 'result'
    };
    const url = process.argv[2];
    const waitFor = parseInt(process.argv[3], 10);

    const virtualConsole = new VirtualConsole();

    virtualConsole.on('error', (err: Error) => {
        debug(err);
    });

    virtualConsole.on('jsdomError', (err: Error) => {
        debug(err);
    });

    const jsdom = await JSDOM.fromURL(url, {
        beforeParse: beforeParse(url),
        pretendToBeVisual: true,
        resources: 'usable',
        runScripts: 'dangerously',
        virtualConsole
    });

    const onLoad = () => {
        /*
         * Even though `onLoad()` is called on `window.onload`
         * (so all resoruces and scripts executed), we might want
         * to wait a few seconds if the site is lazy loading something.
         */
        return setTimeout(async () => {
            try {
                const script: vm.Script = new vm.Script(source);
                const evaluteResult = await script.runInContext(jsdomutils.implForWrapper(jsdom.window.document)._global);

                result.evaluate = evaluteResult;
            } catch (err) {
                result.error = err;
            }

            process.send!(result);
        }, waitFor);
    };

    const onError = (error: ErrorEvent) => {
        debug(`onError: ${error}`);
    };

    jsdom.window.addEventListener('load', onLoad, { once: true });
    jsdom.window.addEventListener('error', onError);
};

process.on('message', run);
