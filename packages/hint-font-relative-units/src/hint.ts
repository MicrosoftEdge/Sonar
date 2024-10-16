/**
 * @fileoverview Ensure font styles use relative units to enable user stylesheet overrides
 */

import { Declaration, Rule } from 'postcss';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, ProblemLocation } from 'hint/dist/src/lib/types';
import { debug as d } from '@hint/utils';
import { getCSSCodeSnippet } from '@hint/utils/dist/src/report/get-css-code-snippet';
import { StyleEvents, StyleParse } from '@hint/parser-css';

import meta from './meta';
import { getMessage } from './i18n.import';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class FontA11yFontSizeUnitsHint implements IHint {

    public static readonly meta = meta;
    public readonly FONT_PROPERTIES = ['font-size', 'line-height', 'letter-spacing'];

    public constructor(context: HintContext<StyleEvents>) {

        const getLocation = (decl: Declaration): ProblemLocation => {
            const start = decl.source && decl.source.start;

            if (start) {
                return {
                    column: start.column - 1,
                    line: start.line - 1
                };
            }

            return {
                column: 0,
                line: 0
            };
        };

        const validateFontValue = (prop: string, value: string): boolean => {
            if (this.FONT_PROPERTIES.includes(prop)) {
                return value.indexOf('px') === -1;
            }

            return true;
        };

        const validateRule = (rule: Rule): Declaration[] => {
            const invalidDeclarations: Declaration[] = [];

            rule.each((decl) => {
                if (!('prop' in decl)) {
                    return;
                }

                const validRule = validateFontValue(decl.prop, decl.value);

                if (!validRule) {
                    invalidDeclarations.push(decl);
                }
            });

            return invalidDeclarations;
        };

        context.on('parse::end::css', ({ ast, element, resource }: StyleParse) => {
            debug('Validating hint font-relative-units');

            const getPixelErrorMessage = function(decl: Declaration): string {
                return getMessage('pixelError', context.language, [decl.prop]);
            };

            ast.walkRules((rule) => {
                for (const invalidDeclaration of validateRule(rule)) {
                    const message = getPixelErrorMessage(invalidDeclaration);
                    const location = getLocation(invalidDeclaration);
                    const codeSnippet = getCSSCodeSnippet(invalidDeclaration);

                    context.report(resource, message, { codeLanguage: 'css', codeSnippet, element, location });
                }
            });
        });
    }
}
