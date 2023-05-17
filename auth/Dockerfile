FROM lukemathwalker/cargo-chef:latest-rust-alpine as planner
RUN apk add musl-dev openssl-dev

WORKDIR /usr/build

COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM lukemathwalker/cargo-chef:latest-rust-alpine as builder
RUN apk add musl-dev openssl-dev

WORKDIR /usr/build

COPY --from=planner /usr/build/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

COPY . .
RUN cargo build --release

FROM alpine:edge as prod
RUN apk add openssl-dev

COPY --from=builder /usr/build/target/release/auth .

ENTRYPOINT ["./auth"]
