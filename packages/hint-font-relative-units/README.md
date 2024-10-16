# font-relative-units (`@hint/hint-font-relative-units`)

Ensure font styles use relative units instead of pixels.

## Why is this important?

If website stylesheets define certain styles in pixels, they do not reflect
changes to root-level font size set in browser defaults, custom user styles,
or browser plugins. Some people benefit from altering font size, line height,
and letter spacing to make text easier to read.

## What does the hint check?

This hint examines `css` files and checks that the following properties are not
defined in pixels:

- `font-size`
- `line-height`
- `letter-spacing`

### Examples that **trigger** the hint

```css
font-size: 16px;
line-height: 24px;
letter-spacing: 2px;
```

### Examples that **pass** the hint

```css
font-size: 1.2em;
line-height: 2em;
letter-spacing: 0.15em;
```

## How to use this hint?

To use it you will have to install it via `npm`:

```bash
npm install @hint/hint-font-relative-units
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
        "font-relative-units": "error"
    },
    ...
}
```

## Further Reading

* [WCAG Text Spacing requirement][wcag-1-4-12]

<!-- Link labels: -->

[wcag-1-4-12]: https://www.w3.org/WAI/WCAG21/Understanding/text-spacing.html
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
