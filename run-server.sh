#!/bin/bash

while true;
do
    pkill GameServer
    make debug || echo -e '\a'
    ./GameServer &
    inotifywait src -e MODIFY
done
