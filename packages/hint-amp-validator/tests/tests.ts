/* eslint sort-keys: 0 */

import { HintTest, testHint } from '@hint/utils-tests-helpers';
import { test, fs } from '@hint/utils';

const { readFile } = fs;
const { getHintPath } = test;
const hintPath = getHintPath(__filename);

const validAMPHTML = readFile(`${__dirname}/fixtures/valid-amp.html`);
const invalidAMPHTML = readFile(`${__dirname}/fixtures/invalid-amp.html`);

const defaultTests: HintTest[] = [
    {
        name: 'Valid AMP HTML passes',
        serverConfig: validAMPHTML
    },
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    },
    {
        name: 'Invalid AMP HTML fails',
        serverConfig: invalidAMPHTML,
        reports: [
            {
                message: `The mandatory attribute '⚡' is missing in tag 'html'. (https://www.ampproject.org/docs/reference/spec#required-markup)`,
                position: { match: '<html lang="en">' }
            }
        ]
    },
    {
        name: `Error downloading HTML doesn't fail`,
        serverConfig: null
    }
];

testHint(hintPath, defaultTests);
