import anyTest, { TestInterface, ExecutionContext } from 'ava';
import chalk from 'chalk';
import * as logSymbols from 'log-symbols';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import * as table from 'text-table';
const stripAnsi = require('strip-ansi');

import * as utils from '@hint/utils';

import * as problems from './fixtures/list-of-problems';

type Logging = {
    log: () => void;
};

type WriteFileAsync = () => void;

type SummaryContext = {
    logging: Logging;
    loggingLogSpy: sinon.SinonSpy<any, void>;
    writeFileAsync: WriteFileAsync;
    writeFileAsyncDefaultStub: sinon.SinonStub<any, void>;
};

const test = anyTest as TestInterface<SummaryContext>;

const initContext = (t: ExecutionContext<SummaryContext>) => {
    t.context.logging = { log() { } };
    t.context.loggingLogSpy = sinon.spy(t.context.logging, 'log');
    t.context.writeFileAsync = () => { };
    t.context.writeFileAsyncDefaultStub = sinon.stub(t.context, 'writeFileAsync').returns();
};

const loadScript = (context: SummaryContext) => {
    const script = proxyquire('../src/formatter', {
        '@hint/utils': {
            debug: utils.debug,
            logger: context.logging,
            writeFileAsync: context.writeFileAsync
        }
    });

    return script.default;
};

test.beforeEach(initContext);

test.afterEach.always((t) => {
    t.context.loggingLogSpy.restore();
});

test(`Summary formatter doesn't print anything if no values`, (t) => {
    const SummaryFormatter = loadScript(t.context);
    const formatter = new SummaryFormatter();

    formatter.format(problems.noproblems);

    t.is(t.context.loggingLogSpy.callCount, 0);
});

test(`Summary formatter prints in yellow if only warnings found`, (t) => {
    const log = t.context.loggingLogSpy;
    const writeFileStub = t.context.writeFileAsyncDefaultStub;
    const tableData = [];

    const SummaryFormatter = loadScript(t.context);
    const formatter = new SummaryFormatter();

    formatter.format(problems.summaryWarnings);

    tableData.push([chalk.cyan('random-hint'), chalk.yellow(`2 warnings`)]);

    const expectedResult = `${table(tableData)}
${chalk.yellow.bold(`${logSymbols.error.trim()} Found a total of 0 errors and 2 warnings`)}`;

    t.true(log.calledOnce);
    t.false(writeFileStub.calledOnce);
    t.is(log.args[0][0], expectedResult);
});

test(`Summary formatter prints a table and a summary for all resources combined`, (t) => {
    const log = t.context.loggingLogSpy;
    const writeFileStub = t.context.writeFileAsyncDefaultStub;
    const tableData = [];

    const SummaryFormatter = loadScript(t.context);
    const formatter = new SummaryFormatter();

    formatter.format(problems.summaryProblems);

    tableData.push([chalk.cyan('random-hint2'), chalk.red(`1 error`)]);
    tableData.push([chalk.cyan('random-hint'), chalk.yellow(`4 warnings`)]);

    const expectedResult = `${table(tableData)}
${chalk.red.bold(`${logSymbols.error.trim()} Found a total of 1 error and 4 warnings`)}`;

    t.true(log.calledOnce);
    t.false(writeFileStub.calledOnce);
    t.is(log.args[0][0], expectedResult);
});

test(`Summary formatter sorts by name if same number of errors`, (t) => {
    const log = t.context.loggingLogSpy;
    const writeFileStub = t.context.writeFileAsyncDefaultStub;
    const tableData = [];

    const SummaryFormatter = loadScript(t.context);
    const formatter = new SummaryFormatter();

    formatter.format(problems.summarySameNumberOfErrors);

    tableData.push([chalk.cyan('random-hint'), chalk.red(`1 error`)]);
    tableData.push([chalk.cyan('random-hint2'), chalk.red(`1 error`)]);

    const expectedResult = `${table(tableData)}
${chalk.red.bold(`${logSymbols.error.trim()} Found a total of 2 errors and 0 warnings`)}`;

    t.true(log.calledOnce);
    t.false(writeFileStub.calledOnce);
    t.is(log.args[0][0], expectedResult);
});

test(`Summary formatter prints errors and warnings for a hint that reports both`, (t) => {
    const log = t.context.loggingLogSpy;
    const writeFileStub = t.context.writeFileAsyncDefaultStub;
    const tableData = [];

    const SummaryFormatter = loadScript(t.context);
    const formatter = new SummaryFormatter();

    formatter.format(problems.summaryErrorWarnings);

    tableData.push([chalk.cyan('random-hint'), chalk.red(`1 error`), chalk.yellow(`1 warning`)]);

    const expectedResult = `${table(tableData)}
${chalk.red.bold(`${logSymbols.error.trim()} Found a total of 1 error and 1 warning`)}`;

    t.true(log.calledOnce);
    t.false(writeFileStub.calledOnce);
    t.is(log.args[0][0], expectedResult);
});

test(`Summary formatter called with the output option should write the result in the output file`, (t) => {
    const log = t.context.loggingLogSpy;
    const writeFileStub = t.context.writeFileAsyncDefaultStub;
    const tableData = [];
    const outputFile = 'output.json';

    const SummaryFormatter = loadScript(t.context);
    const formatter = new SummaryFormatter();

    formatter.format(problems.summaryErrorWarnings, { output: outputFile });

    tableData.push(['random-hint', '1 error', '1 warning']);

    const expectedResult = `${table(tableData)}
${stripAnsi(logSymbols.error.trim())} Found a total of 1 error and 1 warning`;

    t.false(log.calledOnce);
    t.true(writeFileStub.calledOnce);
    t.is(writeFileStub.args[0][0], outputFile);
    t.is(writeFileStub.args[0][1], expectedResult);
});
