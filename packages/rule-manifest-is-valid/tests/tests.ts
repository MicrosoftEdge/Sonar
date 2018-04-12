/* eslint sort-keys: 0, no-undefined: 0 */

import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';
import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';

const htmlWithManifestSpecified = generateHTMLPage('<link rel="manifest" href="site.webmanifest">');

const defaultTests: Array<RuleTest> = [
    {
        name: `Web app manifest is specified and its content is valid JSON`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': JSON.stringify({ name: 'test' })
        }
    },
    {
        name: `Web app manifest is specified and its content is not valid JSON`,
        reports: [{ message: `Should contain valid JSON` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': 'x'
        }
    },
    {
        name: `Web app manifest is specified and its content does not validate agains the schema`,
        reports: [
            { message: `Should NOT have additional properties. Additional property found 'additionalProperty'.` },
            { message: `'icons[0]' should NOT have additional properties. Additional property found 'density'.` },
            { message: `'name' should be string.` }
        ],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': JSON.stringify({
                additionalProperty: 'x',
                background_color: '#f00', // eslint-disable-line camelcase

                icons: [{
                    density: 2,
                    src: 'a.png',
                    type: 'image/png'
                }],
                name: 5
            })
        }
    },
    {
        name: `Web app manifest is specified and the 'lang' property is not valid`,
        reports: [{ message: `'lang' property value ('en-x') is not a valid language tag` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': JSON.stringify({ lang: 'en-x' })
        }
    },
    {
        name: `Web app manifest is specified and the 'background_color' and 'theme_color' properties are are valid`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': JSON.stringify({
                /* eslint-disable camelcase */
                background_color: 'red',
                theme_color: '#ff0000'
                /* eslint-enable camelcase */
            })
        }
    },
    {
        name: `Web app manifest is specified and the 'background_color' and 'theme_color' properties are not valid`,
        reports: [
            { message: `'background_color' property value ('invalid') is invalid` },
            { message: `'theme_color' property value ('invalid') is invalid` }
        ],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': JSON.stringify({
                /* eslint-disable camelcase */
                background_color: 'invalid',
                theme_color: 'invalid'
                /* eslint-enable camelcase */
            })
        }
    },
    {
        name: `Web app manifest is specified and the 'background_color' and 'theme_color' properties are not supported`,
        reports: [
            { message: `'background_color' property value ('#ff0000aa') is not supported everywhere` },
            { message: `'theme_color' property value ('#ff0000aa') is not supported everywhere` }
        ],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': JSON.stringify({
                /* eslint-disable camelcase */
                background_color: '#ff0000aa',
                theme_color: '#ff0000aa'
                /* eslint-enable camelcase */
            })
        }
    }
];

ruleRunner.testRule(getRuleName(__dirname), defaultTests, { parsers: ['manifest'] });
