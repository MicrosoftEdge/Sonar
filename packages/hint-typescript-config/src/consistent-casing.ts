/**
 * @fileoverview `typescript-config/consistent-casing` checks if the property `forceConsistentCasingInFileNames`
 * is enabled in the TypeScript configuration file (i.e `tsconfig.json`).
 */
import { TypeScriptConfigEvents } from '@hint/parser-typescript-config';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { configChecker } from './helpers/config-checker';

import meta from './meta/consistent-casing';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class TypeScriptConfigConsistentCasing implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<TypeScriptConfigEvents>) {
        const validate = configChecker('compilerOptions.forceConsistentCasingInFileNames', true, 'The compiler option "forceConsistentCasingInFileNames" should be enabled to reduce issues when working with different OSes.', context);

        context.on('parse::end::typescript-config', validate);
    }
}
