FROM gradle:4.9-jdk8

COPY --from=library/docker:18.06.0-ce /usr/local/bin/docker /usr/bin/docker
COPY --from=docker/compose:1.22.0 /usr/local/bin/docker-compose /usr/bin/docker-compose
