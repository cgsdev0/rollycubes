FC=gfortran
FCFLAGS=-Wall -Wextra -std=f2018 -pedantic -fcheck=all

TARGETS=RandomServer DemoClient

# TODO: rename mod_dill for PascalCase consistency
SRC=src/mod_dill.f90 
OBJ=$(SRC:.f90=.o) src/libdill.a

all: RandomServer DemoClient $(TARGETS)

$(TARGETS): $(OBJ)

RandomServer: $(OBJ) src/RandomServer.f90
	echo $(TARGETS)
	$(FC) $(FCFLAGS) $(OBJ) src/RandomServer.f90 -o $@ src/libdill.a -pthread

DemoClient: $(OBJ) src/DemoClient.f90
	$(FC) $(FCFLAGS) $(OBJ) src/DemoClient.f90 -o $@ src/libdill.a -pthread

.PHONY: all clean

src/libdill:
	git clone https://github.com/JeffIrwin/libdill src/libdill

src/%.o: src/%.f90
	$(FC) -c $(FCFLAGS) -o $@ $<

src/libdill.a: src/libdill
	cd src/libdill && ./autogen.sh && ./configure && $(MAKE) && cp .libs/libdill.a ..

%.o: %.mod

.PHONY: clean
clean:
	$(RM) -rf DemoClient RandomServer src/*.o *.mod

# TODO: debug/release option targets
