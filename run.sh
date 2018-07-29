#!/usr/bin/env bash

IMAGE=gradle:4.9-jdk8
CMD="git --version && ls && gradle -i clean test"

WORKDIR="/app"
VOLUME_WORKDIR="${PWD}:$WORKDIR"
VOLUME_DOCKER_SOCK="/var/run/docker.sock:/var/run/docker.sock"
VOLUME_GRADLE_CACHE="wisetest_gradlehome1:/home/gradle/.gradle"

docker run -it -w $WORKDIR -v $VOLUME_WORKDIR -v $VOLUME_DOCKER_SOCK -v $VOLUME_GRADLE_CACHE $IMAGE bash -c "$CMD"
