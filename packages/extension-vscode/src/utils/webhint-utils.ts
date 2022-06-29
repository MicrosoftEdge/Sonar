import * as fs from 'fs';

import { hasFile } from './fs';
import type { HintConfig, HintSeverity, UserConfig as WebhintUserConfig } from '@hint/utils';

export class WebhintConfiguratorParser {

    private userConfig: WebhintUserConfig = {};
    private configFilePath: string | undefined;

    public async initialize(path: string): Promise<WebhintUserConfig | null> {
        this.configFilePath = path;
        const fileExists = await hasFile(this.configFilePath);

        if (!fileExists) {
            // .hintrc does not exists so create one with the default config
            const defaultConfig = { extends: ['development'] };

            await fs.promises.writeFile(this.configFilePath, JSON.stringify(defaultConfig), 'utf-8');
        }

        // user config file is guaranteed to exist at this point, now read it.
        const rawUserConfig = await fs.promises.readFile(this.configFilePath, 'utf-8');

        this.userConfig = JSON.parse(rawUserConfig.toString());

        return this.userConfig;
    }

    public async addAxeRuleToIgnoredHintsConfig(hintName: string, ruleName: string): Promise<void> {
        if (!this.isInitialized() || (!hintName || !ruleName)) {
            return;
        }

        if (!this.userConfig.hints) {
            this.userConfig.hints = {};
        }

        // TODO: support array syntax
        if (Array.isArray(this.userConfig.hints)) {
            throw new Error('Cannot alter hints collection written as an array');
        }

        const hint = this.userConfig.hints[hintName];
        let config: [HintSeverity, any] = ['default', {}];

        if (typeof hint === 'string' || typeof hint === 'number') {
            config[0] = hint;
        } else if (Array.isArray(hint)) {
            config[0] = hint[0];
            config[1] = hint[1] || {};
        }

        const rulesConfig = config[1];

        if (Array.isArray(rulesConfig)) {
            throw new Error('Cannot alter axe-core rules collection written as an array');
        }

        rulesConfig[ruleName as keyof typeof rulesConfig] = 'off';

        this.userConfig.hints[hintName] = config;

        await this.saveConfiguration();
    }

    public async addFeatureToIgnoredHintsConfig(hintName: string, featureName: string): Promise<void> {
        if (!this.isInitialized() || (!hintName || !featureName)) {
            return;
        }

        if (!this.userConfig.hints) {
            this.userConfig.hints = {};
        }

        // TODO: support array syntax
        if (Array.isArray(this.userConfig.hints)) {
            throw new Error('Cannot alter hints collection written as an array');
        }

        const hint = this.userConfig.hints[hintName];
        const ignore = { ignore: [featureName] };
        const defaultObject: HintConfig = ['default', ignore];

        if (hint) {
            // hint value is a configuration array e.g "hints": { "compat-api/css": [] }
            if (Array.isArray(hint)) {
                /*
                 * search for the 'ignore' key inside each item, start from position [1] (zero-index based)
                 * as position [0] should always be a severity.
                 */
                for (let i = 1; i < hint.length; i++) {
                    const ignoreProperty = hint[i].ignore;

                    if (ignoreProperty && Array.isArray(ignoreProperty)) {

                        // a list of ignored features was found, use that one.
                        ignore.ignore = ignoreProperty as [];
                        defaultObject[0] = hint[i - 1];
                        ignore.ignore.push(featureName);
                        break;
                    }
                }
            } else if (typeof hint === 'string') {
                defaultObject[0] = hint;
            }
        }

        this.userConfig.hints[hintName] = defaultObject;

        await this.saveConfiguration();
    }

    public isInitialized() {
        return !!this.userConfig;
    }

    private async saveConfiguration() {
        // TODO: preserve original formatting
        const result = JSON.stringify(this.userConfig, null, 2);

        if (this.configFilePath) {
            await fs.promises.writeFile(this.configFilePath, result, 'utf-8');
        }
    }

    private async ignoreHint(hintName: string | undefined) {
        if (!this.userConfig || !hintName) {
            return;
        }

        // TODO: support array syntax
        if (Array.isArray(this.userConfig.hints)) {
            throw new Error('Cannot alter hints collection written as an array.');
        }

        if (!this.userConfig.hints) {
            this.userConfig.hints = {};
        }

        this.userConfig.hints[hintName] = 'off';

        await this.saveConfiguration();
    }

    public async ignoreHintPerProject(hintName: string): Promise<void> {
        if (!this.configFilePath) {
            return;
        }

        await this.ignoreHint(hintName);
    }
}
