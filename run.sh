#!/usr/bin/env bash
set -e # fail on first error
set -x

###
### Remember, you have to build the image first.
###
###

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

## Load config
source "${DIR}/config.sh"
if [ -z "$WISETEST_CONFIG_LOADED" ]; then echo "Config not loaded. Exiting" && exit 1; fi

####
## Docker & gradle settings
####
IMAGE=gradle:4.9-jdk8
CMD="pwd && ls && ./scripts/docker-entrypoint.sh"

VOLUME_WORKDIR="${DIR}:${WORKDIR}"
VOLUME_DOCKER_SOCK="/var/run/docker.sock:/var/run/docker.sock"
VOLUME_GRADLE_CACHE="wisetest_gradlehome1:/home/gradle/.gradle"

####
## Setup repository volumes
##  This can be used to test the system using specific version/branch/commit of each repository.
####

if [ -z "$REPO_PATH_CORE" ]; then REPO_PATH_CORE="$DEFAULT_REPO_PATH_CORE"; fi
if [ -z "$REPO_PATH_CLI" ]; then REPO_PATH_CLI="$DEFAULT_REPO_PATH_CLI"; fi
if [ -z "$REPO_PATH_VOTER_PAGE" ]; then REPO_PATH_VOTER_PAGE="$DEFAULT_REPO_PATH_VOTER_PAGE"; fi

VOLUME_REPO_CORE="${REPO_PATH_CORE}:${REPOSITORIES_DIR}/${REPO_DIRNAME_CORE}:ro"
VOLUME_REPO_CLI="${REPO_PATH_CLI}:${REPOSITORIES_DIR}/${REPO_DIRNAME_CLI}:ro"
VOLUME_REPO_VOTER_PAGE="${REPO_PATH_VOTER_PAGE}:${REPOSITORIES_DIR}/${REPO_DIRNAME_VOTER_PAGE}:ro"

echo "Steem-wise-core volume: $VOLUME_REPO_CORE"
echo "Steem-wise-cli volume: $VOLUME_REPO_CLI"
echo "Steem-wise-voter-page volume: $VOLUME_REPO_VOTER_PAGE"


####
## command
####
docker run -it -w $WORKDIR -u root \
    -v $VOLUME_WORKDIR -v $VOLUME_DOCKER_SOCK -v $VOLUME_GRADLE_CACHE \
    -v $VOLUME_REPO_CORE -v $VOLUME_REPO_CLI -v $VOLUME_REPO_VOTER_PAGE \
    $IMAGE bash -o pipefail -x -c "$CMD"
