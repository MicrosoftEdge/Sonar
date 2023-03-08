# detect-css-reflows (`hint-detect-css-reflows`)

Let the developers know of what operations will be triggered by changes
on the cssproperties

## Why is this important?

Explain why this hint is important for your users

## What does the hint check?

A bit more detail of what the hint does.

### Examples that **trigger** the hint

A list of code examples that will fail this hint.
It's good to put some edge cases in here.

### Examples that **pass** the hint

A list of code examples that will pass this hint.
It's good to put some edge cases in here.

## Can the hint be configured?

If this hint allows some configuration, please put the format and
options for the user.

## How to use this hint?

To use it you will have to install it via `npm`:

```bash
npm install hint-detect-css-reflows
```

Note: You can make `npm` install it as a `devDependency` using the `--save-dev`
parameter, or to install it globally, you can use the `-g` parameter. For
other options see
[`npm`'s documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.hintrc`][hintrc]
configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "parsers": [...],
    "hints": {
        "detect-css-reflows": "error"
    },
    ...
}
```

## Further Reading

What can the user read to know more about this subject?

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/