#!/bin/bash

while true;
do
    pkill GameServer
    make debug
    ./GameServer &
    inotifywait src -e MODIFY
done
