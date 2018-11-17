/**
 * @fileoverview `webpack-config/is-valid` warns against providing an invalid webpack configuration file `webpack.config.js`.
 */
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';

import { WebpackConfigEvents, WebpackConfigInvalidConfiguration } from '@hint/parser-webpack-config';

import meta from './meta/is-valid';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class WebpackConfigIsValid implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<WebpackConfigEvents>) {

        const invalidConfigurationFile = async (webpackConfigInvalid: WebpackConfigInvalidConfiguration) => {
            const { error, resource } = webpackConfigInvalid;

            debug(`parse::error::webpack-config::configuration received`);

            await context.report(resource, error.message);
        };

        context.on('parse::error::webpack-config::configuration', invalidConfigurationFile);
    }
}
