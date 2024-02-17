#ifndef INCLUDE_RNG_OVER_TCP_H
#define INCLUDE_RNG_OVER_TCP_H

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netdb.h> 

#include <vector>

void error(const char *msg)
{
    std::cerr << "get rekt lol " << msg << std::endl;
    throw API::GameError({.error = "the dice are currently unavailable, because " + std::string(msg) });
}

struct FortranRngServer {
    std::vector<int> roll() {
        int sockfd, portno, n;
        struct sockaddr_in serv_addr;
        struct hostent *server;

        char buffer;
        portno = 5456;
        sockfd = socket(AF_INET, SOCK_STREAM, 0);
        if (sockfd < 0) {
            error("ERROR opening socket");
            
        }
        server = gethostbyname("random");
        if (server == NULL) {
            error("ERROR, no such host");
        }
        bzero((char *) &serv_addr, sizeof(serv_addr));
        serv_addr.sin_family = AF_INET;
        bcopy((char *)server->h_addr, 
            (char *)&serv_addr.sin_addr.s_addr,
            server->h_length);
        serv_addr.sin_port = htons(portno);
        if (connect(sockfd,(struct sockaddr *) &serv_addr,sizeof(serv_addr)) < 0) { 
            error("ERROR connecting");
        }
        n = read(sockfd,&buffer,1);
        if (n < 0) {
            error("ERROR reading from socket");
        }
        printf("%d\n",buffer);
        int a = buffer % 6 + 1;
        int b = buffer / 6 + 1;
        close(sockfd);
        return {a, b};
    }
};
#endif