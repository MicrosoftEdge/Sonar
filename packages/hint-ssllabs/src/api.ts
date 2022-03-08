/* istanbul ignore file */

import { delay, importESM } from '@hint/utils';
import { SSLLabsOptions, SSLLabsResult } from './types';

const APIURL = 'https://api.ssllabs.com/api/v3/analyze';

const analyzeWithRetry = async (options: SSLLabsOptions): Promise<SSLLabsResult> => {
    const got = (await importESM<typeof import('got')>('got')).default;
    const result = await got(APIURL, { searchParams: options }).json<SSLLabsResult>();

    if (result.status === 'READY' || result.status === 'ERROR') {
        return result;
    }

    await delay(1000);

    return analyzeWithRetry(options);
};

export const analyze = async (options: SSLLabsOptions): Promise<SSLLabsResult> => {
    const result = await analyzeWithRetry(options);

    if (result.status === 'ERROR') {
        throw new Error(`Error analyzing url ${options.host}`);
    }

    return result;
};
