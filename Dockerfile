FROM alpine:edge as build
RUN apk add g++ libc-dev zlib-dev make openssl-dev
RUN mkdir build

ADD uWebSockets /build/uWebSockets
ADD includes /build/includes
ADD src /build/src
COPY Makefile /build/Makefile

RUN cd /build; ls -la .; make release

FROM alpine:edge as prod
RUN apk add libstdc++ libgcc
COPY --from=build /build/GameServer .

ENTRYPOINT ["./GameServer"]
