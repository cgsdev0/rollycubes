FROM lukemathwalker/cargo-chef:latest-rust-alpine as planner
RUN apk add musl-dev pkgconfig make perl

WORKDIR /usr/build

COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM lukemathwalker/cargo-chef:latest-rust-alpine as builder
RUN apk add musl-dev pkgconfig make perl

WORKDIR /usr/build

ENV SCHEMA_PATH .
COPY --from=planner /usr/build/recipe.json recipe.json
RUN cargo chef cook --recipe-path recipe.json --release

COPY . .
RUN cargo build --release

FROM alpine:edge as prod

COPY --from=builder /usr/build/target/release/auth .

ENTRYPOINT ["./auth"]
