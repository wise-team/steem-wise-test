#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

export WISE_ENVIRONMENT_TYPE="staging"
"${DIR}/healthcheck-run.sh"