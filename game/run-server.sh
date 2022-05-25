#!/bin/bash

mkdir -p ./secrets
touch ./secrets/.pre-shared-key

while true;
do
    pkill GameServer
    clear
    echo "==============================================="
    make -j$(( $(nproc) / 2 ))
    DEV=true ./GameServer &
    inotifywait -r src -e MODIFY
done
