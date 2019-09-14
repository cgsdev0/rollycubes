#!/bin/bash

while true;
do
    pkill GameServer
    make
    ./GameServer &
    inotifywait src -e MODIFY
done
