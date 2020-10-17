FROM ubuntu:20.10
ADD GameServer /bin/GameServer
EXPOSE 3001
ENTRYPOINT ["/bin/GameServer"]
