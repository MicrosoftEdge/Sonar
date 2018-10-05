import { Crdp } from 'chrome-remote-debug-protocol';

import { IAsyncHTMLDocument, IAsyncHTMLElement } from 'hint/dist/src/lib/types/async-html'; //eslint-disable-line
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { ProblemLocation } from 'hint/dist/src/lib/types';

const debug: debug.IDebugger = d(__filename);

/** An implementation of AsyncHTMLDocument on top of the Chrome Debugging Protocol */
export class CDPAsyncHTMLDocument implements IAsyncHTMLDocument {
    /** The DOM domain of the CDP client. */
    private _DOM: Crdp.DOMClient;
    /** The root element of the real DOM. */
    private _dom!: Crdp.DOM.Node;
    /** A map with all the nodes accessible using `nodeId`. */
    private _nodes: Map<number, any> = new Map();
    /** outerHTML of the page. */
    private _outerHTML: string = '';

    public constructor(DOM: Crdp.DOMClient) {
        this._DOM = DOM;
    }

    /**
     * When doing requests like `querySelectorAll`, we receive an array of nodeIds. Instead
     * of having to do another request for the node, and because we are getting the whole DOM
     * initially, we store them in a Map using the `nodeId` as the key so we can access to them
     * later.
     */
    private trackNodes(root: Crdp.DOM.Node) {
        this._nodes.set(root.nodeId, root);
        if (!root.children) {
            return;
        }

        root.children.forEach((child) => {
            this.trackNodes(child);
        });
    }

    private getHTMLChildren(children: Array<Crdp.DOM.Node>) {
        return children.find((item) => {
            return item.nodeType === 1 && item.nodeName === 'HTML';
        });
    }

    /*
     * ------------------------------------------------------------------------------
     * Public methods
     * ------------------------------------------------------------------------------
     */

    public async querySelectorAll(selector: string): Promise<Array<AsyncHTMLElement>> {
        let nodeIds;

        try {
            nodeIds = (await this._DOM.querySelectorAll!({ nodeId: this._dom.nodeId, selector })).nodeIds;
        } catch (e) {
            debug(e);

            return [];
        }

        const nodes: Array<AsyncHTMLElement> = [];

        for (let i = 0; i < nodeIds.length; i++) {
            const nodeId = nodeIds[i];
            const node = this._nodes.get(nodeId);

            if (node) {
                nodes.push(new AsyncHTMLElement(node, this, this._DOM)); // eslint-disable-line no-use-before-define, typescript/no-use-before-define
            } else {
                /*
                 * This node was added in the DOM and we don't have it cached
                 * TODO: uncomment once chrome 62 is released.
                 * See https://github.com/cyrus-and/chrome-remote-interface/issues/255 for more information
                 * node = await this._DOM.describeNode({ nodeId });
                 * this._nodes.set(nodeId, node);
                 */
            }
        }

        return nodes;
    }

    public async pageHTML(): Promise<string> {
        if (this._outerHTML) {
            return Promise.resolve(this._outerHTML);
        }

        let { outerHTML } = await this._DOM.getOuterHTML!({ nodeId: this._dom.nodeId });

        /*
         * Some browsers like Edge don't have the property outerHTML in the root element
         * so we need to find the html element
         */
        if (!outerHTML) {
            const htmlElement = this.getHTMLChildren(this._dom.children!);

            ({ outerHTML } = await this._DOM.getOuterHTML!({ nodeId: htmlElement!.nodeId })); // HTML documents always have a root (the parser creates one)
        }

        this._outerHTML = outerHTML;

        return outerHTML;
    }

    public async load() {
        const { root: dom } = await this._DOM.getDocument!({ depth: -1 });

        this.trackNodes(dom);
        this._dom = dom;
    }

    /*
     * ------------------------------------------------------------------------------
     * Getters
     * ------------------------------------------------------------------------------
     */

    public get root() {
        return this._dom;
    }
}

export const createCDPAsyncHTMLDocument = async (DOM: Crdp.DOMClient) => {
    const dom = new CDPAsyncHTMLDocument(DOM);

    await dom.load();

    return dom;
};

/** An implementation of AsyncHTMLElement on top of the Chrome Debugging Protocol */
export class AsyncHTMLElement implements IAsyncHTMLElement {
    protected _htmlelement: Crdp.DOM.Node;
    private _ownerDocument: CDPAsyncHTMLDocument;
    private _DOM: Crdp.DOMClient;
    private _outerHTML: string = '';
    private _attributesArray: Array<{ name: string; value: string; }> = [];
    private _attributesMap: Map<string, string> = new Map();

    public constructor(htmlelement: Crdp.DOM.Node, ownerDocument: CDPAsyncHTMLDocument, DOM: Crdp.DOMClient) {
        if (typeof htmlelement === 'number') {
            throw new Error();
        }
        this._htmlelement = htmlelement;
        this._DOM = DOM;
        this._ownerDocument = ownerDocument;
    }

    private initializeAttributes() {
        const attributes = this._htmlelement.attributes || [];

        for (let i = 0; i < attributes.length; i += 2) {
            this._attributesArray.push({ name: attributes[i], value: attributes[i + 1] });
            this._attributesMap.set(attributes[i], attributes[i + 1]);
        }
    }

    /*
     * ------------------------------------------------------------------------------
     * Public methods
     * ------------------------------------------------------------------------------
     */

    public getAttribute(name: string): string | null {
        if (this._attributesArray.length === 0) {
            this.initializeAttributes();
        }

        const value = this._attributesMap.get(name);

        return typeof value === 'string' ? value : null;
    }

    public getLocation(): ProblemLocation | null {
        return null;
    }

    public isSame(element: AsyncHTMLElement): boolean {
        return this._htmlelement.nodeId === element._htmlelement.nodeId;
    }

    public async outerHTML(): Promise<string> {
        if (this._outerHTML) {
            return Promise.resolve(this._outerHTML);
        }

        let outerHTML = '';

        try {
            ({ outerHTML } = await this._DOM.getOuterHTML!({ nodeId: this._htmlelement.nodeId }));
        } catch (e) {
            debug(`Error trying to get outerHTML for node ${this._htmlelement.nodeId}`);
            debug(e);
        }

        this._outerHTML = outerHTML;

        return outerHTML;
    }

    /*
     * ------------------------------------------------------------------------------
     * Getters
     * ------------------------------------------------------------------------------
     */

    public get attributes() {
        if (this._attributesArray.length === 0) {
            this.initializeAttributes();
        }

        return this._attributesArray;
    }

    public get children() {
        if (this._htmlelement.children) {
            return this._htmlelement.children;
        }

        return [];
    }

    public get nodeName(): string {
        return this._htmlelement.nodeName;
    }

    public get ownerDocument(): IAsyncHTMLDocument {
        return this._ownerDocument;
    }
}
