SRC_FILES := GameServer Player Game
override CXXFLAGS += -std=c++17 -IuWebSockets/src -IuWebSockets/uSockets/src -Iincludes
override LDFLAGS += uWebSockets/uSockets/*.o -lz

.PHONY: src
src:
	cd uWebSockets/uSockets && WITH_SSL=0 make
	$(CXX) -flto -g $(CXXFLAGS) $(foreach FILE,$(SRC_FILES),src/$(FILE).cpp) -o GameServer $(LDFLAGS);

all:
	make src
