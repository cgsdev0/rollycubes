SRC_FILES := GameServer
override CXXFLAGS += -std=c++17 -IuWebSockets/src -IuWebSockets/uSockets/src
override LDFLAGS += uWebSockets/uSockets/*.o -lz

.PHONY: src
src:
	cd uWebSockets/uSockets && WITH_SSL=0 make
	$(foreach FILE,$(SRC_FILES),$(CXX) -flto -O3 $(CXXFLAGS) src/$(FILE).cpp -o $(FILE) $(LDFLAGS);)

all:
	make src
