#!/usr/bin/env bash

mkdir -p /healthcheck
cd /healthcheck

#§ 'git clone https://github.com/' + d(data.config.repository.github.organization) + '/' + d(data.repository.name) + ' .'
git clone https://github.com/wise-team/steem-wise-test .


date="$(date +"%Y_%m_%d__%H_%M_%S")";
export LOG_BASE_DIR="/logs"
export CURRENT_LOG_DIR="${LOG_BASE_DIR}/${date}"
mkdir "${CURRENT_LOG_DIR}"

echo "Running tests"
export WISE_TEST_LOG_FILE="${CURRENT_LOG_DIR}/result.json"
bash -c "npm run check && npm install --only=production && npm run healthcheck" 2>&1 | tee ${CURRENT_LOG_DIR}/output.txt
echo "Tests done"

# cd /app ## Comment on production
npm run healthcheck-compare-notify # This command compares the result to the previous one and sends the diffś