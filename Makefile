override CXXFLAGS += -std=c++17 -IuWebSockets/src -IuWebSockets/uSockets/src -Iincludes
override LDFLAGS += uWebSockets/uSockets/*.o -lz -lpthread

.PHONY: src
src: uWebSockets/uSockets/context.o uWebSockets/uSockets/epoll_kqueue.o uWebSockets/uSockets/gcd.o uWebSockets/uSockets/libuv.o uWebSockets/uSockets/loop.o uWebSockets/uSockets/socket.o uWebSockets/uSockets/ssl.o .objects/Game.o .objects/StringUtils.o .objects/Player.o .objects/GameServer.o
	$(CXX) -flto $(CXXFLAGS) .objects/*.o -o GameServer $(LDFLAGS);

uWebSockets/uSockets/context.o uWebSockets/uSockets/epoll_kqueue.o uWebSockets/uSockets/gcd.o uWebSockets/uSockets/libuv.o uWebSockets/uSockets/loop.o uWebSockets/uSockets/socket.o uWebSockets/uSockets/ssl.o:
	cd uWebSockets/uSockets && WITH_SSL=0 make

.PHONY: clean
clean:
	rm -f uWebSockets/uSockets/*.o
	rm -f .objects/*.o
	rm -f GameServer

.objects/StringUtils.o: src/StringUtils.cpp src/*.h
	mkdir -p .objects
	$(CXX) $(CXXFLAGS) src/StringUtils.cpp -c -o .objects/StringUtils.o

.objects/Game.o: src/Game.cpp src/*.h
	mkdir -p .objects
	$(CXX) $(CXXFLAGS) src/Game.cpp -c -o .objects/Game.o

.objects/Player.o: src/Player.cpp src/*.h
	mkdir -p .objects
	$(CXX) $(CXXFLAGS) src/Player.cpp -c -o .objects/Player.o

.objects/GameServer.o: src/GameServer.cpp src/*.h
	mkdir -p .objects
	$(CXX) $(CXXFLAGS) src/GameServer.cpp -c -o .objects/GameServer.o

debug: CXXFLAGS += -g
debug: src

release: clean
release: CXXFLAGS += -O2
release: src

all:
	make src
