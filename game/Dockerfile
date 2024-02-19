FROM alpine:edge as build
RUN apk add g++ libc-dev zlib-dev make openssl-dev
RUN apk add cmake wget tar linux-headers curl-dev

RUN mkdir build

ARG civetweb_civetweb_ver=v1.15
ARG jupp0r_prometheuscpp_ver=v1.1.0

ADD uWebSockets /build/uWebSockets
ADD includes /build/includes
COPY Makefile /build/Makefile
ADD src /build/src

RUN set -x && \
    wget https://github.com/jupp0r/prometheus-cpp/archive/refs/tags/${jupp0r_prometheuscpp_ver}.tar.gz && \
    tar xvf ${jupp0r_prometheuscpp_ver}.tar.gz && cd prometheus-cpp*/3rdparty && \
    wget https://github.com/civetweb/civetweb/archive/refs/tags/${civetweb_civetweb_ver}.tar.gz && \
    tar xvf ${civetweb_civetweb_ver}.tar.gz && mv civetweb-*/* civetweb && cd .. && \
    mkdir build && cd build && cmake -DCMAKE_BUILD_TYPE=Release -DENABLE_TESTING=OFF .. && \
    make -j4 && make install && \
    cd .. && rm -rf * && \
    set +x

RUN cd /build; ls -la .; make -j4 release

FROM alpine:edge as prod
RUN apk add libstdc++ libgcc openssl-dev
COPY --from=build /build/GameServer .

ENTRYPOINT ["./GameServer"]
