#!/usr/bin/env bash


####
## Setup repository volumes
##  This can be used to test the system using specific version/branch/commit of each repository.
####
DEFAULT_REPO_PATH_CORE="${PWD}/../steem-wise-core"
DEFAULT_REPO_PATH_CLI="${PWD}/../steem-wise-cli"
DEFAULT_REPO_PATH_VOTER_PAGE="${PWD}/../steem-wise-voter-page"

if [ -z "$REPO_PATH_CORE" ]; then REPO_PATH_CORE=$DEFAULT_REPO_PATH_CORE; fi
if [ -z "$REPO_PATH_CLI" ]; then REPO_PATH_CLI=$DEFAULT_REPO_PATH_CLI; fi
if [ -z "$REPO_PATH_VOTER_PAGE" ]; then REPO_PATH_VOTER_PAGE=$DEFAULT_REPO_PATH_VOTER_PAGE; fi

VOLUME_REPO_CORE="$REPO_PATH_CORE:/app/repositories/steem-wise-core:ro"
VOLUME_REPO_CLI="$REPO_PATH_CLI:/app/repositories/steem-wise-cli:ro"
VOLUME_REPO_VOTER_PAGE="$REPO_PATH_VOTER_PAGE:/app/repositories/steem-wise-voter-page:ro"

echo "Steem-wise-core volume: $VOLUME_REPO_CORE"
echo "Steem-wise-cli volume: $VOLUME_REPO_CLI"
echo "Steem-wise-voter-page volume: $VOLUME_REPO_VOTER_PAGE"

####
## Docker & gradle settings
####
IMAGE=gradle:4.9-jdk8
CMD="git --version && ls && ls ./repositories && gradle -i clean test"

WORKDIR="/app"
VOLUME_WORKDIR="${PWD}:$WORKDIR"
VOLUME_DOCKER_SOCK="/var/run/docker.sock:/var/run/docker.sock"
VOLUME_GRADLE_CACHE="wisetest_gradlehome1:/home/gradle/.gradle"


####
## command
####
docker run -it -w $WORKDIR \
    -v $VOLUME_WORKDIR -v $VOLUME_DOCKER_SOCK -v $VOLUME_GRADLE_CACHE \
    -v $VOLUME_REPO_CORE -v $VOLUME_REPO_CLI -v $VOLUME_REPO_VOTER_PAGE \
    $IMAGE bash -o pipefail +x -c "$CMD"
