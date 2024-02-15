FROM alpine:edge as build
RUN apk add gfortran musl-dev
RUN apk add make git
RUN apk add autoconf automake pkgconf libtool

COPY src /build/src

RUN cd /build/src/ && make

ENTRYPOINT ["/build/src/RandomServer"]
