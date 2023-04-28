# Rolly Cubes
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=208182009&machine=basicLinux32gb&devcontainer_path=.devcontainer%2Fdevcontainer.json&location=WestUs2)

Check out this project [in production here](https://rollycubes.com/) or [in beta here](https://beta.rollycubes.com/)
And follow development [on Twitch.tv](https://twitch.tv/badcop_)!

## Running the project in Codespaces

In the root directory, run one of these commands to start dev services:
```bash
npm start  # run everything

npm run no-auth  # start only client and game server
```

Then, click this button on the "Ports" tab:

![image](https://user-images.githubusercontent.com/4583705/235190987-5bde6b1a-f98c-40b9-a57d-d3b6841a0143.png)


## Running locally

To run on your local machine, there are a few requirements:
* You will need a compiler with C++20 support (g++ preferred)
* You will almost certainly want to be on linux

In the root directory:

```bash
# runs npm install for each package
scripts/setup-dev-env

# creates a fresh set of keys
scripts/create-dev-keys
```

See below for running the services. Generally, you will want to at least run 'client' and 'game server'.

## High-Level Overview
![Service architecture graph](/system-graph.png?raw=true "Service architecture graph")

### Game Server
The game server manages all of the logic for game sessions. Since rooms are ephemeral, it does not use a database. It also sends achievement unlock info to the auth server.

Use `./game/run-server.sh` (linux only)
  - This will automatically recompile/restart the server any time you modify a source file

Alternatively, run `make && ./GameServer` in the `game` directory

Environment variables:

| Variable | Description                                                     |
| -------- | --------------------------------------------------------------- |
| NO\_AUTH  | set this to `true` to disable the need for a local auth server. |

### Auth Server
The auth server is responsible for managing and authenticating users and user data. It uses a PostgreSQL database to store user data (achievements, stats, etc.)

- `cd auth/devdb; docker-compose up -d` to set up the database
- `cargo run` to run the service

### Client

```bash
cd client
npm i

npm start # requires local auth server
npm run no-auth # runs without local auth server
```
  - Navigate to `localhost:3000`
  - This will also hot reload any time you modify a file in the client folder

### Terminal Client
To run the terminal client locally run
```bash
cd terminal-client
node client.js [--room wKvsbw]
```

To run the terminal client locally connecting to a local server run
```bash
cd terminal-client
node client.js --host localhost --port 3001 --insecure --room wKvsbw
```
