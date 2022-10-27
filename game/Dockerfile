FROM alpine:edge as build
RUN apk add g++ libc-dev zlib-dev make openssl-dev
RUN mkdir build

ADD uWebSockets /build/uWebSockets
ADD includes /build/includes
COPY Makefile /build/Makefile
ADD src /build/src

RUN cd /build; ls -la .; make release

FROM alpine:edge as prod
RUN apk add libstdc++ libgcc openssl-dev
COPY --from=build /build/GameServer .
COPY entry.sh .

ENTRYPOINT ["./entry.sh"]
