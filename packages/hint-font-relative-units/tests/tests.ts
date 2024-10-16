import { test, fs } from '@hint/utils';
import { HintTest, testHint } from '@hint/utils-tests-helpers';

const { generateHTMLPage, getHintPath } = test;
const { readFile } = fs;
const hintPath = getHintPath(__filename, true);

const generateConfig = (fileName: string) => {
    if (fileName.endsWith('.html')) {
        return readFile(`${__dirname}/fixtures/${fileName}`);
    }

    if (fileName.endsWith('.scss')) {
        const styles = readFile(`${__dirname}/fixtures/${fileName}`);

        return {
            '/': generateHTMLPage(`<link rel="stylesheet" href="styles/${fileName}">`),
            [`/styles/${fileName}`]: {
                content: styles,
                headers: { 'Content-Type': 'text/x-scss' }
            }
        };
    }

    const styles = readFile(`${__dirname}/fixtures/${fileName}.css`);

    return {
        '/': generateHTMLPage(`<link rel="stylesheet" href="styles/${fileName}">`),
        [`/styles/${fileName}`]: {
            content: styles,
            headers: { 'Content-Type': 'text/css' }
        }
    };
};

const tests: HintTest[] = [
    {
        name: 'Test all properties in a single selector',
        reports: [
            {
                message: 'font-size should be defined with relative units instead of pixels.',
                position: { match: 'font-size: 16px;' }
            },
            {
                message: 'line-height should be defined with relative units instead of pixels.',
                position: { match: 'line-height: 24px;' }
            },
            {
                message: 'letter-spacing should be defined with relative units instead of pixels.',
                position: { match: 'letter-spacing: 2px;' }
            }
        ],
        serverConfig: generateConfig('all-properties')
    },
    {
        name: 'Test all properties in multi-level selectors',
        reports: [
            {
                message: 'font-size should be defined with relative units instead of pixels.',
                position: { match: 'font-size: 16px;' }
            },
            {
                message: 'line-height should be defined with relative units instead of pixels.',
                position: { match: 'line-height: 30px;' }
            },
            {
                message: 'letter-spacing should be defined with relative units instead of pixels.',
                position: { match: 'letter-spacing: 2px;' }
            }
        ],
        serverConfig: generateConfig('multi-level')
    },
    {
        name: 'Single line css',
        reports: [
            {
                message: 'font-size should be defined with relative units instead of pixels.',
                position: { match: 'font-size: 16px;' }
            }
        ],
        serverConfig: generateConfig('same-line')
    },
    {
        name: 'Style block in <head>',
        reports: [
            {
                message: 'font-size should be defined with relative units instead of pixels.',
                position: { match: 'font-size: 16px;' }
            },
            {
                message: 'line-height should be defined with relative units instead of pixels.',
                position: { match: 'line-height: 24px;' }
            },
            {
                message: 'letter-spacing should be defined with relative units instead of pixels.',
                position: { match: 'letter-spacing: 2px;' }
            }
        ],
        serverConfig: generateConfig('style-tag.html')
    },
    {
        name: 'Sass stylesheet',
        reports: [
            {
                message: 'font-size should be defined with relative units instead of pixels.',
                position: { match: 'font-size: 13px;' }
            },
            {
                message: 'letter-spacing should be defined with relative units instead of pixels.',
                position: { match: 'letter-spacing: 0.5px;' }
            },
            {
                message: 'font-size should be defined with relative units instead of pixels.',
                position: { match: 'font-size: 17px;' }
            },
            {
                message: 'line-height should be defined with relative units instead of pixels.',
                position: { match: 'line-height: 14px;' }
            }
        ],
        serverConfig: generateConfig('sass.scss')
    }
];

testHint(hintPath, tests, { parsers: ['css', 'sass'] });
