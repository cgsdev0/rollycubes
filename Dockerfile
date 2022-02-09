FROM alpine:edge
RUN apk add g++ libc-dev zlib-dev make openssl-dev
RUN mkdir build

ADD uWebSockets /build/uWebSockets
ADD includes /build/includes
ADD src /build/src
COPY Makefile /build/Makefile

RUN cd /build; ls -la .; make release

ENTRYPOINT ["/build/GameServer"]
