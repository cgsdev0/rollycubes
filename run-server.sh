#!/bin/bash

while true;
do
    pkill GameServer
    clear
    echo "====================================================="
    make -j$(( $(nproc) / 2 )) || echo -e '\a'
    ./GameServer &
    inotifywait src -e MODIFY
done
