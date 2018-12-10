# CSS (`@hint/parser-css`)

The `CSS` parser is built on top of [PostCSS][postcss] so hints can
analyze `CSS` files.

To use it you will have to install it via `npm`:

```bash
npm install @hint/parser-css
```

Note: You can make `npm` install it as a `devDependency` using the
`--save-dev` parameter, or to install it globally, you can use the
`-g` parameter. For other options see [`npm`'s
documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        ...
    },
    "parsers": ["css"],
    ...
}
```

## Events emitted

This `parser` emits the following events:

* `parse::start::css` of type `Event` which contains the following information:

  * `resource`: the resource we are going to parse.

* `parse::end::css` of type `StyleParse` which has the following information:

  * `ast`: a PostCSS `Root` object containing the AST.
    See the [PostCSS `walk*` APIs][postcss-walk] for help navigating
    the AST.
  * `code`: a string containing the raw stylesheet source code.
  * `resource`: the parsed resource. If the CSS is in a `style tag`
  and not a file, the value will be `Inline CSS`.

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[postcss]: https://postcss.org/
[postcss-walk]: https://api.postcss.org/Container.html#walk
