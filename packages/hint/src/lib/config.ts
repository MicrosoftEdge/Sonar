/**
 * @fileoverview Loads the configuration file
 *
 * Based on ESLint's config-file
 * https://github.com/eslint/eslint/blob/master/lib/config/config-file.js
 */

/* eslint no-use-before-define: 0 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import browserslist = require('browserslist'); // `require` used because `browserslist` exports a function
import { mergeWith } from 'lodash';

import { UserConfig, IgnoredUrl, CLIOptions, ConnectorConfig, HintsConfigObject, HintSeverity } from './types';
import { debug as d } from './utils/debug';
import isFile from './utils/fs/is-file';
import loadJSFile from './utils/fs/load-js-file';
import loadJSONFile from './utils/fs/load-json-file';
import { validateConfig } from './config/config-validator';
import normalizeHints from './config/normalize-hints';
import { validate as validateHint, getSeverity } from './config/config-hints';
import * as logger from './utils/logging';
import * as resourceLoader from './utils/resource-loader';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Private
 * ------------------------------------------------------------------------------
 */

const CONFIG_FILES = [
    '.hintrc',
    '.hintrc.js',
    '.hintrc.json',
    'package.json'
];

/** Loads a configuration from a package.json file. */
const loadPackageJSONConfigFile = (filePath: string): UserConfig => {

    debug(`Loading package.json config file: ${filePath}`);

    try {
        return loadJSONFile(filePath).hintConfig || null;
    } catch (e) {
        debug(`Error reading package.json file: ${filePath}`);
        e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
        throw e;
    }
};

// ------------------------------------------------------------------------

/**
 * Calculates the final configuration taking into account any `extends` fields.
 * Configurations for `extends` are applied left to right.
 *
 */
const composeConfig = (userConfig: UserConfig, parentConfig = '') => {
    /*
     * If an `extends` property is defined, it represents a configuration package to use as
     * a "parent". Load the configuration and merge recursively.
     */

    debug('Composing configuration from extends');

    if (!userConfig.extends || !Array.isArray(userConfig.extends) || userConfig.extends.length === 0) {
        return userConfig;
    }

    const configurations = userConfig.extends.map((config) => {
        const loadedConfiguration = resourceLoader.loadConfiguration(config, [parentConfig]);

        if (!validateConfig(loadedConfiguration)) {
            throw new Error(`Configuration package "${config}" is not valid`);
        }

        return composeConfig(loadedConfiguration, config);
    });

    const finalConfig: UserConfig = mergeWith({}, ...configurations, userConfig, (objValue: any, srcValue: any) => {
        // Arrays need to be concatented, not merged.
        if (Array.isArray(objValue) && Array.isArray(srcValue)) {
            return objValue.concat(srcValue);
        }

        return void 0;
    });

    // The formatters defined by the user has to overwritte the one in the extends.
    finalConfig.formatters = userConfig.formatters ? userConfig.formatters : finalConfig.formatters;

    // Otherwise the output could be double or we could trigger double events
    if (finalConfig.parsers) {
        finalConfig.parsers = Array.from(new Set(finalConfig.parsers));
    }

    return finalConfig;
};

const loadIgnoredUrls = (userConfig: UserConfig): Map<string, RegExp[]> => {
    debug('Initializing ignored urls');

    const ignoredUrls: Map<string, RegExp[]> = new Map();

    if (userConfig.ignoredUrls) {
        userConfig.ignoredUrls.forEach((ignoredUrl: IgnoredUrl) => {
            const { domain: urlRegexString, hints } = ignoredUrl;

            hints.forEach((hint: string) => {
                const hintName = hint === '*' ? 'all' : hint;

                const urlsInHint: RegExp[] | undefined = ignoredUrls.get(hintName);
                const urlRegex: RegExp = new RegExp(urlRegexString, 'i');

                if (!urlsInHint) {
                    ignoredUrls.set(hintName, [urlRegex]);
                } else {
                    urlsInHint.push(urlRegex);
                }
            });
        });
    }

    return ignoredUrls;
};

/**
 * Build and return a hints config object where the key is the hint name and the value is the severity
 */
const buildHintsConfigFromHintNames = (hintNames: string[], severity: HintSeverity): HintsConfigObject => {
    const hintConfig: HintsConfigObject = {};

    for (const hintName of hintNames) {
        hintConfig[hintName] = severity;
    }

    return hintConfig;
};

/**
 * Overrides the config values with values obtained from the CLI, if any
 */
const updateConfigWithCommandLineValues = (config: UserConfig, actions?: CLIOptions) => {
    debug('overriding config settings with values provided via CLI');

    // If formatters are provided, use them
    if (actions && actions.formatters) {
        config.formatters = actions.formatters.split(',');
        debug(`Using formatters option provided from command line: ${actions.formatters}`);
    }

    // If hints are provided, use them
    if (actions && actions.hints) {
        const hintNames = actions.hints.split(',');

        config.hints = buildHintsConfigFromHintNames(hintNames, 'error');
        debug(`Using hints option provided from command line: ${actions.hints}`);
    }
};

export class Configuration {
    public readonly browserslist: string[];
    public readonly connector: ConnectorConfig | undefined;
    public readonly formatters: string[] | undefined;
    public readonly ignoredUrls: Map<string, RegExp[]>;
    public readonly parsers: string[] | undefined;
    public readonly hints: HintsConfigObject;
    public readonly hintsTimeout: number;
    public readonly extends: string[] | undefined;

    private constructor(userConfig: UserConfig, browsers: string[], ignoredUrls: Map<string, RegExp[]>, hints: HintsConfigObject) {
        this.browserslist = browsers;
        this.formatters = userConfig.formatters;
        this.ignoredUrls = ignoredUrls;
        this.parsers = userConfig.parsers;
        this.hints = hints;
        this.extends = userConfig.extends;

        this.hintsTimeout = userConfig.hintsTimeout || 60000;

        if (typeof userConfig.connector === 'string') {
            this.connector = {
                name: userConfig.connector,
                options: {}
            };
        } else {
            this.connector = userConfig.connector;
        }
    }

    /**
     * Removes all the deactivated hints.
     */
    private static cleanHints(hints: HintsConfigObject): HintsConfigObject {
        return Object.entries(hints).reduce((total, [key, value]) => {
            if (getSeverity(value)) {
                total[key] = value;
            }

            return total;
        }, {} as HintsConfigObject);
    }

    /**
     * @deprecated
     * Generates the list of browsers to target using the `browserslist` property
     * of the `hint` configuration or `package.json` or uses the default one
     */
    public static loadBrowsersList(config: UserConfig) {
        logger.warn('`Configuration.loadBrowsersList` is deprecated. Use `Configuration.fromConfig` instead.');

        const directory: string = process.cwd();
        const files: string[] = CONFIG_FILES.reduce((total, configFile) => {
            const filename: string = path.join(directory, configFile);

            if (isFile(filename)) {
                total.push(filename);
            }

            return total;
        }, [] as string[]);

        if (!config.browserslist) {
            for (let i = 0; i < files.length; i++) {
                const file: string = files[i];
                const tmpConfig: UserConfig | null = Configuration.loadConfigFile(file);

                if (tmpConfig && tmpConfig.browserslist) {
                    config.browserslist = tmpConfig.browserslist;
                    break;
                }

                if (file.endsWith('package.json')) {
                    const packagejson = loadJSONFile(file);

                    config.browserslist = packagejson.browserslist;
                }
            }
        }

        if (!config.browserslist || config.browserslist.length === 0) {
            return browserslist();
        }

        return browserslist(config.browserslist);
    }

    /**
     * Loads a configuration file regardless of the source. Inspects the file path
     * to determine the correctly way to load the config file.
     */
    public static loadConfigFile(filePath: string): UserConfig | null {
        let config: UserConfig | null;

        switch (path.extname(filePath)) {
            case '':
            case '.json':
                if (path.basename(filePath) === 'package.json') {
                    config = loadPackageJSONConfigFile(filePath);
                } else {
                    config = loadJSONFile(filePath);
                }
                break;
            case '.js':
                config = loadJSFile(filePath);
                break;

            default:
                config = null;
        }

        config = this.toAbsolutePaths(config, filePath);

        return config;
    }

    /**
     * Transforms any relative paths in the configuration to absolute using
     * the value of `configPath`. `configPath` needs to be a folder.
     * The values that can be changed are:
     * * `connector`'s value: `{ "connector": "./myconnector" }`
     * * `connector.name` value: `{ "connector": { "name": "./myconnector"} }`
     * * `formatter`s and `parser`s  values: `{ "formatters": ["./myformatter"] }`
     * * `hint`s keys: `{ "hints: { "./myhint": "warning" } }`
     */
    public static toAbsolutePaths(config: UserConfig | null, configRoot: string): UserConfig | null {
        if (!config) {
            return null;
        }

        /*
         * We could receive a path to a folder or a file. `dirname` will return different
         * things depending on that. E.g.:
         * * `path.dirname('/config/folder')` will return `/config` and we want `/config/folder`
         * * `path.dirname('/config/folder/file')` will return `/config/folder`
         *
         * This is no good if we want to resolve relatively because we will get incorrect
         * paths. To solve this we have to know if what we are receiving is a file or a
         * folder and adjust accordingly.
         */
        const stat = fs.statSync(configRoot); //eslint-disable-line
        const configPath = stat.isDirectory() ? configRoot : path.dirname(configRoot);

        if (!configPath) {
            return config;
        }

        /**
         * If `value` is a relative path (i.e. it starts with `.`), it transforms it
         * to an absolute path using the `configRoot` folder as the origin to `resolve`.
         */
        const resolve = (value: string): string => {
            if (!value.startsWith('.')) {
                return value;
            }

            return path.resolve(configPath, value);
        };

        // Update the connector value
        if (config.connector) {
            if (typeof config.connector === 'string') {
                config.connector = resolve(config.connector);
            } else {
                config.connector.name = resolve(config.connector.name);
            }
        }

        // Update extends
        if (config.extends) {
            config.extends = config.extends.map(resolve);
        }

        // Update formatters
        if (config.formatters) {
            config.formatters = config.formatters.map(resolve);
        }

        // Update parsers
        if (config.parsers) {
            config.parsers = config.parsers.map(resolve);
        }

        // Update hints
        if (config.hints) {
            const hints = Object.keys(config.hints);

            const transformedHints = hints.reduce((newHints, currentHint) => {
                const newHint = resolve(currentHint);

                newHints[newHint] = (config.hints as HintsConfigObject)[currentHint];

                return newHints;
            }, {} as HintsConfigObject);

            config.hints = transformedHints;
        }

        return config;
    }

    public static fromConfig(config: UserConfig | null, actions?: CLIOptions): Configuration {

        if (!config) {
            throw new Error(`Couldn't find a configuration file`);
        }

        if (!validateConfig(config)) {
            throw new Error(`Couldn't find any valid configuration`);
        }

        // 3, 4
        const userConfig = composeConfig(config);

        if (typeof userConfig.connector === 'string') {
            userConfig.connector = {
                name: userConfig.connector,
                options: {}
            };
        }

        // In case the user uses the --watch flag when running hint
        if (actions && actions.watch && userConfig.connector && userConfig.connector.options) {
            userConfig.connector.options.watch = actions.watch;
        }

        updateConfigWithCommandLineValues(userConfig, actions);

        if (userConfig.formatters && !Array.isArray(userConfig.formatters)) {
            userConfig.formatters = [userConfig.formatters];
        }

        const browsers = browserslist(config.browserslist);
        const ignoredUrls = loadIgnoredUrls(userConfig);
        const hints = Configuration.cleanHints(normalizeHints(userConfig.hints!)); // `userConfig.hints` should not be `null` due to `validateConfig` check above

        return new Configuration(userConfig, browsers, ignoredUrls, hints);
    }

    /**
     * Separate hints based on if the hint configs are valid.
     * @param config
     */
    public static validateHintsConfig(config: Configuration) {
        const hints = Object.keys(config.hints);
        const validateResult = hints.reduce((result, hint) => {
            const Hint = resourceLoader.loadHint(hint, config.extends);
            const valid: boolean = validateHint(Hint.meta, config.hints[hint], hint);

            if (!valid) {
                result.invalid.push(hint);
            } else {
                result.valid.push(hint);
            }

            return result;
        }, { invalid: [] as string[], valid: [] as string[]});

        return validateResult;
    }

    /**
     * @deprecated
     * Loads a configuration file regardless of the source. Inspects the file path
     * to determine the correctly way to load the config file.
     */
    public static fromFilePath(filePath: string, actions: CLIOptions): Configuration {
        logger.warn('`Configuration.fromFilePath` is deprecated. Use `Configuration.loadConfigFile` with `Configuration.fromConfig` instead.');

        /**
         * 1. Load the file from the HD
         * 2. Validate it's OK
         * 3. Read extends and validate they are OK
         * 4. Apply extends
         * 6. Return final configuration object with defaults if needed
         */

        // 1
        const resolvedPath: string = path.resolve(process.cwd(), filePath);
        const userConfig = Configuration.loadConfigFile(resolvedPath);
        const config = this.fromConfig(userConfig, actions);

        if (userConfig) {
            userConfig.browserslist = userConfig.browserslist || Configuration.loadBrowsersList(userConfig);
        }

        return config;
    }

    /**
     * Retrieves the configuration filename for a given directory. It loops over all
     * of the valid configuration filenames in order to find the first one that exists.
     * If no valid file is found in that directory, it will look into `os.homedir()`.
     */
    public static getFilenameForDirectory = (directory: string): string | null => {

        for (let i = 0, len = CONFIG_FILES.length; i < len; i++) {
            const filename: string = path.join(directory, CONFIG_FILES[i]);

            if (isFile(filename)) {
                return filename;
            }
        }

        const homedir = os.homedir();

        // If we reach this point we've tested in the original directory and homedir
        if (directory === homedir) {
            return null;
        }

        return Configuration.getFilenameForDirectory(homedir);
    };
}
