/**
 * @fileoverview Hint to validate if the CSS features of the project are not broadly supported
 */

import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { StyleParse } from '@hint/parser-css/dist/src/types';
import { forEach } from 'lodash';
import { CompatApi, userBrowsers, CompatCSS } from './helpers';
import { MDNTreeFilteredByBrowsers, BrowserSupportCollection } from './types';
import { SupportBlock } from './types-mdn.temp';
import { browserVersions } from './helpers/normalize-version';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.interoperability,
            description: `Hint to validate if the CSS features of the project are not broadly supported`
        },
        id: 'compat-api-css-next',
        schema: [],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {
        const mdnBrowsersCollection = userBrowsers.convert(context.targetedBrowsers);
        const isCheckingNotBroadlySupported = true;
        const compatApi = new CompatApi('css', mdnBrowsersCollection, isCheckingNotBroadlySupported);
        const userPrefixes: any = {};

        const addUserUsedPrefixes = (browserName: string, featureName: string): void => {
            userPrefixes[browserName + featureName] = true;
        };

        const checkUserUsedPrefixes = (browserName: string, featureName: string): boolean => {
            return userPrefixes[browserName + featureName];
        };

        const checkNotBroadlySupportedFeature = (keyName: string, name: string, data: MDNTreeFilteredByBrowsers, browsersToSupport: BrowserSupportCollection, resource: string, children?: string): void => {
            const key: any = data[keyName];
            let [prefix, featureName] = compatApi.getPrefix(name);

            if (!key || !featureName) {
                debug('Error: The keyname does not exist.');

                return;
            }

            let feature = key[featureName];

            // If feature is not in the filtered by browser data, that means that is not new.
            if (!feature) {
                return;
            }

            if (children) {
                [prefix, featureName] = compatApi.getPrefix(children);
                feature = feature[featureName];

                if (!feature) {
                    return;
                }
            }

            // If feature does not have compat data, we ignore it.
            const featureInfo = feature.__compat;

            if (!featureInfo) {
                return;
            }

            // Check for each browser the support block
            const supportBlock: SupportBlock = featureInfo.support;

            forEach(supportBlock, (browserInfo, browserToSupportName) => {
                if (!Object.keys(browsersToSupport).some((browser) => {
                    return browser === browserToSupportName;
                })) {
                    return;
                }

                const browserFeatureSupported = compatApi.getSupportStatementFromInfo(browserInfo, prefix);

                // If we dont have information about the compatibility, its an error.
                if (!browserFeatureSupported) {
                    let wasSupportedInSometime = false;

                    forEach(browsersToSupport, (versions, browserName) => {
                        if (browserName !== browserToSupportName) {
                            return;
                        }

                        wasSupportedInSometime = true;
                    });

                    if (!wasSupportedInSometime) {
                        context.report(resource, null, `${featureName} of CSS was never added on any of your browsers to support.`, featureName);
                    }

                    return;
                }

                const addedVersion = browserFeatureSupported.version_added;

                // If there added version is exactly true, always supported
                if (addedVersion === true) {
                    return;
                }

                // Not a common case, but if added version does not exist, was not added.
                if (!addedVersion) {
                    context.report(resource, null, `${featureName} of CSS is not added on ${browserToSupportName} browser.`, featureName);

                    return;
                }

                // If the version is smaller than the browser supported, should fail
                const addedVersionNumber = browserVersions.normalize(addedVersion);
                const notSupportedVersions: string[] = [];

                forEach(browsersToSupport, (versions, browserName) => {
                    if (browserName !== browserToSupportName) {
                        return;
                    }

                    // If user used prefixes we should not check for more errors
                    if (!prefix && checkUserUsedPrefixes(browserName, featureName)) {
                        return;
                    }

                    versions.forEach((version) => {
                        if (version >= addedVersionNumber) {
                            if (prefix) {
                                addUserUsedPrefixes(browserName, featureName);
                            }

                            return;
                        }

                        notSupportedVersions.push(`${browserName} ${browserVersions.deNormalize(version)}`);
                    });
                });

                if (notSupportedVersions.length > 0) {
                    const usedPrefix = prefix ? `prefixed with ${prefix} ` : '';

                    context.report(resource, null, `${featureName} ${usedPrefix ? usedPrefix : ''}is not added on ${notSupportedVersions.join(', ')} browsers.`, featureName);
                }
            });
        };

        const compatCSS = new CompatCSS(checkNotBroadlySupportedFeature);

        const onParseCSS = (styleParse: StyleParse): void => {
            const { resource } = styleParse;

            compatCSS.searchCSSFeatures(compatApi.compatDataApi, mdnBrowsersCollection, styleParse, resource);
        };

        context.on('parse::css::end', onParseCSS);
    }
}
