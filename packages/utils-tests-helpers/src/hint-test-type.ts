import { AnyContext } from 'ava';

import { ProblemLocation } from 'hint/dist/src/lib/types';

export type Report = {
    /** The message to validate */
    message: string;
    position?: ProblemLocation;
};

export type HintTest = {
    /** The code to execute before `closing` the connector. */
    after?(): void | Promise<void>;
    /** The code to execute before creating the connector. */
    before?(): void | Promise<void>;
    /** The name of the test. */
    name: string;
    /** The expected results of the execution. */
    reports?: Report[];
    /** The configuration `test-server` should use. */
    serverConfig?: any;
    /** The url to `executeOn` if different than `localhost`. */
    serverUrl?: string;
};

export type HintLocalTest = {
    /** The code to execute before `closing` the connector. */
    after?(context?: AnyContext): void | Promise<void>;
    /** The code to execute before creating the connector. */
    before?(context?: AnyContext): void | Promise<void>;
    /** Path to send to the local connector. */
    path: string;
    /** The name of the test. */
    name: string;
    /** The expected results of the execution. */
    reports?: Report[];
};
