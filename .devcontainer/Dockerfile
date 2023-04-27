FROM mcr.microsoft.com/devcontainers/base:ubuntu

# install gcc 11
RUN apt update && \
  apt install -y cmake build-essential manpages-dev software-properties-common inotify-tools && \
  add-apt-repository ppa:ubuntu-toolchain-r/test && \
  apt update && \
  sudo apt install -y gcc-11 g++-11 && \
  update-alternatives \
    --install /usr/bin/gcc gcc /usr/bin/gcc-11 110 \
    --slave /usr/bin/g++ g++ /usr/bin/g++-11 \
    --slave /usr/bin/gcov gcov /usr/bin/gcov-11 \
    --slave /usr/bin/gcc-ar gcc-ar /usr/bin/gcc-ar-11 \
    --slave /usr/bin/gcc-ranlib gcc-ranlib /usr/bin/gcc-ranlib-11 && \
  update-alternatives --install /usr/bin/cpp cpp /usr/bin/cpp-11 110

# install node and npm v19
RUN curl -fsSL https://deb.nodesource.com/setup_19.x | bash - &&\
  apt-get install -y nodejs

# (courtesy of stackoverflow)
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y