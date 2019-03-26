# Develop a formatter

A `formatter` formats the results of `webhint`: from crafting `JSON` to
connecting to a database and storing the results in it.

To create one, you will need a class that implements the interface
`IFormatter`. This inteface has an `async` method `format` that
receives an array of `message`s if any issues have been found.

The following is a basic `formatter` that `.stringify()`s the results:

<!-- eslint-disable require-await -->

```js
export default class JSONFormatter implements IFormatter {
    public async format(messages: Problem[], options: FormatterOptions = {}) {
        console.log(JSON.stringify(messages, null, 2));
    }
}
```

A `message` looks like this:

```json
{
    "column": "number", // The column number where the issue was found if applicable.
    "line": "number", // The line number where the issue was found if applicable.
    "message": "string", // The human friendly detail of the error.
    "resource": "string", // The URL or name of the asset with the issue.
    "severity": "number" // 1 (warning), 2 (error).
}
```

With this, you can group the issues by `resource` and sort them by
`line` and `column`. Using the previous example and `lodash` will
look as follows:

<!-- eslint-disable require-await -->

```js
import * as _ from 'lodash';

export default class JSONFormatter implements IFormatter {
    /** Format the problems grouped by `resource` name and sorted by line and column number */
    public async format(messages: Problem[], options: FormatterOptions = {}) {
        const resources = _.groupBy(messages, 'resource');

        _.forEach(resources, (msgs, resource) => {
            const sortedMessages = _.sortBy(msgs, ['line', 'column']);

            console.log(`${resource}: ${msgs.length} issues`);
            console.log(JSON.stringify(sortedMessages, null, 2));
        });
    }
}
```

The `options` parameter is as follows:

```ts
export type FormatterOptions = {
    /** Start time (queued in online scanner) ISO string */
    date?: string;
    /** The file to use to output the results requested by the user */
    output?: string;
    /** The time it took to analyze the URL */
    scanTime?: number;
    /** The analyzed URL */
    target?: string;
    /** webhint's version */
    version?: string;
};
```

You can always check the code of any of the official `formatter`s for
more complex scenarios.
