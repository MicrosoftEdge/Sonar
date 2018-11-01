import { AST, SourceCode } from 'eslint';

import { Event, Events } from 'hint/dist/src/lib/types/events';

/** The object emitted by the `javascript` parser */
export type ScriptParse = Event & {
    /** The ast generated from the script */
    ast: AST.Program;
    /** The source code parsed */
    sourceCode: SourceCode;
};

export type ScriptEvents = Events & {
    'parse::end::javascript': ScriptParse;
    'parse::start::javascript': Event;
};
