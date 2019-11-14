# dice-game
an old classic, reimagined

## How to run locally

To run the dice game on your local machine, there are a few requirements.
* You will need a compiler with C++17 support (g++ preferred)
* You will need the yarn package manager (https://yarnpkg.com/lang/en/)
* You will almost certainly want to be on linux

### Run the server
Use `./run-server.sh` (linux only)
  - This will automatically recompile/restart the server any time you modify a source file

### Run the client
Use `cd client; yarn; yarn start`
  - Navigate to `localhost:3000`
  - This will also hot reload any time you modify a file in the client folder

### Run the terminal client
To run the terminal client locally, use `cd js_terminal; node client.js` (still a work in progress)

Don't bother trying to use the python terminal client tbh, it's really bad
