/**
 * @fileoverview HintContext utility for hints
 *
 * Based on ESLint's rule-context
 * https://github.com/eslint/eslint/blob/master/lib/hint-context.js
 */
import { URL } from 'url';

import { Engine } from './engine';
import {
    Events,
    HintMetadata,
    IAsyncHTMLElement,
    NetworkData,
    ProblemLocation,
    Severity,
    StringKeyOf
} from './types';
import { findInElement, findProblemLocation } from './utils/location-helpers';
import { Category } from './enums/category';

export type ReportOptions = {
    /** The source code to display (defaults to the `outerHTML` of `element`). */
    codeSnippet?: string;
    /** The text within `element` where the issue was found (used to refine a `ProblemLocation`). */
    content?: string;
    /** The `IAsyncHTMLElement` where the issue was found (used to get a `ProblemLocation`). */
    element?: IAsyncHTMLElement | null;
    /** The `ProblemLocation` where the issue was found. */
    location?: ProblemLocation | null;
    /** The `Severity` to report the issue as (overrides default settings for a hint). */
    severity?: Severity;
};

/** Acts as an abstraction layer between hints and the main hint object. */
export class HintContext<E extends Events = Events> {
    private id: string
    private options: any[]
    private meta: HintMetadata
    private severity: Severity
    private engine: Engine<E>

    public constructor(hintId: string, engine: Engine<E>, severity: Severity, options: any, meta: HintMetadata) {

        this.id = hintId;
        this.options = options;
        this.meta = meta;
        this.engine = engine;
        this.severity = severity;

        Object.freeze(this);
    }

    /** The DOM of the page. */
    public get pageDOM() {
        return this.engine.pageDOM;
    }

    /** The original HTML of the page. */
    public get pageContent() {
        return this.engine.pageContent;
    }

    /** The headers of the response when retrieving the HTML. */
    public get pageHeaders() {
        return this.engine.pageHeaders;
    }

    /** List of browsers to target as specified by the hint configuration. */
    public get targetedBrowsers(): string[] {
        return this.engine.targetedBrowsers;
    }

    /** Custom configuration (if any) for the given hint */
    public get hintOptions() {
        if (Array.isArray(this.options)) {
            return this.options[1];
        }

        return null;
    }

    /*
     * ------------------------------------------------------------------------------
     * Public methods
     * ------------------------------------------------------------------------------
     */

    /** Injects JavaScript into the target. */
    public evaluate(source: string): Promise<any> {
        return this.engine.evaluate(source);
    }

    /** A useful way of making requests. */
    public fetchContent(target: string | URL, headers?: object): Promise<NetworkData> {
        return this.engine.fetchContent(target, headers);
    }

    public querySelectorAll(selector: string): Promise<IAsyncHTMLElement[]> {
        return this.engine.querySelectorAll(selector);
    }

    /** Finds the exact location of the given content in the HTML that represents the `element`. */
    public findInElement(element: IAsyncHTMLElement, content: string): Promise<ProblemLocation> {
        return findInElement(element, content);
    }

    /** Finds the approximative location in the page's HTML for a match in an element. */
    public findProblemLocation(element: IAsyncHTMLElement, content?: string): Promise<ProblemLocation> {
        return findProblemLocation(element, { column: 0, line: 0 }, content);
    }

    /** Reports a problem with the resource. */
    public async report(resource: string, message: string, options: ReportOptions = {}): Promise<void> {
        const { codeSnippet, content, element, severity } = options;
        let position: ProblemLocation | null = options.location || null;
        let sourceCode: string | null = null;

        if (element) {
            position = await findProblemLocation(element, { column: 0, line: 0 }, content);
            sourceCode = (await element.outerHTML()).replace(/[\t]/g, '    ');
        }

        /*
         * If location is undefined or equal to null, `position` will be set as `{ column: -1, line: -1 }` later in `hint.report`.
         * So pass the `location` on as it is.
         */

        this.engine.report(
            this.id,
            (this.meta && this.meta.docs && this.meta.docs.category) ? this.meta.docs.category : Category.other,
            severity || this.severity,
            codeSnippet || sourceCode || '',
            position,
            message,
            resource
        );
    }

    /** Subscribe an event in hint. */
    public on<K extends StringKeyOf<E>>(event: K, listener: (data: E[K], event: string) => void) {
        this.engine.onHintEvent(this.id, event, listener);
    }
}
