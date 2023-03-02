FROM mcr.microsoft.com/devcontainers/base:ubuntu

RUN apt update && \
  apt install -y build-essential manpages-dev software-properties-common && \
  add-apt-repository ppa:ubuntu-toolchain-r/test && \
  apt update && \
  sudo apt install -y gcc-11 g++-11 && \
  update-alternatives \
    --install /usr/bin/gcc gcc /usr/bin/gcc-9 90 \
    --slave /usr/bin/g++ g++ /usr/bin/g++-9 \
    --slave /usr/bin/gcov gcov /usr/bin/gcov-9 \
    --slave /usr/bin/gcc-ar gcc-ar /usr/bin/gcc-ar-9 \
    --slave /usr/bin/gcc-ranlib gcc-ranlib /usr/bin/gcc-ranlib-9  \
    --slave /usr/bin/cpp cpp /usr/bin/cpp-9 && \
  update-alternatives \
    --install /usr/bin/gcc gcc /usr/bin/gcc-11 110 \
    --slave /usr/bin/g++ g++ /usr/bin/g++-11 \
    --slave /usr/bin/gcov gcov /usr/bin/gcov-11 \
    --slave /usr/bin/gcc-ar gcc-ar /usr/bin/gcc-ar-11 \
    --slave /usr/bin/gcc-ranlib gcc-ranlib /usr/bin/gcc-ranlib-11  \
    --slave /usr/bin/cpp cpp /usr/bin/cpp-11
