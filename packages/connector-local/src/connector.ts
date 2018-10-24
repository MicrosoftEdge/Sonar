/**
 * @fileoverview Connector for local development. It reads recursively
 * the contents of a folder and sends events for each one of the files
 * found.
 * It currently only sends `fetch::end::*` events.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as url from 'url';
import * as path from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';
const readFileAsBuffer = promisify(readFile);

import * as chokidar from 'chokidar';
import * as globby from 'globby';

import { getAsUri } from 'hint/dist/src/lib/utils/network/as-uri';
import asPathString from 'hint/dist/src/lib/utils/network/as-path-string';
import { getContentTypeData, isTextMediaType, getType } from 'hint/dist/src/lib/utils/content-type';
import { IAsyncHTMLDocument, IAsyncHTMLElement, IAsyncWindow } from 'hint/dist/src/lib/types/async-html';

import isFile from 'hint/dist/src/lib/utils/fs/is-file';
import readFileAsync from 'hint/dist/src/lib/utils/fs/read-file-async';
import * as logger from 'hint/dist/src/lib/utils/logging';

import {
    IConnector,
    IFetchOptions,
    Event, FetchEnd, ScanEnd, NetworkData, CanEvaluateScript
} from 'hint/dist/src/lib/types';
import { Engine } from 'hint/dist/src/lib/engine';
import { HTMLParse } from '@hint/parser-html';

/*
 * ------------------------------------------------------------------------------
 * Defaults
 * ------------------------------------------------------------------------------
 */

const defaultOptions = {};

export default class LocalConnector implements IConnector {
    private _window: IAsyncWindow | undefined;
    private _options: any;
    private engine: Engine;
    private _href: string = '';
    private filesPattern: Array<string>;
    private watcher: chokidar.FSWatcher | null = null;

    public constructor(engine: Engine, config: object) {
        this._options = Object.assign({}, defaultOptions, config);
        this.filesPattern = this.getFilesPattern();
        this.engine = engine;

        this.engine.on('parse::html::end', this.onParseHTML.bind(this));
    }

    /*
     * ------------------------------------------------------------------------------
     * Private methods
     * ------------------------------------------------------------------------------
     */
    private getFilesPattern(): Array<string> {
        const pattern = this._options.pattern;

        if (!pattern) {
            /*
             * Ignore .git by default, other common folders as
             * node_modules are usually in the .gitignore file and
             * we are using it to ignore them.
             */
            return ['**', '!.git/**'];
        }

        /* istanbul ignore next */
        if (Array.isArray(pattern)) {
            return pattern.length > 0 ? pattern : [];
        }

        /* istanbul ignore next */
        return [pattern];
    }

    private async notifyFetch(event: FetchEnd) {
        const type = getType(event.response.mediaType);

        await this.engine.emitAsync(`fetch::end::${type}`, event);
    }

    private async fetch(target: string, options?: IFetchOptions) {
        const event = await this.fetchData(target, options);

        return this.notifyFetch(event);
    }

    private async fetchData(target: string, options?: IFetchOptions): Promise<FetchEnd> {
        const content: NetworkData = await this.fetchContent(target, undefined, options);
        const uri = getAsUri(target);

        return {
            element: null,
            request: content.request,
            resource: uri ? url.format(uri) : /* istanbul ignore next */ '',
            response: content.response
        };
    }

    private getGitIgnore = async () => {
        try {
            const rawList = await readFileAsync(path.join(process.cwd(), '.gitignore'));
            const splitList = rawList.split('\n');

            const result = splitList.reduce((total: Array<string>, ignore: string) => {
                const value: string = ignore.trim();

                /* istanbul ignore if */
                if (!value) {
                    return total;
                }

                /* istanbul ignore if */
                if (value[0] === '/') {
                    total.push(value.substr(1));
                } else {
                    total.push(value);
                }

                return total;
            }, []);

            return result;
        } catch (err) {
            logger.error('Error reading .gitignore');

            return [];
        }
    }

    private async notify() {
        const href: string = this._href;
        const scanEndEvent: ScanEnd = { resource: href };

        await this.engine.emitAsync('scan::end', scanEndEvent);
        await this.engine.notify();

        logger.log('Watching for file changes.');
    }

    private watch(targetString: string) {
        return new Promise(async (resolve, reject) => {
            const isF = isFile(targetString);
            /* istanbul ignore next */
            const target = isF ? targetString : '.';
            const ignored = await this.getGitIgnore();

            this.watcher = chokidar.watch(target, {
                /* istanbul ignore next */
                cwd: !isF ? targetString : undefined,
                ignored: ignored.concat(['.git/']),
                ignoreInitial: true,
                /*
                 * If you are using vscode and create and remove a folder
                 * from the editor, an EPERM error is thrown.
                 * This option avoid that error.
                 */
                ignorePermissionErrors: true
            });

            const getFile = (filePath: string): string => {
                /* istanbul ignore if */
                if (isF) {
                    return filePath;
                }

                /* istanbul ignore else */
                if (path.isAbsolute(filePath)) {
                    return filePath;
                }

                return path.join(targetString, filePath);
            };

            const onAdd = async (filePath: string) => {
                const file = getFile(filePath);

                // TODO: Remove this log or change the message
                logger.log(`File ${file} added`);

                await this.fetch(file);
                await this.notify();
            };

            const onChange = async (filePath: string) => {
                const file: string = getFile(filePath);
                const fileUrl = getAsUri(file);

                logger.log(`File ${file} changeg`);
                // TODO: Manipulate the report if the file already have messages in the report.
                if (fileUrl) {
                    this.engine.clean(fileUrl);
                }
                await this.fetch(file);
                await this.notify();
            };

            const onUnlink = async (filePath: string) => {
                const file: string = getFile(filePath);
                const fileUrl = getAsUri(file);

                if (fileUrl) {
                    this.engine.clean(fileUrl);
                }

                // TODO: Do anything when a file is removed? Maybe check the current report and remove messages related to that file.
                logger.log('onUnlink');

                await this.notify();
            };

            const onReady = async () => {
                await this.notify();
            };

            const onError = (err: any) => {
                logger.error('error', err);

                reject(err);
            };

            this.watcher
                .on('add', onAdd.bind(this))
                .on('change', onChange.bind(this))
                .on('unlink', onUnlink.bind(this))
                .on('error', onError)
                .on('ready', onReady);

            // Close the watcher after press Ctrl + C
            process.once('SIGINT', () => {
                if (this.watcher) {
                    this.watcher.close();
                }
                this.engine.clear();
                resolve();
            });
        });
    }

    /* istanbul ignore next */
    private async onParseHTML(event: HTMLParse) {
        this._window = event.window;
        await this.engine.emitAsync('can-evaluate::script', { resource: this._href } as CanEvaluateScript);
    }

    /*
     * ------------------------------------------------------------------------------
     * Public methods
     * ------------------------------------------------------------------------------
     */

    public async fetchContent(target: string, headers?: object, options?: IFetchOptions): Promise<NetworkData> {
        /*
         * target can have one of these forms:
         *   - /path/to/file
         *   - C:/path/to/file
         *   - file:///path/to/file
         *   - file:///C:/path/to/file
         *
         * That's why we need to parse it to an URL
         * and then get the path string.
         */
        const uri = getAsUri(target);
        const filePath: string = uri ? asPathString(uri) : '';
        const rawContent: Buffer = options && options.content ? Buffer.from(options.content) : await readFileAsBuffer(filePath);
        const contentType = getContentTypeData(null as any, filePath, null, rawContent);
        let content = '';

        if (isTextMediaType(contentType.mediaType || '')) {
            content = rawContent.toString(contentType.charset || undefined);
        }

        // Need to do some magic to create a fetch::end::*
        return {
            request: {} as any,
            response: {
                body: {
                    content,
                    rawContent,
                    rawResponse() {
                        /* istanbul ignore next */
                        return Promise.resolve(rawContent);
                    }
                },
                charset: contentType.charset || /* istanbul ignore next */ '',
                headers: {},
                hops: [],
                mediaType: contentType.mediaType || /* istanbul ignore next */ '',
                statusCode: 200,
                url: uri ? url.format(uri) : /* istanbul ignore next */ ''
            }
        };
    }

    public async collect(target: url.URL, options?: IFetchOptions) {
        /** The target in string format */
        const href: string = this._href = target.href;
        const initialEvent: Event = { resource: href };

        this.engine.emitAsync('scan::start', initialEvent);

        const pathString = asPathString(target);
        let files: string[];

        if (isFile(pathString)) {
            await this.engine.emitAsync('fetch::start::target', initialEvent);
            files = [pathString];
        } else {
            // TODO: the current @types/globby doesn't support gitignore. Remove "as any" when possible
            files = await globby(this.filesPattern, ({
                absolute: true,
                cwd: pathString,
                dot: true,
                gitignore: true
            } as any));

            // Ignore options.content when matching multiple files
            if (options && options.content) {
                options.content = undefined;
            }
        }

        const events = await Promise.all<FetchEnd>(files.map((file) => {
            return this.fetchData(file, options);
        }));

        for (let i = 0; i < events.length; i++) {
            await this.notifyFetch(events[i]);
        }

        if (this._options.watch) {
            await this.watch(pathString);
        } else {
            await this.engine.emitAsync('scan::end', initialEvent);
        }
    }

    /* istanbul ignore next */
    public evaluate(source: string): Promise<any> {
        return Promise.resolve(this._window ? this._window.evaluate(source) : null);
    }

    /* istanbul ignore next */
    public querySelectorAll(selector: string): Promise<Array<IAsyncHTMLElement>> {
        return this._window ? this._window.document.querySelectorAll(selector) : Promise.resolve([]);
    }

    /* istanbul ignore next */
    public close() {
        return Promise.resolve();
    }

    /* istanbul ignore next */
    public get dom(): IAsyncHTMLDocument | undefined {
        return this._window && this._window.document;
    }

    /* istanbul ignore next */
    public get html(): Promise<string> {
        return this._window ? this._window.document.pageHTML() : Promise.resolve('');
    }
}
