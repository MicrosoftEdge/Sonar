# Inline CSS Styles

This hint checks if the HTML is using inline CSS styles.

## Why is this important?

The use of inline CSS styles prevent the reuse of the styles anywhere else.
The html markup of the page becomes hard to read for the naked eye. The inline
CSS styles are hard to maintain and does not provide consistency since they are
not stored in a single place. The inline styles are repeated downloaded by the
client on every request since it does not provide you with browser cache
advantage. Inline styles take precedence of external stylesheets, this could
accidentally override styles that you did not intend to overwrite.

## What does the hint check?

This hint checks if the HTML is using inline CSS styles.

Examples of inline CSS styles

`<div style="color: blue;"></div>`

`<style></style>`

It checks that no element has the attribute `style`.
It also checks that no internal styles `<style>` is used.

### Examples that **trigger** the hint

The hint will trigger if any element have the attribute `style`

```html
<div style="color: blue;"></div>
```

The hint will trigger if you use internal styles, this is disabled by default

```html
<style>
    div {
        color: blue;
    }
</style>
```

### Examples that **pass** the hint

No inline style in the element

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        ...
    </head>
    <body>
        ...
        <div>Hi styles</div>
    </body>
</html>
```

## Can the hint be configured?

`requireNoStyleElement` can be set to `true` to disallow and require the use of
no `style` tag.

In the [`.hintrc`][hintrc] file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "no-inline-styles": [ "warning", {
            "requireNoStyleElement": true
        }],
        ...
    },
    ...
}
```

## How to use this hint?

Install this hint with:

```bash
npm install @hint/hint-no-inline-styles --save-dev
```

To use it, activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "parsers": [...],
    "hints": {
        "no-inline-styles": "error",
        ...
    },
    ...
}
```

## Further Reading

- [Why CSS inline styles are considered harmful for accessibility][why-css-inline-styles-are-considered-harmful-accessibility]

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[why-css-inline-styles-are-considered-harmful-accessibility]: https://www.nomensa.com/blog/2011/css-inline-styles-and-why-they-are-considered-harmful-accessibility
