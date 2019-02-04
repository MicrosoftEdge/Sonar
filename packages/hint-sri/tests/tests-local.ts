import * as path from 'path';

import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';
import { HintLocalTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';

const hintPath = getHintPath(__filename);

const tests: HintLocalTest[] = [
    {
        name: 'Integrity ok and relative resources',
        path: path.join(__dirname, 'fixtures', 'local-pass')
    },
    {
        name: 'If the ingregity is nor valid',
        path: path.join(__dirname, 'fixtures', 'local-no-pass'),
        reports: [{
            message: `The hash in the "integrity" attribute in resource https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/core.js doesn't match the received payload.
Expected: sha256-YCbKJH6u4siPpUlk130udu/JepdKVpXjdEyzje+z1pE=
Actual:   sha256-YCbKJH6PpUlk130udu/JepdKVpXjdEyzje+z1pE=`
        }]
    }
];

hintRunner.testLocalHint(hintPath, tests, {
    hintOptions: { baseline: 'sha256' },
    parsers: ['html']
});
