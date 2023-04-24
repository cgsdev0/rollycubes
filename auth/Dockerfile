FROM rust:1.69-alpine as build
RUN apk add musl-dev pkgconfig make perl

WORKDIR /usr/build

COPY migrations migrations
COPY src src
COPY .cargo .cargo
COPY Cargo.* .
COPY achievements.json .

RUN cargo build --release

FROM alpine:edge as prod

COPY --from=build /usr/build/target/release/auth .

ENTRYPOINT ["./auth"]
