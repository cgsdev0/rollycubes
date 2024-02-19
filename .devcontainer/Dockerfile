FROM mcr.microsoft.com/devcontainers/base:ubuntu

# install stuff
RUN apt update && \
  apt install -y manpages-dev software-properties-common inotify-tools netcat

RUN apt install curl -y
RUN curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install linux \
  --extra-conf "sandbox = false" \
  --init none \
  --no-confirm
ENV PATH="${PATH}:/nix/var/nix/profiles/default/bin"
