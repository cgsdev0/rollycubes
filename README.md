# dice-game
[![Language grade: C/C++](https://img.shields.io/lgtm/grade/cpp/g/cgsdev0/rollycubes.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/cgsdev0/rollycubes/context:cpp)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/cgsdev0/rollycubes.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/cgsdev0/rollycubes/context:javascript)

Check out this project [in production here](https://rollycubes.com/) or [in beta here](https://beta.rollycubes.com/)
And follow development [on Twitch.tv](https://twitch.tv/badcop_)!

## How to run locally

To run the dice game on your local machine, there are a few requirements.
* You will need a compiler with C++17 support (g++ preferred)
* You will need the yarn package manager (https://yarnpkg.com/lang/en/)
* You will almost certainly want to be on linux

### Run the server
Use `./run-server.sh` (linux only)
  - This will automatically recompile/restart the server any time you modify a source file

Alternatively, run `make && ./GameServer` in the root directory

### Run the client
Use `cd client; yarn; yarn start`
  - Navigate to `localhost:3000`
  - This will also hot reload any time you modify a file in the client folder

### Run the terminal client
To run the terminal client locally run
```
cd terminal-client
node client.js [--room wKvsbw]
```

To run the terminal client locally connecting to a local server run
```
cd terminal-client
node client.js --host localhost --port 3001 --insecure --room wKvsbw
```

### Run the auth service locally
- `cd auth; docker-compose up -d` to set up the database
- `yarn; yarn start` to run the service

## High-Level Services
![Service architecture graph](/docs/system-graph.png?raw=true "Service architecture graph")
