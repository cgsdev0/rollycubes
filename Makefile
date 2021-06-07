SRC_FILES := GameServer Player Game StringUtils
override CXXFLAGS += -std=c++17 -IuWebSockets/src -IuWebSockets/uSockets/src -Iincludes
override LDFLAGS += uWebSockets/uSockets/*.o -lz

.PHONY: src
src:
	cd uWebSockets/uSockets && WITH_SSL=0 make
	$(CXX) -flto $(CXXFLAGS) $(foreach FILE,$(SRC_FILES),src/$(FILE).cpp) -o GameServer $(LDFLAGS);

.PHONY: clean
clean:
	rm -f uWebSockets/uSockets/*.o
	rm -f GameServer

debug: CXXFLAGS += -g
debug: src

release: clean
release: CXXFLAGS += -O2
release: src

all:
	make src
