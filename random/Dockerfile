FROM alpine:edge as build
RUN apk add gfortran musl-dev
RUN apk add make git
RUN apk add autoconf automake pkgconf libtool

COPY src /build/src
COPY Makefile /build/

RUN cd /build/ && make clean && make

ENTRYPOINT ["/build/RandomServer"]
