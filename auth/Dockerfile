FROM rust:1.69-alpine as build
RUN apk add musl-dev pkgconfig make openssl-dev

WORKDIR /usr/build

COPY migrations migrations
COPY src src
COPY .cargo .cargo
COPY Cargo.* .
COPY achievements.json .

RUN cargo build

FROM rust:1.67-alpine as prod

COPY --from=build /usr/build/target/debug/auth .

ENTRYPOINT ["./auth"]
