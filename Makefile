CXX=g++
CXXFLAGS=-std=c++17 -IuWebSockets/src -IuWebSockets/uSockets/src -Iincludes -Wall
LDFLAGS=-lz -lpthread -lssl -lcrypto
TARGET=GameServer

SRC=$(wildcard src/*.cpp)
OBJ=$(SRC:.cpp=.o)
DEP=$(OBJ:.o=.d)

$(TARGET): $(OBJ) $(UWS)
	cd uWebSockets/uSockets && WITH_SSL=0 make
	$(CXX) -flto $(CXXFLAGS) $(OBJ) -o $(TARGET) $(LDFLAGS) uWebSockets/uSockets/*.o;

%.d: %.cpp
	@$(CXX) $(CXXFLAGS) $< -MM -MT $(@:.d=.o) >$@

src/%.o: %.cpp
	$(CXX) -c $(CXXFLAGS) -o $@ $<

-include $(DEP)

.PHONY: clean
clean:
	rm -f uWebSockets/uSockets/*.o
	rm -f $(OBJ)
	rm -f $(TARGET)

debug: clean
debug: CXXFLAGS += -g
debug: $(TARGET)

release: clean
release: CXXFLAGS += -O2
release: $(TARGET)

all: $(TARGET)
