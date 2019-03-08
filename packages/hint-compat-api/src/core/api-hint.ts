import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, Events } from 'hint/dist/src/lib/types';

import { CompatAPI, userBrowsers } from '../helpers';
import { FeatureInfo, BrowsersInfo, SupportStatementResult, ICompatLibrary } from '../types';
import { SimpleSupportStatement, VersionValue, SupportStatement, CompatStatement, StatusBlock } from '../types-mdn.temp';
import { CompatLibraryFactory } from '../helpers/compat-library-factory';
import { browserVersions } from '../helpers/normalize-version';
import { CompatNamespace } from '../enums';

export abstract class APIHint<T extends Events> implements IHint {
    private compatApi: CompatAPI;
    private compatLibrary: ICompatLibrary;
    private pendingReports: [FeatureInfo, SupportStatementResult][] = [];
    private reports: [FeatureInfo, SupportStatementResult][] = [];

    abstract getFeatureVersionValueToAnalyze(browserFeatureSupport: SimpleSupportStatement, status: StatusBlock): VersionValue;
    abstract isSupportedVersion(browser: BrowsersInfo, feature: FeatureInfo, currentVersion: number, version: number): boolean;
    abstract isVersionValueSupported(version: VersionValue): boolean;
    abstract isVersionValueTestable(version: VersionValue): boolean;
    abstract getDefaultHintOptions(): any;

    public constructor(namespaceName: CompatNamespace, context: HintContext<T>, isCheckingNotBroadlySupported: boolean) {
        const mdnBrowsersCollection = userBrowsers.convert(context.targetedBrowsers);
        const hintOptions = this.prepareHintOptions(context.hintOptions);

        this.compatApi = new CompatAPI(namespaceName, mdnBrowsersCollection, isCheckingNotBroadlySupported, hintOptions.ignore);
        this.compatLibrary = CompatLibraryFactory.create<T>(namespaceName, context, this.compatApi.compatDataApi, this.testFeature.bind(this));

        (context as HintContext<Events>).on('scan::end', () => {
            this.generateReports();
            this.consumeReports();
        });
    }

    private testFeature(feature: FeatureInfo, collection: CompatStatement): boolean {
        if (this.mustPackPendingReports(feature) && this.pendingReports.length > 0) {
            this.generateReports();

            return false;
        }

        // Check for each browser the support block
        const { support, status } = this.compatApi.getFeatureCompatStatement(collection, feature);

        const browsersToSupport = Object.entries(support).filter(([browserName]: [string, SupportStatement]): boolean => {
            return this.compatApi.isBrowserIncludedInCollection(browserName);
        });

        const groupedSupportByBrowser = browsersToSupport.reduce((group, [name, supportStatement]) => {
            const browserInfo: BrowsersInfo = { name, supportStatement };
            const browserSupport = this.getSupportStatementByBrowser(browserInfo, feature, status);

            if (!browserSupport) {
                return group;
            }

            return { ...group, [name]: browserSupport };
        }, {});

        const supportStatementResult: SupportStatementResult = {
            browsersToSupportCount: browsersToSupport.length,
            notSupportedBrowsers: groupedSupportByBrowser,
            notSupportedBrowsersCount: Object.keys(groupedSupportByBrowser).length
        };

        const hasIncompatibleBrowsers = supportStatementResult.notSupportedBrowsersCount > 0;

        if (hasIncompatibleBrowsers) {
            this.pendingReports.push([feature, supportStatementResult]);
        } else {
            const index = this.pendingReports.findIndex(([reportFeature]: [FeatureInfo, SupportStatementResult]) => {
                return !!reportFeature.prefix && reportFeature.name === feature.name;
            });

            if (index !== -1) {
                this.pendingReports.splice(index, 1);
            }
        }

        return !hasIncompatibleBrowsers;
    }

    private getSupportStatementByBrowser(browser: BrowsersInfo, feature: FeatureInfo, status: StatusBlock): string[] | null {
        const prefix = feature.subFeature ? feature.subFeature.prefix : feature.prefix;
        const browserFeature = this.compatApi.getSupportStatementFromInfo(browser.supportStatement, prefix);

        if (!browserFeature) {
            return null;
        }

        return this.getBrowserSupport(browser, feature, browserFeature, status);
    }

    /**
     * @method getBrowserSupport
     * Examples:
     * This feature is supported. Output: null.
     * This feature is not supported at all. Output: [].
     * This feature is not supported by these browser versions. Output: ['chrome 67', 'chrome 68', 'chrome 69'].
     */

    private getBrowserSupport(browser: BrowsersInfo, feature: FeatureInfo, browserFeatureSupport: SimpleSupportStatement, status: StatusBlock): string[] | null {
        const version = this.getFeatureVersionValueToAnalyze(browserFeatureSupport, status);

        if (!this.isVersionValueTestable(version)) {
            return null;
        }

        return this.isVersionValueSupported(version) ?
            this.getNotSupportedBrowserVersions(browser, feature, version as string) : [];
    }

    private getNotSupportedBrowserVersions(browser: BrowsersInfo, feature: FeatureInfo, version: string): string[] | null {
        const notSupportedVersions = this.getNotSupportedVersions(browser, feature, version);

        if (notSupportedVersions.length === 0) {
            return null;
        }

        return this.formatNotSupportedVersions(browser.name, notSupportedVersions);
    }

    private getNotSupportedVersions(browser: BrowsersInfo, feature: FeatureInfo, version: string): number[] {
        const versions = this.compatApi.getBrowserVersions(browser.name);
        const currentVersion = browserVersions.normalize(version);

        return versions.filter((version: number) => {
            return !this.isSupportedVersion(browser, feature, currentVersion, version);
        });
    }

    private formatNotSupportedVersions(browserName: string, versions: number[]): string[] {
        return versions.map((version: number) => {
            return `${browserName} ${browserVersions.deNormalize(version)}`;
        });
    }

    private generateReportErrorMessage(feature: FeatureInfo, supportStatementResult: SupportStatementResult): string {
        const { notSupportedBrowsers, browsersToSupportCount, notSupportedBrowsersCount } = supportStatementResult;
        const isNotSupportedInAnyTargetBrowser = notSupportedBrowsersCount > 1 && notSupportedBrowsersCount === browsersToSupportCount;
        const resolveFeature = feature.subFeature || feature;

        return isNotSupportedInAnyTargetBrowser ?
            this.getNotSupportedBrowserMessage(resolveFeature) :
            this.getNotSupportedMessage(resolveFeature, notSupportedBrowsers);
    }

    private getNotSupportedMessage(feature: FeatureInfo, groupedBrowserSupport: {[browserName: string]: string[]}): string {
        const stringifiedBrowserInfo = this.stringifyBrowserInfo(groupedBrowserSupport);
        const usedPrefix = feature.prefix ? ` prefixed with ${feature.prefix}` : '';

        return this.getNotSupportedFeatureMessage(feature.displayableName + usedPrefix, stringifiedBrowserInfo);
    }

    private stringifyBrowserInfo(groupedSupportByBrowser: { [browserName: string]: string[] }) {
        return Object.entries(groupedSupportByBrowser)
            .map(([browserName, browserVersions]: [string, string[]]) => {
                return browserVersions.length === 0 ?
                    [browserName] :
                    this.compatApi.groupNotSupportedVersions(browserVersions);
            })
            .join(', ');
    }

    private getNotSupportedBrowserMessage(feature: FeatureInfo): string {
        return `${feature.displayableName} is not supported by any of your target browsers.`;
    }

    private getNotSupportedFeatureMessage(featureName: string, browserList: string): string {
        return `${featureName} is not supported by ${browserList}.`;
    }

    private generateReports(): void {
        const reports = this.pendingReports.filter(([feature]) => {
            return !this.hasFallback(feature);
        });

        this.reports = this.reports.concat(reports);

        this.pendingReports = [];
    }

    private consumeReports() {
        while (this.reports.length > 0) {
            const [feature, supportStatementResult] = this.reports.shift() as [FeatureInfo, SupportStatementResult];
            const message = this.generateReportErrorMessage(feature, supportStatementResult);

            this.compatLibrary.reportError(feature, message);
        }
    }

    private hasFallback(feature: FeatureInfo): boolean {
        if (!feature.prefix) {
            return false;
        }

        return this.pendingReports.some(([nextFeature]) => {
            if (nextFeature === feature) {
                return false;
            }

            return !nextFeature.prefix &&
                nextFeature.name === feature.name;
        });
    }

    private mustPackPendingReports(feature: FeatureInfo) {
        return feature.name.startsWith('.');
    }

    private prepareHintOptions(options: any): any {
        const defaultHintOptions = this.getDefaultHintOptions();
        const mergedOptions = Object.assign({}, defaultHintOptions, options);

        if (Array.isArray(mergedOptions.enable) && mergedOptions.enable.length > 0) {
            mergedOptions.ignore = mergedOptions.ignore.filter((featureName: string) => {
                return !mergedOptions.enable.includes(featureName);
            });
        }

        return mergedOptions;
    }
}
