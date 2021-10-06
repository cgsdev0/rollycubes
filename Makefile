override CXXFLAGS += -std=c++17 -IuWebSockets/src -IuWebSockets/uSockets/src -Iincludes
override LDFLAGS += uWebSockets/uSockets/*.o -lz -lpthread

.PHONY: src
src: uWebSockets/uSockets/context.o uWebSockets/uSockets/epoll_kqueue.o uWebSockets/uSockets/gcd.o uWebSockets/uSockets/libuv.o uWebSockets/uSockets/loop.o uWebSockets/uSockets/socket.o uWebSockets/uSockets/ssl.o Game.o StringUtils.o Player.o GameServer.o
	$(CXX) -flto $(CXXFLAGS) *.o -o GameServer $(LDFLAGS);

uWebSockets/uSockets/context.o uWebSockets/uSockets/epoll_kqueue.o uWebSockets/uSockets/gcd.o uWebSockets/uSockets/libuv.o uWebSockets/uSockets/loop.o uWebSockets/uSockets/socket.o uWebSockets/uSockets/ssl.o:
	cd uWebSockets/uSockets && WITH_SSL=0 make

.PHONY: clean
clean:
	rm -f uWebSockets/uSockets/*.o
	rm -f *.o
	rm -f GameServer

StringUtils.o: src/StringUtils.cpp src/*.h
	$(CXX) $(CXXFLAGS) src/StringUtils.cpp -c -o StringUtils.o

Game.o: src/Game.cpp src/*.h
	$(CXX) $(CXXFLAGS) src/Game.cpp -c -o Game.o

Player.o: src/Player.cpp src/*.h
	$(CXX) $(CXXFLAGS) src/Player.cpp -c -o Player.o

GameServer.o: src/GameServer.cpp src/*.h
	$(CXX) $(CXXFLAGS) src/GameServer.cpp -c -o GameServer.o

debug: CXXFLAGS += -g
debug: src

release: clean
release: CXXFLAGS += -O2
release: src

all:
	make src
