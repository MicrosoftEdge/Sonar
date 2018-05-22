# Disallow `P3P` headers (`@sonarwhal/rule-no-p3p`)

`no-p3p` disallows the use of `P3P` in any form (headers, `rel` attribute, and
`well-known` location).

## Why is this important?

[P3P][p3p spec] (Platform for Privacy Preferences Project) is a deprecated
technology meant to allow browsers to programmatically check privacy policies.

Microsoft Internet Explorer was the most popular browser implementing `P3P`.
With Windows 10, `P3P`'s support was removed entirely from IE 11 and has
[minimal servicing for other versions of Windows][p3p not supported].
Other popular browsers never implemented or removed this feature before
Microsoft did.

On top of the lack of support, if the header is sent and it's not kept in sync
with normal human-readable privacy policies, it may be a cause of legal
confusion, which might open up legal risks. Please check with a local lawyer to
see if that's the case in your country.

Additionally, [studies][research] have detected that about 33% of sites using
P3P don't have a valid configuration. In some cases the value was used to
circunvent IE cookie blocking (and thus rendering P3P inefective). Others it
was typos and errors in the tokens (but still invalid policies).

Because of all the above reasons it's suggested to not use `P3P` anymore.

## What does the rule check?

There are 3 ways in which a site can define the `P3P` policy:

* [`well-known` location][well-known]
* [`P3P` HTTP header][p3p header]
* HTML link tag and [`rel="P3Pv1"` attribute][p3p link]

This rule checks that a site doesn't use any of these.

### Examples that **trigger** the rule

Note: the following examples are case-insensitive.

The `P3P` header is sent:

```text
HTTP/... 200 OK

...
p3p: CP="NON DSP COR CURa PSA PSD OUR BUS NAV STA"
...
```

The `P3P` header is sent with non-P3P contents:

```text
HTTP/... 200 OK

...
p3p: <Random or empty value>
...
```

There is a `link` tag with `rel="P3Pv1"`:

```html
...
<link rel="P3Pv1" href="/p3p.xml">
...
```

The server responds to `/w3c/p3p.xml` with any content:

```text
HTTP/... 200 OK
```

### Examples that **pass** the rule

The `P3P` header is not sent:

```text
HTTP/... 200 OK
date: Wed, 16 May 1971 16:21:53 GMT
server: Apache
cache-control: max-age=300
vary: User-Agent
content-type: text/html; charset=UTF-8
...
```

There isn't any `<link rel="P3Pv1">` in the HTML.

The server doesn't have content in `/w3c/p3p.xml`:

```text
HTTP/... 404 OK
```

## Further Reading

* [Quick look at P3P][quick look]
* [Wikipedia's P3P page][wikipedia]

<!-- Link labels -->

[p3p header]: https://www.w3.org/TR/P3P11/#syntax_ext
[p3p link]: https://www.w3.org/TR/P3P11/#syntax_link
[p3p spec]: https://www.w3.org/TR/P3P11/
[p3p not supported]: https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/compatibility/mt146424(v=vs.85)
[quick look]: https://blogs.msdn.microsoft.com/ieinternals/2013/09/17/a-quick-look-at-p3p/
[research]: https://www.cylab.cmu.edu/_files/pdfs/tech_reports/CMUCyLab10014.pdf
[support]: https://en.wikipedia.org/wiki/P3P#User_agent_support
[well-known]: https://www.w3.org/TR/P3P11/#Well_Known_Location
[wikipedia]: https://en.wikipedia.org/wiki/P3P#User_agent_support
