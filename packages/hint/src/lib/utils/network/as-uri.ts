import * as url from 'url';
import { URL } from 'url'; // this is necessary to avoid TypeScript mixes types.

import { compact } from 'lodash';
import fileUrl = require('file-url'); // `require` used because `file-url` exports a function

import { debug as d } from '../debug';
import * as logger from '../logging';
import isFile from '../fs/is-file';
import isDirectory from '../fs/is-directory';
import pathExists from '../fs/path-exists';

const debug: debug.IDebugger = d(__filename);

/**
 * Receives a string and returns a valid Uris that are either:
 * * file:// if they start with the protocol or exist in the file system
 * * http(s):// if they start with this protocol or are not a valid file
 * * null if not valid
 *
 */
export const getAsUri = (source: string): URL | null => {
    const entry: string = source.trim();
    let target: URL | null;

    try {
        target = new URL(entry);
    } catch (err) {
        /* istanbul ignore next */
        { // eslint-disable-line no-lone-blocks
            target = null;
        }
    }

    const protocol = target ? target.protocol : null;

    /* istanbul ignore else */
    /*
     * If it's a URI.
     * Check if the protocol is HTTP or HTTPS.
     */
    if (protocol === 'http:' || protocol === 'https:' || protocol === 'file:') {
        debug(`Adding valid target: ${target && url.format(target)}`);

        return target;
    }

    /*
     * If it's not a URI
     * If it does exist and it's a regular file.
     */
    if (isFile(entry) || isDirectory(entry)) {
        target = new URL(fileUrl(entry));
        debug(`Adding valid target: ${url.format(target)}`);

        return target;
    }

    target = new URL(`http://${entry}`);

    /*
     * And it doesn't exist locally, and is a valid URL:
     * Except for the case of the well known and used `localhost`,
     * for all other cases the `hostname` needs to contain at least
     * a `.`. Private domains should have `http(s)://` in front.
     */
    if (!pathExists(entry) && (target.hostname === 'localhost' || target.hostname.includes('.'))) {
        debug(`Adding modified target: ${url.format(target)}`);

        return target;
    }

    // If it's not a regular file or looks like a URL, ignore it.
    logger.error(`Ignoring '${entry}' as it's not an existing file nor a valid URL`);

    return null;
};

/**
 * Receives an array of string and returns an array of valid Uris that are either:
 * * file:// if they start with the protocol or exist in the file system
 * * http(s):// if they start with this protocol or are not a valid file
 * * null if not valid
 *
 */
export const getAsUris = (source: string[]): URL[] => {
    const targets: URL[] = source.reduce((uris: URL[], entry: string): URL[] => {
        const uri = getAsUri(entry);

        if (uri) {
            uris.push(uri);
        }

        return uris;
    }, []);

    return compact(targets);
};
