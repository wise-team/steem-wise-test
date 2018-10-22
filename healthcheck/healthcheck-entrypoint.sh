#!/usr/bin/env bash

mkdir -p /healthcheck
cd /healthcheck

#§ 'git clone https://github.com/' + d(data.config.repository.github.organization) + '/' + d(data.repository.name) + ' . 2>&1'
git clone https://github.com/wise-team/steem-wise-test . 2>&1

#§ 'export HOSTED_LOGS_URL="' + (data.config.test.healthcheck.hostedLogs.tls === "yes" ? "https://" : "http://") + d(data.config.test.healthcheck.hostedLogs.host) + '/"'
export HOSTED_LOGS_URL="https://test.wise.vote/"

date="$(date +"%Y_%m_%d__%H_%M_%S")";
uid="$(od -x /dev/random | head -1 | awk '{OFS="-"; print $2$3,$4,$5,$6,$7$8$9}')"
export LOG_BASE_DIR="/logs"
export CURRENT_LOG_DIR="${LOG_BASE_DIR}/${date}-${uid}"
mkdir "${CURRENT_LOG_DIR}"

echo "Running tests"
export WISE_TEST_LOG_FILE="${CURRENT_LOG_DIR}/result.json"
bash -c "npm run check && npm install --only=production && npm run healthcheck" 2>&1 | tee ${CURRENT_LOG_DIR}/output.txt
echo "Tests done"

# cd /app ## Comment on production
npm run healthcheck-compare-notify 2>&1 # This command compares the result to the previous one and sends the diff
echo "Entrypoint done"