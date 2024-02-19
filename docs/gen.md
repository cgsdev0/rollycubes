# WebSocket API

You can find generated docs for the various message types [here.](/gen/modules/server_messages)

## Protocol

The game server communicates with clients via [websockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket). The messages are sent in text mode as JSON payloads. All messages sent to and from the server have a `type` property that determines the shape of the rest of the message. For example, when a client first connects to the server, it will receive a message that looks like this:

```JSON
{
  "type": "welcome",
  ...
}
```

## Endpoints

There are 2 websocket endpoints on the game server.

* `wss://rollycubes.com/ws/room/<room_id>`: connect as a player to a given room
* `wss://rollycubes.com/ws/spectate/<room_id>`: read-only connection, ignores player limit

When connecting to either of these sockets, the client *must* provide a `_session` cookie. This is used to uniquely identify a client in a session in the case of temporary disconnection. If this cookie is not present, the server will reply with `"cookie"` and close the socket.

## Authentication

Beyond providing a `_session` cookie, the client is not required to do any further authentication. However, there is an optional parameter for the player endpoint.

`wss://rollycubes.com/ws/room/<room_id>?userId={USER_ID}`

If `userId` is present in the connection URI, the server will wait for an authentication message from the client.

```JSON
{
  "type": "authenticate",
  "access_token": {YOUR USER ACCESS TOKEN}
}
```

An access token can be acquired by authenticating with the auth server REST API. If there is an error, the server will reply with `"authentication error"` and close the socket.

## Errors

Most errors from the server have the following shape:

```JSON
{
  "type": "error",
  "error": "short description of what went wrong"
}
```

_Sometimes_, it sends a string and closes the socket... PRs welcome :p
