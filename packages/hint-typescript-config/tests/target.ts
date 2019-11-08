import * as path from 'path';

import { getHintPath, HintLocalTest, testLocalHint } from '@hint/utils-tests-helpers';

const hintPath = getHintPath(__filename, true);

type TestWithBrowserInfo = HintLocalTest & {
    browserslist: string[];
};

/** The paths to the target configurations for each tested version */
const paths = [
    'es3',
    'es5',
    'es2015',
    'es2016',
    'esnext',
    'extends',
    'extends-overrides',
    'no-target',
    'no-target-extends',
    'no-target-extends-target'
].reduce((final, version) => {

    final[version] = path.join(__dirname, 'fixtures', 'target', version);

    return final;
}, {} as any);


const tests: TestWithBrowserInfo[] = [
    {
        browserslist: ['IE 8', 'IE 9', 'Edge 15', 'Edge 16', 'Chrome 63', 'Chrome 60', 'android 4.4.3-4.4.4', 'Safari 10.1', 'Safari 10.0'],
        name: 'Configuration with "compilerOptions.target = es3" and old browsers should pass',
        path: paths.es3
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: 'Configuration with "compilerOptions.target = es3" and modern browsers should fail',
        path: paths.es3,
        reports: [
            {
                message: `Based on your browser configuration your "compilerOptions.target" should be "ES2016". Current one is "ES3"`,
                position: { match: '"es3"' }
            }
        ]
    },
    {
        browserslist: ['IE 9', 'Edge 15', 'Chrome 63'],
        name: 'Configuration with "compilerOptions.target = es5" and minimum browsers should pass',
        path: paths.es5
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: 'Configuration with "compilerOptions.target = es2016" and modern browsers should pass',
        path: paths.es2016
    },
    {
        browserslist: ['IE 8', 'Edge 15', 'Chrome 63'],
        name: 'Configuration with "compilerOptions.target = es2016" and old browsers should fail',
        path: paths.es2016,
        reports: [
            {
                message: `Based on your browser configuration your "compilerOptions.target" should be "ES3". Current one is "ES2016"`,
                position: { match: '"es2016"' }
            }
        ]
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: 'Configuration with "compilerOptions.target = esnext" and not very old browsers should fail',
        path: paths.esnext,
        reports: [
            {
                message: `Based on your browser configuration your "compilerOptions.target" should be "ES2016". Current one is "ESNext"`,
                position: { match: '"esnext"' }
            }
        ]
    },
    {
        browserslist: ['IE 8', 'Edge 15', 'Chrome 63'],
        name: 'Configuration with no "compilerOptions.target" and old browsers should pass',
        path: paths['no-target']
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: `Configuration with no "compilerOptions.target" and modern browsers shouldn't pass`,
        path: paths['no-target'],
        reports: [
            {
                message: `Based on your browser configuration your "compilerOptions.target" should be "ES2016". Current one is "ES3"`,
                position: { match: 'compilerOptions' }
            }]
    },
    {
        browserslist: ['IE 8', 'Edge 15', 'Chrome 63'],
        name: 'Configuration with no "compilerOptions.target" in extended file and old browsers should pass',
        path: paths['no-target-extends']
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: `Configuration with no "compilerOptions.target" in extended file and modern browsers shouldn't pass`,
        path: paths['no-target-extends'],
        reports: [
            {
                message: `Based on your browser configuration your "compilerOptions.target" should be "ES2016". Current one is "ES3"`,
                position: { match: 'compilerOptions' }
            }]
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: `Configuration with "compilerOptions.target" in extended file and modern browsers shouldn't pass`,
        path: paths['no-target-extends-target'],
        reports: [
            {
                message: `Based on your browser configuration your "compilerOptions.target" should be "ES2016". Current one is "ES3"`,
                position: { match: '"../es3/tsconfig.json"' }
            }]
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: `Configuration with extends pointing to ES2016 and modern browsers should pass`,
        path: paths.extends
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: `Configuration with extends pointing to ES2016 and target es3 should fail`,
        path: paths['extends-overrides'],
        reports: [
            {
                message: `Based on your browser configuration your "compilerOptions.target" should be "ES2016". Current one is "ES3"`,
                position: { match: '"es3"' }
            }
        ]
    },
    {
        browserslist: ['IE 8', 'Edge 15', 'Chrome 63'],
        name: `Configuration with extends pointing to ES2016 and old browsers should fail`,
        path: paths.extends,
        reports: [
            {
                message: `Based on your browser configuration your "compilerOptions.target" should be "ES3". Current one is "ES2016"`,
                position: { match: '"../es2016/tsconfig.json"' }
            }
        ]
    }
];

tests.forEach((info: TestWithBrowserInfo) => {
    const test: HintLocalTest = {
        name: info.name,
        path: info.path,
        reports: info.reports
    };

    testLocalHint(hintPath, [test], {
        browserslist: info.browserslist,
        parsers: ['typescript-config']
    });
});
