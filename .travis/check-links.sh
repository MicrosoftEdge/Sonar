#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")/.." \
    || exit 1

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

./.travis/is-master.sh \
    || exit 0

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

gem install awesome_bot \
    && find . -name "*.md" \
              -not -path "./node_modules/*" \
              -not -path "./dist/*" \
              -not -path "./coverage/*" \
              -exec awesome_bot \
                        --allow-dupe \
                        --allow-redirect \
                        --set-timeout 150 \
                        --white-list "example1.com,example2.com,example3.com,github.com/sonarwhal/" \
                        {} +;

node .travis/report-broken-links.js
