/**
 * @fileoverview A hint formatter that outputs the issues in an Excel file
 * (xlsx).
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */
import * as Excel from 'exceljs';
import {
    forEach,
    groupBy,
    sortBy
} from 'lodash';

import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { IFormatter, Problem } from 'hint/dist/src/lib/types';
import * as logger from 'hint/dist/src/lib/utils/logging';

const _ = {
    forEach,
    groupBy,
    sortBy
};
const debug = d(__filename);
const startRow = 5;

/*
 * ------------------------------------------------------------------------------
 * Formatter
 * ------------------------------------------------------------------------------
 */

export default class ExcelFormatter implements IFormatter {
    public async format(messages: Array<Problem>, target: string) {
        if (messages.length === 0) {
            return;
        }

        const resources: _.Dictionary<Array<Problem>> = _.groupBy(messages, 'resource');
        const workbook = new Excel.Workbook();
        const sortedResources = _.sortBy(Object.keys(resources));

        // Styles for the cells
        const bold = { font: { bold: true } };
        const mediumBorder = { style: 'medium' };
        const border = {
            border: {
                bottom: mediumBorder,
                left: mediumBorder,
                right: mediumBorder,
                top: mediumBorder
            }
        };
        const rightAlign = { align: { horizontal: 'right' } };
        const tableHeader = Object.assign({
            fill: {
                fgColor: { argb: 'FF000000' },
                pattern: 'solid',
                type: 'pattern'
            },
            font: {
                bold: true,
                color: { argb: 'FFFFFFFF' }
            }
        }, border);

        const names: Map<string, string> = new Map();
        /**
         * Replaces `://`, `/`, `.` for `-` so the names are compatible with the sheets
         */
        const getName = (name: string) => {
            if (names.has(name)) {
                return names.get(name);
            }

            const finalName = `resource-${names.size}`;

            names.set(name, finalName);

            return finalName;
        };

        /** Applies all the given properties to `cell`. */
        const applyToCell = (cell: Excel.Cell, ...properties: any[]) => {
            Object.assign(cell, ...properties);
        };

        /** Creates a new sheet with the report for the given resource. */
        const processResource = (msgs: Array<Problem>, resource: string) => {
            const sortedMessages: Array<Problem> = _.sortBy(msgs, 'hintId');
            const name = getName(resource);
            const sheet = workbook.addWorksheet(name);
            let counter = startRow;

            sheet.getColumn('E').width = 25;
            sheet.getColumn('F').width = 150;

            applyToCell(
                sheet.getCell(`E${counter}`),
                { value: resource },
                bold);

            counter += 2;

            applyToCell(
                sheet.getCell(`E${counter}`),
                { value: 'Hint id' },
                tableHeader);
            applyToCell(
                sheet.getCell(`F${counter}`),
                { value: 'Issue' },
                tableHeader);
            counter++;

            _.forEach(sortedMessages, (problem) => {
                applyToCell(
                    sheet.getCell(`E${counter}`),
                    {
                        value: {
                            hyperlink: `https://webhint.io/docs/user-guide/hints/hint-${problem.hintId}/`,
                            text: problem.hintId
                        }
                    },
                    border);
                applyToCell(
                    sheet.getCell(`F${counter}`),
                    { value: problem.message },
                    border);
                counter++;
            });
        };

        /** Creates the summary sheet with the list of resources with issues. */
        const createSummary = (resourcesList: Array<string>, scannedUrl: string) => {
            const sheet = workbook.addWorksheet('summary');
            let counter = startRow;

            sheet.getColumn('E').width = 50;
            sheet.getColumn('F').width = 20;

            // Title of the sheet
            applyToCell(
                sheet.getCell(`E${counter}`),
                { value: `Summary for ${scannedUrl}` },
                bold);
            counter += 2;

            // Header with summary
            applyToCell(
                sheet.getCell(`E${counter}`),
                { value: `Resource url` },
                tableHeader);
            applyToCell(
                sheet.getCell(`F${counter}`),
                { value: `# of issues` },
                rightAlign,
                tableHeader);
            counter++;

            _.forEach(resourcesList, (resource) => {
                const resourceShortName = getName(resource);

                applyToCell(
                    sheet.getCell(`E${counter}`),
                    {
                        value: {
                            hyperlink: `#'${resourceShortName}'!A1`,
                            text: resource
                        }
                    },
                    border);

                applyToCell(
                    sheet.getCell(`F${counter}`),
                    { value: resources[resource].length },
                    border);

                counter++;
            });
        };

        debug('Formatting results');

        createSummary(sortedResources, target);

        _.forEach(sortedResources, (resourceName) => {
            processResource(resources[resourceName], resourceName);
        });

        try {
            // We save the file with the friendly target name
            const name = target.replace(/:\/\//g, '-')
                .replace(/:/g, '-')
                .replace(/\./g, '-')
                .replace(/\//g, '-')
                .replace(/-$/, '');

            await workbook.xlsx.writeFile(`${process.cwd()}/${name}.xlsx`);
        } catch (e) {
            /* istanbul ignore next */
            { // eslint-disable-line
                logger.error('Error saving XSLX file');

                if (e.message.includes('EBUSY')) {
                    logger.error(`Maybe it's opened somewhere else?`);
                }
            }
        }
    }
}
