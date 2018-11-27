import * as sinon from 'sinon';
import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import { Rule, Declaration } from 'postcss';
import * as CSSParser from '../src/parser';
import { StyleParse } from '../src/types';

const postcss = {
    parse() {
        return {};
    }
};
const element = {
    getAttribute(): string | null {
        return null;
    },
    outerHTML(): Promise<string> {
        return Promise.resolve('');
    }
};

test.beforeEach((t) => {
    t.context.element = element;
    t.context.engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    });
});

test.serial('We should provide a correct AST when parsing CSS.', async (t) => {
    const sandbox = sinon.createSandbox();
    const parseObject = {};
    const code = '.foo { color: #fff }';
    const style = `<style>  ${code}  </style>`;
    new CSSParser.default(t.context.engine); // eslint-disable-line

    sandbox.spy(t.context.engine, 'emitAsync');
    sandbox.stub(postcss, 'parse').returns(parseObject);

    sandbox.stub(element, 'outerHTML').resolves(style);
    sandbox.stub(element, 'getAttribute')
        .onFirstCall()
        .returns('text/css');

    await t.context.engine.emitAsync('element::style', { element });

    t.is(t.context.engine.emitAsync.args[1][0], 'parse::start::css');

    const args = t.context.engine.emitAsync.args[2];
    const data = args[1] as StyleParse;
    const root = data.ast;
    const rule = root.first as Rule;
    const declaration = rule.first as Declaration;

    t.is(args[0], 'parse::end::css');
    t.is(rule.selector, '.foo');
    t.is(declaration.prop, 'color');
    t.is(declaration.value, '#fff');
    t.is(args[1].code, code);
    t.is(args[1].resource, 'Inline CSS');

    sandbox.restore();
});
