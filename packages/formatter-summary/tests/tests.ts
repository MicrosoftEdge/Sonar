import anyTest, { TestInterface } from 'ava';
import chalk from 'chalk';
import * as logSymbols from 'log-symbols';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import * as table from 'text-table';

type SummaryContext = {
    loggingLogSpy: sinon.SinonSpy;
};

const test = anyTest as TestInterface<SummaryContext>;
const logging = { log() { } };

proxyquire('../src/formatter', { 'hint/dist/src/lib/utils/logging': logging });

import SummaryFormatter from '../src/formatter';
import * as problems from './fixtures/list-of-problems';

test.beforeEach((t) => {
    t.context.loggingLogSpy = sinon.spy(logging, 'log');
});

test.afterEach.always((t) => {
    t.context.loggingLogSpy.restore();
});

test.serial(`Summary formatter doesn't print anything if no values`, (t) => {
    const formatter = new SummaryFormatter();

    formatter.format(problems.noproblems);

    t.is(t.context.loggingLogSpy.callCount, 0);
});

test.serial(`Summary formatter prints in yellow if only warnings found`, (t) => {
    const log = t.context.loggingLogSpy;
    const tableData = [];

    const formatter = new SummaryFormatter();

    formatter.format(problems.summaryWarnings);

    tableData.push([chalk.cyan('random-hint'), chalk.yellow(`2 warnings`)]);

    const tableString = table(tableData);

    t.is(log.args[0][0], tableString);
    t.is(log.args[1][0], chalk.yellow.bold(`${logSymbols.error.trim()} Found a total of 0 errors and 2 warnings`));
});

test.serial(`Summary formatter prints a table and a summary for all resources combined`, (t) => {
    const log = t.context.loggingLogSpy;
    const tableData = [];

    const formatter = new SummaryFormatter();

    formatter.format(problems.summaryProblems);

    tableData.push([chalk.cyan('random-hint2'), chalk.red(`1 error`)]);
    tableData.push([chalk.cyan('random-hint'), chalk.yellow(`4 warnings`)]);

    const tableString = table(tableData);

    t.is(log.args[0][0], tableString);
    t.is(log.args[1][0], chalk.red.bold(`${logSymbols.error.trim()} Found a total of 1 error and 4 warnings`));
});

test.serial(`Summary formatter sorts by name if same number of errors`, (t) => {
    const log = t.context.loggingLogSpy;
    const tableData = [];

    const formatter = new SummaryFormatter();

    formatter.format(problems.summarySameNumberOfErrors);

    tableData.push([chalk.cyan('random-hint'), chalk.red(`1 error`)]);
    tableData.push([chalk.cyan('random-hint2'), chalk.red(`1 error`)]);

    const tableString = table(tableData);

    t.is(log.args[0][0], tableString);
    t.is(log.args[1][0], chalk.red.bold(`${logSymbols.error.trim()} Found a total of 2 errors and 0 warnings`));
});

test.serial(`Summary formatter prints errors and warnings for a hint that reports both`, (t) => {
    const log = t.context.loggingLogSpy;
    const tableData = [];

    const formatter = new SummaryFormatter();

    formatter.format(problems.summaryErrorWarnings);

    tableData.push([chalk.cyan('random-hint'), chalk.red(`1 error`), chalk.yellow(`1 warning`)]);

    const tableString = table(tableData);

    t.is(log.args[0][0], tableString);
    t.is(log.args[1][0], chalk.red.bold(`${logSymbols.error.trim()} Found a total of 1 error and 1 warning`));
});
