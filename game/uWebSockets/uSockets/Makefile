# NOTE: this library won't properly rebuild.
# If making changes, use 'make clean; make'
override CFLAGS += -DLIBUS_NO_SSL -std=c11 -Isrc
override LDFLAGS += uSockets.a

SRC=src/*.c src/eventing/*.c src/crypto/*.c
TARGET=uSockets.a

default: $(TARGET)

$(TARGET): $(OBJ)
	$(CC) $(CFLAGS) -flto -O3 -c $(SRC)
	$(AR) rvs uSockets.a *.o

clean:
	rm -f *.o
	rm -f *.a
	rm -rf .certs
