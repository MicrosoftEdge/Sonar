/**
 * @fileoverview Main Sonar object, gets the configuration and loads collectors, rules and analyzes.
 * @author Anton Molleda (@molant)
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { EventEmitter2 as EventEmitter } from 'eventemitter2';

const debug = require('debug')('sonar:engine');

import * as resourceLoader from './util/resource-loader';
import { getSeverity } from './config/config-rules';
import { Plugin, Rule, Collector, Problem, Severity, Location } from './types'; // eslint-disable-line no-unused-vars
import { RuleContext } from './rule-context';

// import {RuleContext as RuleContext} from './rule-context';

// ------------------------------------------------------------------------------
// Public interface
// ------------------------------------------------------------------------------

export class Sonar extends EventEmitter {
    // TODO: review which ones need to be private or not
    /* eslint-disable no-undef */
    private plugins: Map<string, Plugin>
    private rules: Map<string, Rule>
    private collector: Collector
    private messages: Array<Problem>
    private _sourceHtml: string
    /* eslint-enable no-undef */

    get sourceHtml() {
        return this._sourceHtml;
    }

    set sourceHtml(sourceHtml) {
        this._sourceHtml = sourceHtml;
    }

    constructor(config) {
        super({
            delimiter: '::',
            maxListeners: 0,
            wildcard: true
        });
        debug('Initializing sonar engine');

        this.messages = [];

        debug('Loading plugins');
        this.plugins = new Map();
        if (config.plugins) {
            const plugins = resourceLoader.getPlugins();

            plugins.forEach((plugin) => {
                const instance = plugin[1].create(config);

                Object.keys(instance).forEach((eventName) => {
                    this.on(eventName, instance[eventName]);
                });
                this.plugins.set(plugin[0], instance);
            });

            debug(`Plugins loaded: ${this.plugins.size}`);
        }

        debug('Loading rules');
        this.rules = new Map();
        if (config.rules) {
            const rules = resourceLoader.getRules();
            const rulesIds = Object.keys(config.rules);

            rulesIds.forEach((id: string) => {
                const rule = rules.get(id);
                const ruleOptions = config.rules[id];

                const context = new RuleContext(id, this, getSeverity(ruleOptions), ruleOptions, rule.meta);
                const instance = rule.create(context);

                Object.keys(instance).forEach((eventName) => {
                    this.on(eventName, instance[eventName]);
                });

                this.rules.set(id, instance);
            });

            debug(`Rules loaded: ${this.rules.size}`);
        }

        debug('Loading collector');
        let collectorId,
            collectorConfig;

        if (typeof config.collector === 'string') {
            collectorId = config.collector;
            collectorConfig = {};
        } else {
            collectorId = config.collector.name;
            collectorConfig = config.collector.options;
        }

        const collectors = resourceLoader.getCollectors();

        if (!collectors.has(collectorId)) {
            throw new Error(`Collector "${collectorId}" not found`);
        }

        this.collector = collectors.get(collectorId)(this, collectorConfig);
    }

    /** Reports a message from one of the rules. */
    report(ruleId: string, severity: Severity, node, location: Location, message: string, resource: string) {
        const problem = {
            column: location.column + 1,
            line: location.line,
            message,
            resource,
            ruleId,
            severity
        };

        this.messages.push(problem);
    }

    /** Runs all the configured rules and plugins on a target */
    async executeOn(target: string): Promise<Array<Problem>> {
        const start = Date.now();

        debug(`Starting the analysis on ${target}`);

        await this.collector.collect(target);
        debug(`Total runtime ${Date.now() - start}`);

        return this.messages;
    }
}

export const create = (config): Sonar => {
    const sonar = new Sonar(config);

    return sonar;
};
