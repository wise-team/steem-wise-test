/**
 * This file is automatically generated by https://github.com/wise-team/wise-ci.
 * Please do not change contents between templates.
 */

/*§ allowUndefined(); outputConfig(data) §*/
export const data = {
  "config": {
    "license": {
      "code": "MIT",
    },
    "wise": {
      "version": "1.2.2",
      "homepage": "https://wise.vote/",
    },
    "steem": {
      "minimalApiBlockchainVersion": "0.20.5",
      "minimalApiHardforkVersion": "0.20.0",
      "apis": [ {
  "url": "https://api.steemit.com",
  "get_block": true,
}, {
  "url": "https://steemd.minnowsupportproject.org",
  "get_block": true,
}, {
  "url": "https://rpc.buildteam.io",
  "get_block": true,
}, {
  "url": "https://rpc.steemliberator.com",
  "get_block": true,
}, {
  "url": "https://steemd.privex.io",
  "get_block": true,
} ],
    },
    "witness": {
      "account": "wise-team",
    },
    "team": {
      "name": "Wise Team",
      "website": {
        "url": "https://wise-team.io/",
      },
      "steem": {
        "account": "wise-team",
      },
      "securityEmail": "jedrzejblew@gmail.com",
    },
    "npm": {
      "node": {
        "version": "9.11",
      },
      "keywords": [ "steem", "blockchain", "wise" ],
      "author": "The Wise Team (https://wise-team.io/)",
    },
    "docker": {
      "imageHostname": "wise",
      "maintainer": "The Wise Team (https://wise-team.io/) <jedrzejblew@gmail.com>",
      "labels": {
        "domain": "vote.wise",
        "defaultLabels": [ () => "maintainer=\"The Wise Team (https://wise-team.io/) <jedrzejblew@gmail.com>\"", () => "vote.wise.wise-version=\"1.2.2\"", () => "vote.wise.license=\"MIT\"", () => "vote.wise.repository=\"steem-wise-test\"" ],
      },
      "generateDockerfileFrontMatter": () => "LABEL maintainer=\"The Wise Team (https://wise-team.io/) <jedrzejblew@gmail.com>\"\nLABEL vote.wise.wise-version=\"1.2.2\"\nLABEL vote.wise.license=\"MIT\"\nLABEL vote.wise.repository=\"steem-wise-test\"",
    },
    "repository": {
      "github": {
        "organization": "wise-team",
      },
      "readme": {
        "badges": [ () => "[![License](https://img.shields.io/github/license/wise-team/steem-wise-test.svg?style=flat-square)](https://github.com/wise-team/steem-wise-test/blob/master/LICENSE)", () => "[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)", () => "[![Chat](https://img.shields.io/badge/chat%20on%20discord-6b11ff.svg?style=flat-square)](https://discordapp.com/invite/CwxQDbG)", () => "[![Wise operations count](https://img.shields.io/badge/dynamic/json.svg?label=wise%20operations%20count&url=https%3A%2F%2Fsql.wise.vote%3A%2Foperations%3Fselect%3Dcount&query=%24%5B0%5D.count&colorB=blue&style=flat-square)](https://sql.wise.vote/operations?select=moment,delegator,voter,operation_type&order=moment.desc)" ],
        "generateHelpUsMd": () => "\n## Contribute to steem Wise\n\nWe welcome warmly:\n\n- Bug reports via [issues](https://github.com/wise-team/steem-wise-test).\n- Enhancement requests via via [issues](https://github.com/wise-team/steem-wise-test/issues).\n- [Pull requests](https://github.com/wise-team/steem-wise-test/pulls)\n- Security reports to _jedrzejblew@gmail.com_.\n\n**Before** contributing please **read [Wise CONTRIBUTING guide](https://github.com/wise-team/steem-wise-core/blob/master/CONTRIBUTING.md)**.\n\nThank you for developing WISE together!\n\n\n\n## Like the project? Let @wise-team become your favourite witness!\n\nIf you use & appreciate our software — you can easily support us. Just vote for \"wise-team\" to become you one of your witnesses. You can do it here: [https://steemit.com/~witnesses](https://steemit.com/~witnesses).\n\n",
        "generateHelpMd": () => "\n## Where to get help?\n\n- Feel free to talk with us on our chat: [https://discordapp.com/invite/CwxQDbG](https://discordapp.com/invite/CwxQDbG) .\n- You can read [The Wise Manual](https://wise.vote/introduction)\n- You can also contact Jędrzej at jedrzejblew@gmail.com (if you think that you found a security issue, please contact me quickly).\n\nYou can also ask questions as issues in appropriate repository: See [issues for this repository](https://github.com/wise-team/steem-wise-test/issues).\n\n",
        "generateDefaultBadges": () => "\n[![License](https://img.shields.io/github/license/wise-team/steem-wise-test.svg?style=flat-square)](https://github.com/wise-team/steem-wise-test/blob/master/LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) [![Chat](https://img.shields.io/badge/chat%20on%20discord-6b11ff.svg?style=flat-square)](https://discordapp.com/invite/CwxQDbG) [![Wise operations count](https://img.shields.io/badge/dynamic/json.svg?label=wise%20operations%20count&url=https%3A%2F%2Fsql.wise.vote%3A%2Foperations%3Fselect%3Dcount&query=%24%5B0%5D.count&colorB=blue&style=flat-square)](https://sql.wise.vote/operations?select=moment,delegator,voter,operation_type&order=moment.desc)\n",
      },
      "repositories": {
        "core": {
          "name": "steem-wise-core",
          "npmPackageName": "steem-wise-core",
          "isNode": true,
          "isNpm": true,
          "nodePath": "",
        },
        "cli": {
          "name": "steem-wise-cli",
          "isNode": true,
          "npmPackageName": "steem-wise-cli",
          "isNpm": true,
          "nodePath": "",
        },
        "voterPage": {
          "name": "steem-wise-voter-page",
          "isNode": false,
          "isNpm": true,
          "nodePath": "",
        },
        "manual": {
          "name": "steem-wise-manual",
          "isNode": false,
          "isNpm": false,
          "nodePath": "",
        },
        "sql": {
          "name": "steem-wise-sql",
          "isNode": true,
          "isNpm": true,
          "nodePath": "/pusher",
        },
        "test": {
          "name": "steem-wise-test",
          "isNode": true,
          "isNpm": true,
          "nodePath": "",
        },
        "hub": {
          "name": "wise-hub",
          "isNode": true,
          "isNpm": true,
          "nodePath": "/wise-hub-frontend",
        },
        "ci": {
          "name": "wise-ci",
          "isNode": true,
          "isNpm": true,
          "nodePath": "",
        },
      },
    },
    "communitation": {
      "chat": {
        "name": "discord",
        "url": "https://discordapp.com/invite/CwxQDbG",
      },
    },
    "sql": {
      "pusher": {
        "requestConcurrencyPerNode": 3,
        "blockProcessingTimeoutMs": 9000,
      },
      "endpoint": {
        "host": "sql.wise.vote",
        "schema": "https",
      },
      "docker": {
        "services": {
          "db": {
            "name": "wise_sql_db",
            "container": "wise_sql_db",
          },
          "pusher": {
            "name": "wise_sql_pusher",
            "container": "wise-sql-pusher",
            "image": "wise/sql-pusher",
          },
          "postgrest": {
            "name": "postgrest",
            "container": "wise-sql-postgrest",
          },
        },
        "volumes": {
          "db": {
            "name": "pgdata",
          },
        },
      },
    },
    "manual": {
      "url": "https://wise.vote/introduction",
    },
    "votingPage": {
      "url": "https://wise.vote/voting-page",
    },
    "hub": {
      "production": {
        "host": "hub.wise.vote",
        "schema": "https",
      },
      "visual": {
        "read": {
          "lastActivity": {
            "numOfOpsToShow": 50,
            "trxLinkBase": "https://steemd.com/tx/{trx}",
            "articleLinkBase": "https://steemit.com/@{author}/{permlink}",
          },
        },
      },
      "docker": {
        "services": {
          "frontend": {
            "name": "frontend",
            "container": "wise-hub-frontend",
            "image": "wise/wise-hub-frontend",
          },
        },
      },
    },
    "test": {
      "healthcheck": {
        "metrics": {
          "periodMs": 259200000,
        },
        "inBrowserTests": {
          "enabled": false,
          "browsers": [ "firefox" ],
        },
        "api": {
          "testThroughProxy": false,
        },
        "log": {
          "dockerVolume": "wise.test.logs",
        },
        "slack": {
          "mentionUsers": [ "jblew" ],
          "webhookUrlFilePath": "/opt/wise/slackWebhook.url",
        },
      },
      "websites": {
        "brokenLinks": {
          "excludes": [ "*linkedin.com*", "https://sql.wise.vote/operations?select=moment,delegator,voter,operation_type&order=moment.desc" ],
        },
        "forbiddenPhrases": [ "noisy-witness", "noisy witness", "smartvote", "muon" ],
      },
    },
    "websites": [ {
  "url": "https://wise.vote/",
  "checkBrokenLinks": true,
}, {
  "url": "https://wise-team.io/",
  "checkBrokenLinks": true,
}, {
  "url": "https://wise.vote/introduction",
  "checkBrokenLinks": false,
} ],
    "steemconnect": {
      "owner": {
        "account": "wise.vote",
        "profile": {
          "name": "Wise",
          "website": "https://wise.vote/",
        },
        "last_account_update": "2018-07-06T09:47:06",
        "last_owner_update": "1970-01-01T00:00:00",
        "keys": {
          "owner": "STM5qMTthdfQMQREDNxjz3zsKBRY15SfLToNnzPM7RwWddiHwD3Xq",
          "active": "STM8jjcuFn1F96eq8ssbtT7UDJpu8AmkR4sgXBhPT7TCUVaozb57q",
          "posting": "STM7NuCMemrJ6FJza1Ky733AAbwL5dnzAE7jnLEi4waroH8ZoQCof",
          "memo": "STM7F9UXfVpwCbyqonyJawET2WC3jwnV2UT16ubkA7fgqmBDfYK4w",
        },
        "recovery_account": "noisy",
      },
      "app": {
        "account": "wisevote.app",
        "last_account_update": "1970-01-01T00:00:00",
        "last_owner_update": "1970-01-01T00:00:00",
        "keys": {
          "owner": "STM82hFUKjN2j8KGqQ8rz9YgFAbMrWFuCPkabtrAnUfV2JQshNPLz",
          "active": "STM78mV5drS6a5SredobAJXvzZv7tvBo4Cj15rumRcBtMzTWT173a",
          "posting": "STM6ZVzWQvbYSzVpY2PRJHu7QSASVy8aB8xSVcJgx5seYGHPFvJkZ",
          "memo": "STM7o1DigBaUEF28n2ap5PeY9Jqhndz3zWmF7xZ3zfRgSqeLaMnyA",
        },
        "recovery_account": "wise.vote",
      },
      "settings": {
        "id": 493,
        "client_id": "wisevote.app",
        "owner": "wise.vote",
        "redirect_uris": [ "https://wise.vote/voting-page/", "https://hub.wise.vote/", "http://localhost:8080/" ],
        "name": "WISE",
        "description": "Vote delegation system for STEEM blockchain: https://wise.vote/",
        "icon": "https://wise.vote/assets/wise-full-color-icon-128.png",
        "website": "https://wise.vote/",
        "beneficiaries": null,
        "is_public": false,
        "is_disabled": false,
        "created_at": "2018-07-06T09:53:05.827Z",
        "updated_at": "2018-09-21T13:20:47.021Z",
      },
    },
  },
  "repository": {
    "name": "steem-wise-test",
  },
};
/*§§.*/
