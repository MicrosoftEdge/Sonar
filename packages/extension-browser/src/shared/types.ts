import { FetchEnd, FetchStart, Problem } from 'hint/dist/src/lib/types';

export type Config = {
    categories?: string[];
    browserslist?: string;
    ignoredUrls?: string;
};

export type HintResults = {
    helpURL: string;
    id: string;
    name: string;
    problems: Problem[];
};

export type CategoryResults = {
    hints: HintResults[];
    name: string;
    passed: number;
};

export type Results = {
    categories: CategoryResults[];
};

export type Events = {
    enable?: Config;
    fetchEnd?: FetchEnd;
    fetchStart?: FetchStart;
    done?: boolean;
    ready?: boolean;
    requestConfig?: boolean;
    results?: Results;
    tabId?: number;
};
