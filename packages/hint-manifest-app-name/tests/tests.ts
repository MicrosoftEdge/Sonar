import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const htmlWithManifestSpecified = generateHTMLPage('<link rel="manifest" href="site.webmanifest">');

const tests: HintTest[] = [
    {
        name: `Web app manifest is specified without 'name' and 'short_name'`,
        reports: [{ message: `Web app manifest should have 'name' property.` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: '{}' }
        }
    },
    {
        name: `Web app manifest is specified with empty 'name' and no 'short_name'`,
        reports: [{ message: `Web app manifest should have non-empty 'name' property value.` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{ "name": "     " }` }
        }
    },
    {
        name: `Web app manifest is specified with 'name' and no 'short_name'`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{ "name": "🐛🐛🐛🐛🐛🐛🐛🐛🐛🐛🐛🐛" }` }
        }
    },
    {
        name: `Web app manifest is specified with long 'name' and 'short_name'`,
        reports: [{ message: `Web app manifest should have 'name' property value under 30 characters.` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{ "name": "1234567890123456789012345678901", "short_name": "test" }` }
        }
    },
    {
        name: `Web app manifest is specified with 'name' and 'short_name'`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{ "name": "12345678901", "short_name": "🐛🐛🐛🐛🐛🐛🐛🐛🐛🐛🐛🐛" }` }
        }
    },
    {
        name: `Web app manifest is specified with 'name' and empty 'short_name'`,
        reports: [{ message: `Web app manifest should have non-empty 'short_name' property value.` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{ "name": "12345678901", "short_name": "  " }` }
        }
    },
    {
        name: `Web app manifest is specified with 'name' and long 'short_name'`,
        reports: [{ message: `Web app manifest should have 'short_name' property value under 12 characters.` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{ "name": "12345678901", "short_name": "1234567890123" }` }
        }
    }
];

hintRunner.testHint(getHintPath(__filename), tests, { parsers: ['manifest'] });
