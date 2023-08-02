#!/usr/bin/env bash

mkdir -p ./secrets
mkdir -p ./data
touch ./secrets/.pre-shared-key

while true;
do
    pkill GameServer
    echo "==============================================="
    make -j$(( $(nproc) / 2 ))
    DEV=true ./GameServer &
    inotifywait -r src -e MODIFY
done
