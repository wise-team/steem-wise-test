# Steem WISE test

[![License](https://img.shields.io/github/license/wise-team/steem-wise-test.svg?style=flat-square)](https://github.com/wise-team/steem-wise-test/blob/master/LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) [![Chat](https://img.shields.io/badge/chat%20on%20discord-6b11ff.svg?style=flat-square)](https://discordapp.com/invite/CwxQDbG) [![Wise operations count](https://img.shields.io/badge/dynamic/json.svg?label=wise%20operations%20count&url=http%3A%2F%2Fsql.wise.vote%3A80%2Foperations%3Fselect%3Dcount&query=%24%5B0%5D.count&colorB=blue&style=flat-square)](http://sql.wise.vote:80/operations?select=moment,delegator,voter,operation_type&order=moment.desc)

This package faciliates two types of tests:

- E2E system tests. Run them with: `$ npm run test`
- Live diagnostics of the on-line setup. Run them with: `$ npm run diagnose`

You can also run them both with `$ npm run testall`. This way of running ensures that diagnostics is run even in case that E2E tests fails.

<!-- Prayer: Gloria Patri, et Filio, et Spiritui Sancto, sicut erat in principio et nunc et semper et in saecula saeculorum. Amen. In te, Domine, speravi: non confundar in aeternum. -->
