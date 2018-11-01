/**
 * @fileoverview The stylish formatter, it outputs the results in a table format with different colors.
 *
 * This formatter is based on [eslint stylish formatter](https://github.com/eslint/eslint/blob/master/lib/formatters/stylish.js)
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import chalk from 'chalk';
import {
    forEach,
    groupBy,
    sortBy
} from 'lodash';
import * as logSymbols from 'log-symbols';
import * as table from 'text-table';

import cutString from 'hint/dist/src/lib/utils/misc/cut-string';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { IFormatter, Problem, Severity } from 'hint/dist/src/lib/types';
import * as logger from 'hint/dist/src/lib/utils/logging';

const _ = {
    forEach,
    groupBy,
    sortBy
};
const debug = d(__filename);

const printPosition = (position: number, text: string) => {
    if (position === -1) {
        return '';
    }

    return `${text} ${position}`;
};

/*
 * ------------------------------------------------------------------------------
 * Formatter
 * ------------------------------------------------------------------------------
 */

export default class StylishFormatter implements IFormatter {
    /** Format the problems grouped by `resource` name and sorted by line and column number */
    public format(messages: Problem[]) {

        debug('Formatting results');

        if (messages.length === 0) {
            return;
        }

        const resources: _.Dictionary<Problem[]> = _.groupBy(messages, 'resource');
        let totalErrors: number = 0;
        let totalWarnings: number = 0;

        _.forEach(resources, (msgs: Problem[], resource: string) => {
            let warnings: number = 0;
            let errors: number = 0;
            const sortedMessages: Problem[] = _.sortBy(msgs, ['location.line', 'location.column']);
            const tableData: string[][] = [];
            let hasPosition: boolean = false;

            logger.log(chalk.cyan(`${cutString(resource, 80)}`));

            _.forEach(sortedMessages, (msg: Problem) => {
                const severity: string = Severity.error === msg.severity ? chalk.red('Error') : chalk.yellow('Warning');

                if (Severity.error === msg.severity) {
                    errors++;
                } else {
                    warnings++;
                }

                const line: string = printPosition(msg.location.line, 'line');
                const column: string = printPosition(msg.location.column, 'col');

                if (line) {
                    hasPosition = true;
                }

                tableData.push([line, column, severity, msg.message, msg.hintId]);
            });

            /*
             * If no message in this resource has a position, then we remove the
             * position components from the array to avoid unnecessary white spaces
             */
            if (!hasPosition) {
                tableData.forEach((row: string[]) => {
                    row.splice(0, 2);
                });
            }

            logger.log(table(tableData));

            const color: typeof chalk = errors > 0 ? chalk.red : chalk.yellow;

            totalErrors += errors;
            totalWarnings += warnings;

            logger.log(color.bold(`${logSymbols.error} Found ${errors} ${errors === 1 ? 'error' : 'errors'} and ${warnings} ${warnings === 1 ? 'warning' : 'warnings'}`));
            logger.log('');
        });

        const color: typeof chalk = totalErrors > 0 ? chalk.red : chalk.yellow;

        logger.log(color.bold(`${logSymbols.error} Found a total of ${totalErrors} ${totalErrors === 1 ? 'error' : 'errors'} and ${totalWarnings} ${totalWarnings === 1 ? 'warning' : 'warnings'}`));
    }
}
