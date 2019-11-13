import * as parse5 from 'parse5';
import * as htmlparser2Adapter from 'parse5-htmlparser2-tree-adapter';

import { ProblemLocation } from '@hint/utils-types';

import { findOriginalElement } from './find-original-element';
import { ElementData, INamedNodeMap } from './types';

import { HTMLDocument } from './htmldocument';

export class HTMLElement {
    public ownerDocument: HTMLDocument;

    private _element: ElementData;

    public constructor(element: ElementData | HTMLElement, ownerDocument: HTMLDocument) {
        this._element = element instanceof HTMLElement ? element._element : element;
        this.ownerDocument = ownerDocument;
    }

    public get attributes(): INamedNodeMap {
        const x = this._element.attribs;

        return Object.entries(x).map(([name, value]) => {
            return {
                name,
                value
            };
        });
    }

    public get children(): HTMLElement[] {
        const result: HTMLElement[] = [];

        for (const child of this._element.children) {
            if (child.type === 'tag' || child.type === 'script' || child.type === 'style') {
                result.push(new HTMLElement(child, this.ownerDocument));
            }
        }

        return result;
    }

    public get parentElement(): HTMLElement | null {
        const parent = this._element.parent;

        if (!parent || (parent.type !== 'tag' && parent.type !== 'script' && parent.type !== 'style')) {
            return null;
        }

        return new HTMLElement(parent, this.ownerDocument);
    }

    public get nodeName(): string {
        return this._element.name;
    }

    public getAttribute(attribute: string): string | null {
        const attrib = this._element.attribs[attribute];
        const value = typeof attrib !== 'undefined' ? attrib : null;

        return value;
    }

    /**
     * Check if the value of an attribute was provided as a template
     * expression, meaning the exact value of the attribute is unknown.
     */
    public isAttributeAnExpression(attribute: string): boolean {
        const value = this.getAttribute(attribute);

        return value ? value.includes('{') : false;
    }

    /**
     * Helper to find the original location in source of an element.
     * Used when this element is part of a DOM snapshot to search the
     * original fetched document a similar element and use the location
     * of that element instead.
     */
    private _getOriginalLocation(): parse5.ElementLocation | null {
        const location = this._element.sourceCodeLocation;

        // Use direct location information when available.
        if (location) {
            return location;
        }

        // If not, try to match an element in the original document to use it's location.
        if (this.ownerDocument.originalDocument) {
            const match = findOriginalElement(this.ownerDocument.originalDocument, this);

            if (match) {
                return match._element.sourceCodeLocation || null;
            }
        }

        // Otherwise we don't have a location (element may have been dynamically generated).
        return null;
    }

    /**
     * Zero-based location of the element.
     */
    public getLocation(): ProblemLocation {
        const location = this._getOriginalLocation();

        // Column is zero-based, but pointing to the tag name, not the character <
        return {
            column: location ? location.startCol : -1,
            elementId: this._element.id,
            endOffset: location ? location.endOffset : -1,
            line: location ? location.startLine - 1 : -1,
            startOffset: location ? location.startOffset : -1
        };
    }

    /**
     * Calculate the document location of content within this element.
     * Used to determine offsets for CSS-in-HTML and JS-in-HTML reports.
     */
    public getContentLocation(offset: ProblemLocation): ProblemLocation | null {
        const location = this._getOriginalLocation();

        if (!location) {
            return null;
        }

        // Get the end of the start tag from `parse5`, converting to be zero-based.
        const startTag = location.startTag;
        const column = startTag.endCol - 1;
        const line = startTag.endLine - 1;

        // Adjust resulting column when content is on the same line as the tag.
        if (offset.line === 0) {
            return {
                column: column + offset.column,
                line
            };
        }

        // Otherwise adjust just the resulting line.
        return {
            column: offset.column,
            line: line + offset.line
        };
    }

    public isSame(element: HTMLElement): boolean {
        return this._element === element._element;
    }

    public get innerHTML(): string {
        return parse5.serialize(this._element, { treeAdapter: htmlparser2Adapter });
    }

    public get outerHTML(): string {
        /*
         * Until parse5 support outerHTML
         * (https://github.com/inikulin/parse5/issues/230)
         * we need to use this workaround.
         * https://github.com/inikulin/parse5/issues/118
         *
         * The problem with this workaround will modify the
         * parentElement and parentNode of the element, so we
         * need to restore it before return the outerHTML.
         */
        const fragment = htmlparser2Adapter.createDocumentFragment();
        const { parent, next, prev } = this._element;

        htmlparser2Adapter.appendChild(fragment, this._element);

        const result = parse5.serialize(fragment, { treeAdapter: htmlparser2Adapter });

        this._element.parent = parent;
        this._element.next = next;
        this._element.prev = prev;

        /* istanbul ignore else */
        if (next) {
            next.prev = this._element;
        }

        /* istanbul ignore else */
        if (prev) {
            prev.next = this._element;
        }

        return result;
    }

    public resolveUrl(url: string) {
        return this.ownerDocument.resolveUrl(url);
    }
}
