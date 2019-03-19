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
        '/': generateHTMLPage('<link rel="stylesheet" href="styles">'),
        '/styles': {
            content: styles,
            headers: { 'Content-Type': 'text/css' }
        }
    };
};

/*
 * Tests for css features that are not broadly supported.
 * More information about how `hintRunner` can be configured is
 * available in:
 * https://webhint.io/docs/contributor-guide/how-to/test-hints/
 */

const featureAddedBeforeTargetedBrowsers: HintTest[] = [
    {
        name: 'Features that were added in versions earlier than the targeted browsers should pass.',
        serverConfig: generateCSSConfig('charset')
    }
];

hintRunner.testHint(hintPath, featureAddedBeforeTargetedBrowsers, { browserslist: ['last 2 Chrome versions'], parsers: ['css']});

const prefixedFeatureAddedBeforeTargetedBrowsers: HintTest[] = [
    {
        name: 'Prefixed features that were added in versions earlier than the targeted browsers should pass.',
        serverConfig: generateCSSConfig('keyframes-prefix-current')
    }
];

hintRunner.testHint(hintPath, prefixedFeatureAddedBeforeTargetedBrowsers, { browserslist: ['safari 4-6'], parsers: ['css']});

const childFeatureAddedBeforeTargetedBrowsers: HintTest[] = [
    {
        name: 'Child features that were added in versions earlier than the targeted browsers should pass.',
        serverConfig: generateCSSConfig('display-flex')
    }
];

hintRunner.testHint(hintPath, childFeatureAddedBeforeTargetedBrowsers, { browserslist: ['chrome 30'], parsers: ['css']});

const prefixedChildFeatureAddedBeforeTargetedBrowsers: HintTest[] = [
    {
        name: 'Prefixed child features that were added in versions earlier than the targeted browsers should pass.',
        serverConfig: generateCSSConfig('display-flex-prefix')
    }
];

hintRunner.testHint(hintPath, prefixedChildFeatureAddedBeforeTargetedBrowsers, { browserslist: ['chrome 22'], parsers: ['css']});

const featureAddedSameAsTargetedBrowsers: HintTest[] = [
    {
        name: 'Features that were added the version of the targeted browser should pass.',
        serverConfig: generateCSSConfig('keyframes')
    }
];

hintRunner.testHint(hintPath, featureAddedSameAsTargetedBrowsers, { browserslist: ['chrome 43'], parsers: ['css']});

const childFeatureAddedSameAsTargetedBrowsers: HintTest[] = [
    {
        name: 'Child features that were added the version of the targeted browser should pass.',
        serverConfig: generateCSSConfig('display-flex')
    }
];

hintRunner.testHint(hintPath, childFeatureAddedSameAsTargetedBrowsers, { browserslist: ['chrome 29'], parsers: ['css']});

const childPrefixedFeatureAddedSameAsTargetedBrowsers: HintTest[] = [
    {
        name: 'Child prefixed features that were added the version of the targeted browser should pass.',
        serverConfig: generateCSSConfig('display-flex-prefix')
    }
];

hintRunner.testHint(hintPath, childPrefixedFeatureAddedSameAsTargetedBrowsers, { browserslist: ['chrome 21'], parsers: ['css']});

const featureAddedTrue: HintTest[] = [
    {
        name: 'Features that have version added as true should pass.',
        serverConfig: generateCSSConfig('keyframes')
    }
];

hintRunner.testHint(hintPath, featureAddedTrue, { browserslist: ['edge 13'], parsers: ['css']});

const prefixedFeatureAddedTrue: HintTest[] = [
    {
        name: 'Prefixed features that have version added as true should pass.',
        serverConfig: generateCSSConfig('box-flex-prefix')
    }
];

hintRunner.testHint(hintPath, prefixedFeatureAddedTrue, { browserslist: ['chrome 32', 'chrome 63 - 65'], parsers: ['css']});

const featureVersionAddedNull: HintTest[] = [
    {
        name: 'Features that have version added as null should pass.',
        serverConfig: generateCSSConfig('background-repeat')
    }
];

hintRunner.testHint(hintPath, featureVersionAddedNull, { browserslist: ['and_chr 69'], parsers: ['css']});

const childFeatureVersionAddedNull: HintTest[] = [
    {
        name: 'Features using child properties that have version added as null should pass.',
        serverConfig: generateCSSConfig('text-transform')
    }
];

hintRunner.testHint(hintPath, childFeatureVersionAddedNull, { browserslist: ['chrome 65'], parsers: ['css']});

const featureWithNoCompatInfo: HintTest[] = [
    {
        name: 'Features with no compatibility info should pass.',
        serverConfig: generateCSSConfig('justify-content')
    }
];

hintRunner.testHint(hintPath, featureWithNoCompatInfo, { browserslist: ['chrome 65'], parsers: ['css']});

/*
 * Currently the hint goes two levels deep
 * No errors are thrown when testing features
 * (like space-evenly of justify-content) nested three levels deep
 */
const childOfFeatureWithNoCompatInfoAddedEarlierThan: HintTest[] = [
    {
        name: 'Child features with parents that have no compat info and were added in versions earlier than targeted browsers should pass.',
        serverConfig: generateCSSConfig('justify-content')
    }
];

hintRunner.testHint(hintPath, childOfFeatureWithNoCompatInfoAddedEarlierThan, { browserslist: ['chrome 65'], parsers: ['css']});

const childOfFeatureWithNoCompatInfoAddedLaterThan: HintTest[] = [
    {
        name: 'Child features with parents that have no compat info and were added in versions later than targeted browsers should pass.',
        serverConfig: generateCSSConfig('justify-content')
    }
];

hintRunner.testHint(hintPath, childOfFeatureWithNoCompatInfoAddedLaterThan, { browserslist: ['chrome 58'], parsers: ['css']});

const featureVersionAddedFalse: HintTest[] = [
    {
        name: 'Features that have version added as false should not fail.',
        serverConfig: generateCSSConfig('box-flex')
    }
];

hintRunner.testHint(hintPath, featureVersionAddedFalse, { browserslist: ['ie 11'], parsers: ['css']});

const featureVersionAddedLaterThanTargetedBrowsers: HintTest[] = [
    {
        name: 'Features that were added after the targeted browser should fail.',
        reports: [
            { message: 'keyframes is not supported by chrome 40.', position: { match: '@keyframes name' }},
            { message: 'keyframes is not supported by chrome 40.', position: { match: '@keyframes name2' }},
            { message: 'keyframes is not supported by chrome 40.', position: { match: '@keyframes name3' }}
        ],
        serverConfig: generateCSSConfig('keyframes')
    }
];

hintRunner.testHint(hintPath, featureVersionAddedLaterThanTargetedBrowsers, { browserslist: ['chrome 40'], parsers: ['css']});

const prefixedFeatureVersionAddedLaterThanTargetedBrowsers: HintTest[] = [
    {
        name: 'Prefixed features that were added after the targeted browser should fail.',
        reports: [{ message: 'animation-duration prefixed with -webkit- is not supported by opera 12.', position: { match: '-webkit-animation-duration' }}],
        serverConfig: generateCSSConfig('animation-duration-prefix')
    }
];

hintRunner.testHint(hintPath, prefixedFeatureVersionAddedLaterThanTargetedBrowsers, { browserslist: ['opera 12'], parsers: ['css']});

const prefixedFeaturesThatBecameStandardAndMarkedAsDeprecatedBeforeTarget: HintTest[] = [
    {
        name: 'Prefixed features that became standard before the targeted browser but prefix was deprecated should pass.',
        serverConfig: generateCSSConfig('background-size-prefix')
    }
];

hintRunner.testHint(hintPath, prefixedFeaturesThatBecameStandardAndMarkedAsDeprecatedBeforeTarget, { browserslist: ['firefox 3.6 - 4'], parsers: ['css']});

const prefixedFeaturesThatBecameStandardAndMarkedAsDeprecatedAfterTarget: HintTest[] = [
    {
        name: 'Prefixed features that became standard after the targeted browser but prefix was deprecated should pass.',
        serverConfig: generateCSSConfig('background-size-prefix')
    }
];

hintRunner.testHint(hintPath, prefixedFeaturesThatBecameStandardAndMarkedAsDeprecatedAfterTarget, { browserslist: ['firefox 4'], parsers: ['css']});

const childFeatureAddedLaterThanTargetedBrowsers: HintTest[] = [
    {
        name: 'Child features that were added later than targeted browsers should fail.',
        reports: [{ message: 'flex is not supported by chrome 26-28.', position: { match: 'display: flex;' } }],
        serverConfig: generateCSSConfig('display-flex')
    }
];

hintRunner.testHint(hintPath, childFeatureAddedLaterThanTargetedBrowsers, { browserslist: ['chrome 26 - 29'], parsers: ['css']});

const childPrefixedFeatureAddedLaterThanTargetedBrowsers: HintTest[] = [
    {
        name: 'Child prefixed features that were added later than targeted browsers should fail.',
        reports: [{ message: 'flex prefixed with -webkit- is not supported by chrome 17-19.', position: { match: 'display: -webkit-flex;' } }],
        serverConfig: generateCSSConfig('display-flex-prefix')
    }
];

hintRunner.testHint(hintPath, childPrefixedFeatureAddedLaterThanTargetedBrowsers, { browserslist: ['chrome 17 - 19'], parsers: ['css']});

const notSupportedPropertiesAndValuesShouldNotSeparatelyLog: HintTest[] = [
    {
        name: 'Features not supported and not deprecated should not separately log the feature and value.',
        reports: [{ message: 'appearance is not supported by ie.', position: { match: 'appearance: none; /* Report */' }}],
        serverConfig: generateCSSConfig('appearance')
    }
];

hintRunner.testHint(hintPath, notSupportedPropertiesAndValuesShouldNotSeparatelyLog, { browserslist: ['firefox 60', 'ie 10'], parsers: ['css']});

const notSupportedFeaturesWithoutFallbackShouldSeparatelyLog: HintTest[] = [
    {
        name: 'Features not supported and not deprecated should separately log vendor prefixes if fallback is not defined.',
        reports: [
            { message: 'appearance prefixed with -webkit- is not supported by ie.', position: { match: '-webkit-appearance' }},
            { message: 'appearance prefixed with -moz- is not supported by ie.', position: { match: '-moz-appearance' }}
        ],
        serverConfig: generateCSSConfig('appearance-only-prefixes')
    }
];

hintRunner.testHint(hintPath, notSupportedFeaturesWithoutFallbackShouldSeparatelyLog, { browserslist: ['firefox 60', 'ie 10'], parsers: ['css']});

const notSupportedAndNotDeprecatedFeature: HintTest[] = [
    {
        name: 'Features not supported and not deprecated should fail.',
        reports: [{ message: 'cursor is not supported by webview_android.', position: { match: 'cursor' }}],
        serverConfig: generateCSSConfig('cursor')
    }
];

hintRunner.testHint(hintPath, notSupportedAndNotDeprecatedFeature, {
    browserslist: ['android 4.4.3-4.4.4', 'edge 17', 'firefox 60', 'ie 11', 'opera 56'],
    hintOptions: { enable: ['cursor'] },
    parsers: ['css']
});

const notSupportedFeaturesSplittedByCSSRuleBlock: HintTest[] = [
    {
        name: 'Should handle reports separately by CSS blocks.',
        reports: [
            { message: 'appearance prefixed with -webkit- is not supported by ie.', position: { match: '-webkit-appearance' }},
            { message: 'appearance prefixed with -moz- is not supported by ie.', position: { match: '-moz-appearance' }},
            { message: 'appearance is not supported by ie.', position: { match: 'appearance: none; /* unprefixed */' }}
        ],
        serverConfig: generateCSSConfig('appearance-splitted')
    }
];

hintRunner.testHint(hintPath, notSupportedFeaturesSplittedByCSSRuleBlock, { browserslist: ['firefox 60', 'ie 10'], parsers: ['css']});

const disorderedNotSupportedFeatures: HintTest[] = [
    {
        name: 'Should handle disordered vendor prefixes',
        reports: [{ message: 'appearance is not supported by ie.', position: { match: 'appearance' }}],
        serverConfig: generateCSSConfig('appearance-disordered-prefixes')
    }
];

hintRunner.testHint(hintPath, disorderedNotSupportedFeatures, { browserslist: ['firefox 60', 'ie 10'], parsers: ['css']});

/*
 * IGNORE HINT OPTION
 */

const defaultIgnoredFeaturesShouldNotFail: HintTest[] = [
    {
        name: 'Ignored features by default should pass.',
        serverConfig: generateCSSConfig('cursor')
    }
];

hintRunner.testHint(hintPath, defaultIgnoredFeaturesShouldNotFail, {
    browserslist: ['android 4.4.3-4.4.4'],
    parsers: ['css']
});

const supportIgnoredIfNotSupported: HintTest[] = [
    {
        name: `If browser doesn't support @support, it should ignore the @support block`,
        serverConfig: generateCSSConfig('support-flex')
    }
];

hintRunner.testHint(hintPath, supportIgnoredIfNotSupported, {
    browserslist: ['IE 9'],
    parsers: ['css']
});

const supportSupportedButNotFeature: HintTest[] = [
    {
        name: `If browser supports @support, but not the feature, it should ignore the @support block`,
        serverConfig: generateCSSConfig('support-flex')
    }
];

hintRunner.testHint(hintPath, supportSupportedButNotFeature, {
    browserslist: ['Chrome 28'],
    parsers: ['css']
});

const supportAndFeatureSupported: HintTest[] = [
    {
        name: `If browser supports @support and the feature, it shouldn't ignore the @support block`,
        reports: [{ message: 'grid is not supported by chrome 29.', position: { column: 8, line: 2 }}],
        serverConfig: generateCSSConfig('support-flex')
    }
];

hintRunner.testHint(hintPath, supportAndFeatureSupported, {
    browserslist: ['Chrome 29'],
    parsers: ['css']
});
