import { generateHTMLPage, getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';

const tests: HintTest[] = [
    {
        name: `Web app manifest file is not specified, so the hint does not apply and the test should pass`,
        serverConfig: generateHTMLPage('<link rel="stylesheet" href="style.css">')
    },
    {
        name: `Web app manifest file has incorrect file extension`,
        reports: [{ message: `Web app manifest should have the filename extension 'webmanifest', not 'json'.` }],
        serverConfig: generateHTMLPage(`<link rel="manifest" href="site.json">
        <link rel="stylesheet" href="style.css">`)
    },
    {
        name: `Web app manifest file is specified only as '.webmanifest'`,
        reports: [{ message: `Web app manifest should have the filename extension 'webmanifest'.` }],
        serverConfig: generateHTMLPage(`<link rel="manifest" href=".webmanifest">
        <link rel="stylesheet" href="style.css">`)
    },
    {
        name: `Web app manifest file has correct file extension`,
        serverConfig: generateHTMLPage(`<link rel="manifest" href="site.webmanifest">
        <link rel="stylesheet" href="style.css">`)
    },
    {
        name: `Web app manifest file has correct file extension but it has query parameters`,
        serverConfig: generateHTMLPage(`<link rel="manifest" href="site.webmanifest?v=0.1.2">
        <link rel="stylesheet" href="style.css">`)
    },
    {
        name: `Web app manifest file has correct file extension being specified in a path that contains '.'`,
        serverConfig: generateHTMLPage(`<link rel="manifest" href="/.well-known/site.webmanifest">
        <link rel="stylesheet" href="style.css">`)
    },
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    }
];

testHint(getHintPath(__filename), tests, { parsers: ['manifest'] });
