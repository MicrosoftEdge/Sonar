/**
 * @fileoverview A hint formatter that outputs the issues in a HTML file..
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as path from 'path';

import * as ejs from 'ejs';
import * as fs from 'fs-extra';

import { cwd, Category, logger } from '@hint/utils';
import { debug as d } from '@hint/utils-debug';
import { FormatterOptions, HintResources, IFormatter, Problem } from 'hint';

const utils = require('./utils');

import AnalysisResult, { CategoryResult, HintResult } from './result';
import { getMessage as getMessageFormatter, MessageName } from './i18n.import';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Utils
 * ------------------------------------------------------------------------------
 */
/* istanbul ignore next */
const getCategoryListFromResources = (resources: HintResources) => {
    const categoriesArray: string[] = resources.hints.map((hint) => {
        if (hint.meta.docs && hint.meta.docs.category) {
            return hint.meta.docs.category;
        }

        return Category.other;
    });

    // Clean duplicated values.
    const categories: Set<string> = new Set(categoriesArray);

    return Array.from(categories);
};

const getCategoryList = (resources?: HintResources): string[] => {
    /* istanbul ignore if */
    if (resources) {
        return getCategoryListFromResources(resources);
    }

    const result: string[] = [];

    for (const [, value] of Object.entries(Category)) {
        result.push(value);
    }

    return result;
};

const getLanguageFile = (language: string = 'en') => {
    const relativePath = path.join('js', 'scan', '_locales');
    const languagesToCheck = [language];
    const languageParts = language.split('-');

    /*
     * Add to the list the 'main' language.
     * e.g. en-US => en
     */
    if (languageParts.length > 1) {
        languagesToCheck.push(languageParts[0]);
    }

    // Default to 'en'.
    let existingLanguage = 'en';

    for (const lang of languagesToCheck) {
        const file = path.join(__dirname, 'assets', relativePath, lang, 'messages.js');

        if (fs.existsSync(file)) { // eslint-disable-line no-sync
            existingLanguage = lang;
            break;
        }
    }

    return path.join(relativePath, existingLanguage, 'messages.js');
};

/*
 * ------------------------------------------------------------------------------
 * Formatter
 * ------------------------------------------------------------------------------
 */

export default class HTMLFormatter implements IFormatter {
    private renderFile(filename: string, data: any) {
        return new Promise((resolve, reject) => {
            ejs.renderFile(filename, data, { filename }, (err, html) => {
                /* istanbul ignore if */
                if (err) {
                    return reject(err);
                }

                return resolve(html);
            });
        });
    }

    /** Format the problems grouped by `resource` name and sorted by line and column number */
    public async format(problems: Problem[], /* istanbul ignore next */ options: FormatterOptions = {}) {

        debug('Formatting results');

        const language = options.language!;
        const target = options.target || '';
        const result = new AnalysisResult(target, options);
        const categoryList: string[] = getCategoryList(options.resources);

        categoryList.forEach((category) => {
            result.addCategory(category, language);
        });

        problems.forEach((message) => {
            result.addProblem(message, language);
        });

        /* istanbul ignore if */
        if (options.resources) {
            options.resources.hints.forEach((hintConstructor) => {
                const categoryName: string = hintConstructor.meta.docs!.category!;
                const hintId: string = hintConstructor.meta.id;

                const category: CategoryResult = result.getCategoryByName(categoryName)!;
                const hint: HintResult | undefined = category.getHintByName(hintId);

                if (!hint) {
                    category.addHint(hintId, 'pass');
                }
            });
        }

        try {
            if (!options.noGenerateFiles) {
                result.percentage = 100;
                result.id = Date.now().toString();

                const htmlPath = path.join(__dirname, 'views', 'pages', 'report.ejs');
                const html = await this.renderFile(htmlPath, {
                    getMessage(key: MessageName, substitutions?: string | string[]) {
                        return getMessageFormatter(key, language, substitutions);
                    },
                    languageFile: getLanguageFile(language),
                    result,
                    utils
                });
                // We save the result with the friendly target name
                const name = target.replace(/:\/\//g, '-')
                    .replace(/:/g, '-')
                    .replace(/\./g, '-')
                    .replace(/\//g, '-')
                    .replace(/[?=]/g, '-query-')
                    .replace(/-$/, '');
                const destDir = options.output || path.join(cwd(), 'hint-report', name);
                const currentDir = path.join(__dirname);
                const configDir = path.join(destDir, 'config');

                await fs.remove(destDir);

                await fs.mkdirp(configDir);

                await fs.copy(path.join(currentDir, 'assets'), destDir);

                /**
                 * Update images reference to make them work locally
                 * when there is no server.
                 */
                const parseCssfile = async (filePath: string, prefix: string = '../..') => {
                    const cssFile = filePath;
                    let scanCSS = await fs.readFile(cssFile, 'utf-8');
                    const urlCSSRegex = /url\(['"]?([^'")]*)['"]?\)/g;

                    scanCSS = scanCSS.replace(urlCSSRegex, (match, group) => {
                        return `url('${group[0] === '/' ? prefix : ''}${group}')`;
                    });

                    await fs.outputFile(filePath, scanCSS, { encoding: 'utf-8' });
                };

                await parseCssfile(path.join(destDir, 'styles', 'scan', 'scan-results.css'));
                await parseCssfile(path.join(destDir, 'styles', 'anchor-top.css'), '../');

                if (options.config) {
                    await fs.outputFile(path.join(configDir, result.id), JSON.stringify(options.config), { encoding: 'utf-8' });
                }

                const destination = path.join(destDir, 'index.html');

                await fs.outputFile(destination, html);

                logger.log(getMessageFormatter('youCanView', language, destination));
            }

            return result;
        } catch (err) {
            logger.error(err);

            throw err;
        }
    }
}
