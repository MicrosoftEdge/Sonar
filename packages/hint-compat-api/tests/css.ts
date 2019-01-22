import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import readFile from 'hint/dist/src/lib/utils/fs/read-file';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename, true);

const generateCSSConfig = (fileName: string) => {
    const path = 'fixtures/css';
    const styles = readFile(`${__dirname}/${path}/${fileName}.css`);

    return {
        '/': generateHTMLPage(`<link rel="stylesheet" href="styles/${fileName}">`),
        [`/styles/${fileName}`]: {
            content: styles,
            headers: { 'Content-Type': 'text/css' }
        }
    };
};

/*
 * Tests for css features that were removed / deprecated.
 * More information about how `hintRunner` can be configured is
 * available in:
 * https://webhint.io/docs/contributor-guide/how-to/test-hints/
 */

const neverRemoved: HintTest[] = [
    {
        name: 'Features that were added and never removed should pass.',
        serverConfig: generateCSSConfig('charset')
    }
];

hintRunner.testHint(hintPath, neverRemoved, { browserslist: ['last 2 Chrome versions', 'last 2 Firefox versions', 'last 2 Safari versions'], parsers: ['css']});

const prefixedFeatureNeverRemoved: HintTest[] = [
    {
        name: 'Prefixed features that were never removed should pass.',
        serverConfig: generateCSSConfig('box-lines-prefix-current')
    }
];

hintRunner.testHint(hintPath, prefixedFeatureNeverRemoved, { browserslist: ['safari 3 - 9'], parsers: ['css']});

const featureRemoved: HintTest[] = [
    {
        name: 'Features that were removed in versions before the targeted browsers should fail.',
        reports: [{ message: 'padding-box is not supported by firefox 52.', position: { column: 4, line: 1 }}],
        serverConfig: generateCSSConfig('box-sizing')
    }
];

hintRunner.testHint(hintPath, featureRemoved, { browserslist: ['firefox 52'], parsers: ['css']});

const prefixFeatureRemoved: HintTest[] = [
    {
        name: 'Prefixed features that were removed in versions before the targeted browsers should fail.',
        reports: [{ message: 'box-lines prefixed with -webkit- is not supported by chrome 67-69.', position: { column: 4, line: 1 }}],
        serverConfig: generateCSSConfig('box-lines-prefix-current')
    }
];

hintRunner.testHint(hintPath, prefixFeatureRemoved, { browserslist: ['chrome 65 - 69'], parsers: ['css']});

const removedLaterThanTargetedBrowsers: HintTest[] = [
    {
        name: 'Prefixed features that were removed in a version later to the targeted browsers should pass.',
        serverConfig: generateCSSConfig('keyframes')
    }
];

hintRunner.testHint(hintPath, removedLaterThanTargetedBrowsers, { browserslist: ['opera 13-14'], parsers: ['css']});

const removedInEarlierVersionsAndAddedLater: HintTest[] = [
    {
        name: 'Features removed and re-added to versions earlier than the targeted browsers should pass.',
        serverConfig: generateCSSConfig('animation-duration-prefix')
    }
];

hintRunner.testHint(hintPath, removedInEarlierVersionsAndAddedLater, { browserslist: ['opera 32'], parsers: ['css']});

const removedForBrowser: HintTest[] = [
    {
        name: 'Features that were removed in a version equal to the targeted browser should fail.',
        reports: [
            { message: 'keyframes is not supported by opera 15.', position: { column: 0, line: 0 }},
            { message: 'keyframes is not supported by opera 15.', position: { column: 0, line: 6 }},
            { message: 'keyframes is not supported by opera 15.', position: { column: 0, line: 12 }}
        ],
        serverConfig: generateCSSConfig('keyframes')
    }
];

hintRunner.testHint(hintPath, removedForBrowser, { browserslist: ['opera 15'], parsers: ['css']});

const removedForPrefixEqualToTargetedBrowsers: HintTest[] = [
    {
        name: 'Prefixed features that were removed in a version equal to the targeted browser should fail.',
        reports: [{ message: 'keyframes prefixed with -o- is not supported by opera 15.', position: { column: 0, line: 2 }}],
        serverConfig: generateCSSConfig('keyframes-prefix-obsolete')
    }
];

hintRunner.testHint(hintPath, removedForPrefixEqualToTargetedBrowsers, { browserslist: ['opera 15'], parsers: ['css']});

const removedForPrefixEarlierThanTargetedBrowsers: HintTest[] = [
    {
        name: 'Prefixed features that were removed in a version earlier than the targeted browser should fail.',
        reports: [{ message: 'keyframes prefixed with -o- is not supported by opera 16, opera 18-19.', position: { column: 0, line: 2 }}],
        serverConfig: generateCSSConfig('keyframes-prefix-obsolete')
    }
];

hintRunner.testHint(hintPath, removedForPrefixEarlierThanTargetedBrowsers, { browserslist: ['opera 18-19', 'opera 16'], parsers: ['css']});

const addedForPrefixEqualToTargetedBrowsers: HintTest[] = [
    {
        name: 'Prefixed features that were added in a version equal to the targeted browser should pass.',
        serverConfig: generateCSSConfig('keyframes-prefix-current')
    }
];

hintRunner.testHint(hintPath, addedForPrefixEqualToTargetedBrowsers, { browserslist: ['opera 15'], parsers: ['css']});

const addedForPrefixEarlierThanTargetedBrowsers: HintTest[] = [
    {
        name: 'Prefixed features that were added in a version earlier to the targeted browser should pass.',
        serverConfig: generateCSSConfig('keyframes-prefix-current')
    }
];

hintRunner.testHint(hintPath, addedForPrefixEarlierThanTargetedBrowsers, { browserslist: ['opera 16-19'], parsers: ['css']});

const removedForFlags: HintTest[] = [
    {
        name: 'Features removed from versions requiring flags should pass.',
        serverConfig: generateCSSConfig('supports')
    }
];

hintRunner.testHint(hintPath, removedForFlags, { browserslist: ['firefox 18'], parsers: ['css']});

const prefixedFeaturesThatBecameStandardButStillAreValid: HintTest[] = [
    'backface-visibility-prefix',
    'animation-prefix',
    'transform-prefix'
].map((featureName: string) => {
    return {
        name: `Prefixed feature that became standard before the targeted browser but prefix still is accepted should pass. Feature: ${featureName}`,
        serverConfig: generateCSSConfig(featureName)
    };
});

hintRunner.testHint(hintPath, prefixedFeaturesThatBecameStandardButStillAreValid, { browserslist: ['firefox 15 - 16'], parsers: ['css']});

const prefixedFeatureThatBecameStandardAfterTarget: HintTest[] = [
    {
        name: 'Prefixed features that became standard after the targeted browser should pass.',
        serverConfig: generateCSSConfig('background-size-prefix')
    }
];

hintRunner.testHint(hintPath, prefixedFeatureThatBecameStandardAfterTarget, { browserslist: ['firefox 3.6'], parsers: ['css']});

const prefixedFeaturesThatBecameStandardAndPrefixWasDeprecated: HintTest[] = [
    {
        name: 'Prefixed features that became deprecated before the targeted browser should fail.',
        reports: [{ message: 'background-size prefixed with -moz- is not supported by firefox 4.', position: { column: 4, line: 1 }}],
        serverConfig: generateCSSConfig('background-size-prefix')
    }
];

hintRunner.testHint(hintPath, prefixedFeaturesThatBecameStandardAndPrefixWasDeprecated, { browserslist: ['firefox 3.6 - 4'], parsers: ['css']});

const featureVersionAddedFalse: HintTest[] = [
    {
        name: 'Features that have version added as false should fail.',
        reports: [{ message: 'box-flex is not supported by ie.', position: { column: 4, line: 1}}],
        serverConfig: generateCSSConfig('box-flex')
    }
];

hintRunner.testHint(hintPath, featureVersionAddedFalse, { browserslist: ['ie 11'], parsers: ['css']});

const featureVersionAddedMixedFalseAndNullForDifferentBrowsers: HintTest[] = [
    {
        name: 'Features with unknown support (version added is null) and no support (version added is false) for different browsers should fail for unsupported browsers.',
        reports: [{ message: 'box-lines is not supported by firefox, firefox_android.', position: { column: 4, line: 1}}],
        serverConfig: generateCSSConfig('box-lines')
    }
];

hintRunner.testHint(hintPath, featureVersionAddedMixedFalseAndNullForDifferentBrowsers, { browserslist: ['edge 18', 'firefox 62', 'and_ff 56'], parsers: ['css']});

const mixedFeaturedCompatibility: HintTest[] = [
    {
        name: 'Features with mixed compatibility (version added null vs false) for different browsers should only throw errors for browsers in which the feature has never been added (false).',
        reports: [{ message: 'box-lines is not supported by firefox.', position: { column: 4, line: 1 }}],
        serverConfig: generateCSSConfig('box-lines')
    }
];

hintRunner.testHint(hintPath, mixedFeaturedCompatibility, { browserslist: ['firefox 63', 'edge 18'], parsers: ['css']});

const featureVersionAddedFalseForAllTargetedBrowsers: HintTest[] = [
    {
        name: 'Features with no support (version added is false) for multiple targeted browsers should fail.',
        reports: [{ message: 'box-lines is not supported by any of your target browsers.', position: { column: 4, line: 1}}],
        serverConfig: generateCSSConfig('box-lines')
    }
];

hintRunner.testHint(hintPath, featureVersionAddedFalseForAllTargetedBrowsers, { browserslist: ['firefox 62', 'and_ff 56'], parsers: ['css']});

const notSupportedAndNotDeprecatedFeature: HintTest[] = [
    {
        name: 'Features not supported and not deprecated should pass',
        serverConfig: generateCSSConfig('cursor')
    }
];

hintRunner.testHint(hintPath, notSupportedAndNotDeprecatedFeature, { browserslist: ['android 4.4.3-4.4.4', 'edge 17', 'firefox 60', 'ie 11', 'opera 56'], parsers: ['css']});

const notSupportedFeaturesShouldNotSeparatelyLog: HintTest[] = [
    {
        name: 'Features not supported and not deprecated should not separately log the feature and value.',
        reports: [{ message: 'box-flex is not supported by ie.', position: { column: 4, line: 3 }}],
        serverConfig: generateCSSConfig('box-flex-prefixes')
    }
];

hintRunner.testHint(hintPath, notSupportedFeaturesShouldNotSeparatelyLog, { browserslist: ['ie 10'], parsers: ['css']});
