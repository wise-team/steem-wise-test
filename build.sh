#!/usr/bin/env bash
set -e # fail on first error

###
### Remember, you have to build the image first.
###
###

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

## Load config
source "${DIR}/config.sh"
if [ -z "$WISETEST_CONFIG_LOADED" ]; then echo "Config not loaded. Exiting" && exit 1; fi

docker build --rm -t $DOCKER_IMAGE_NAME .