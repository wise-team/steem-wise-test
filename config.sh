#!/usr/bin/env bash
set -e # fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

export DOCKER_IMAGE_NAME="steem-wise-test"
export WORKDIR="/app"

export DEFAULT_REPO_PATH_CORE="${DIR}/../steem-wise-core"
export DEFAULT_REPO_PATH_CLI="${DIR}/../steem-wise-cli"
export DEFAULT_REPO_PATH_VOTER_PAGE="${DIR}/../steem-wise-voter-page"

export REPOSITORIES_DIR="/repositories"

export REPO_DIRNAME_CORE="steem-wise-core"
export REPO_DIRNAME_CLI="steem-wise-cli"
export REPO_DIRNAME_VOTER_PAGE="steem-wise-voter-page"

export WISETEST_CONFIG_LOADED="yes"
