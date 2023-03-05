[client](/) / [Modules](/gen/modules.md) / [server\_messages](/gen/modules/server_messages.md) / IGameState

# Interface: IGameState

[server_messages](/gen/modules/server_messages.md).IGameState

## Hierarchy

- **`IGameState`**

  ↳ [`GameState`](/gen/interfaces/server_messages.GameState.md)

  ↳ [`WelcomeMsg`](/gen/interfaces/server_messages.WelcomeMsg.md)

## Table of contents

### Properties

- [chatLog](/gen/interfaces/server_messages.IGameState.md#chatlog)
- [players](/gen/interfaces/server_messages.IGameState.md#players)
- [privateSession](/gen/interfaces/server_messages.IGameState.md#privatesession)
- [rolled](/gen/interfaces/server_messages.IGameState.md#rolled)
- [rolls](/gen/interfaces/server_messages.IGameState.md#rolls)
- [turn\_index](/gen/interfaces/server_messages.IGameState.md#turn_index)
- [used](/gen/interfaces/server_messages.IGameState.md#used)
- [victory](/gen/interfaces/server_messages.IGameState.md#victory)

## Properties

### chatLog

• **chatLog**: `string`[]

#### Defined in

[server_messages.ts:26](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L26)

___

### players

• **players**: [`Player`](/gen/interfaces/store_types.Player.md)[]

#### Defined in

[server_messages.ts:25](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L25)

___

### privateSession

• **privateSession**: `boolean`

#### Defined in

[server_messages.ts:32](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L32)

___

### rolled

• **rolled**: `boolean`

#### Defined in

[server_messages.ts:30](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L30)

___

### rolls

• **rolls**: `number`[]

#### Defined in

[server_messages.ts:28](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L28)

___

### turn\_index

• **turn\_index**: `number`

#### Defined in

[server_messages.ts:27](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L27)

___

### used

• **used**: `boolean`[]

#### Defined in

[server_messages.ts:29](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L29)

___

### victory

• **victory**: `boolean`

#### Defined in

[server_messages.ts:31](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L31)
