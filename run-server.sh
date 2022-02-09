#!/bin/bash

while true;
do
    pkill GameServer
    clear
    echo "==============================================="
    make -j$(( $(nproc) / 2 ))
    ./GameServer &
    inotifywait src -e MODIFY
done
