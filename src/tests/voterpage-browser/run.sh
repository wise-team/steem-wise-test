#!/bin/bash
TEST_FOLDER="$PWD/testcafe"
TESTCAFE_ARGS="--no-color firefox"

docker run -v ${TEST_FOLDER}:/tests -it testcafe/testcafe ${TESTCAFE_ARGS} /tests/*.js