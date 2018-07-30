#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

export WORKDIR="/app"

export DEFAULT_REPO_PATH_CORE="${DIR}/../steem-wise-core"
export DEFAULT_REPO_PATH_CLI="${DIR}/../steem-wise-cli"
export DEFAULT_REPO_PATH_VOTER_PAGE="${DIR}/../steem-wise-voter-page"

export REPOSITORIES_DIR="/repositories"

export REPO_DIRNAME_CORE="steem-wise-core"
export REPO_DIRNAME_CLI="steem-wise-cli"
export REPO_DIRNAME_VOTER_PAGE="steem-wise-voter-page"