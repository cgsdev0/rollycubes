#!/bin/bash

while true;
do
    pkill GameServer
    make debug
    ROLLY_LOCAL_DEV=true ./GameServer &
    inotifywait src -e MODIFY
done
