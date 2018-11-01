/**
 * @fileoverview `babel-config/is-valid` warns against providing an invalid babel configuration file.
 */
import { Category } from 'hint/dist/src/lib/enums/category';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { IHint, HintMetadata } from 'hint/dist/src/lib/types';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';

import { BabelConfigEvents, BabelConfigInvalidJSON, BabelConfigInvalidSchema } from '@hint/parser-babel-config';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */
export default class BabelConfigIsValidHint implements IHint {
    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.development,
            description: `'babel-config/is-valid' warns against providing an invalid babel configuration file \`.babelrc\``
        },
        id: 'babel-config/is-valid',
        schema: [],
        scope: HintScope.local
    }

    public constructor(context: HintContext<BabelConfigEvents>) {
        const invalidJSONFile = async (babelConfigInvalid: BabelConfigInvalidJSON, event: string) => {
            const { error, resource } = babelConfigInvalid;

            debug(`${event} received`);

            await context.report(resource, null, error.message);
        };

        const invalidSchema = async (fetchEnd: BabelConfigInvalidSchema) => {
            const { errors, prettifiedErrors, resource } = fetchEnd;

            debug(`parse::babel-config::error::schema received`);

            for (let i = 0; i < errors.length; i++) {
                const message = prettifiedErrors[i];
                const location = errors[i].location;

                await context.report(resource, null, message, undefined, location);
            }
        };

        context.on('parse::babel-config::error::json', invalidJSONFile);
        context.on('parse::babel-config::error::circular', invalidJSONFile);
        context.on('parse::babel-config::error::extends', invalidJSONFile);
        context.on('parse::babel-config::error::schema', invalidSchema);
    }
}
