[client](/) / [Modules](/gen/modules.md) / [server\_messages](/gen/modules/server_messages.md) / GameState

# Interface: GameState

[server_messages](/gen/modules/server_messages.md).GameState

## Hierarchy

- [`IGameState`](/gen/interfaces/server_messages.IGameState.md)

  ↳ **`GameState`**

## Table of contents

### Properties

- [chatLog](/gen/interfaces/server_messages.GameState.md#chatlog)
- [players](/gen/interfaces/server_messages.GameState.md#players)
- [privateSession](/gen/interfaces/server_messages.GameState.md#privatesession)
- [rolled](/gen/interfaces/server_messages.GameState.md#rolled)
- [rolls](/gen/interfaces/server_messages.GameState.md#rolls)
- [turn\_index](/gen/interfaces/server_messages.GameState.md#turn_index)
- [type](/gen/interfaces/server_messages.GameState.md#type)
- [used](/gen/interfaces/server_messages.GameState.md#used)
- [victory](/gen/interfaces/server_messages.GameState.md#victory)

## Properties

### chatLog

• **chatLog**: `string`[]

#### Inherited from

[IGameState](/gen/interfaces/server_messages.IGameState.md).[chatLog](/gen/interfaces/server_messages.IGameState.md#chatlog)

#### Defined in

[server_messages.ts:26](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L26)

___

### players

• **players**: [`ServerPlayer`](/gen/interfaces/store_types.ServerPlayer.md)[]

#### Overrides

[IGameState](/gen/interfaces/server_messages.IGameState.md).[players](/gen/interfaces/server_messages.IGameState.md#players)

#### Defined in

[server_messages.ts:37](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L37)

___

### privateSession

• **privateSession**: `boolean`

#### Inherited from

[IGameState](/gen/interfaces/server_messages.IGameState.md).[privateSession](/gen/interfaces/server_messages.IGameState.md#privatesession)

#### Defined in

[server_messages.ts:32](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L32)

___

### rolled

• **rolled**: `boolean`

#### Inherited from

[IGameState](/gen/interfaces/server_messages.IGameState.md).[rolled](/gen/interfaces/server_messages.IGameState.md#rolled)

#### Defined in

[server_messages.ts:30](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L30)

___

### rolls

• **rolls**: `number`[]

#### Inherited from

[IGameState](/gen/interfaces/server_messages.IGameState.md).[rolls](/gen/interfaces/server_messages.IGameState.md#rolls)

#### Defined in

[server_messages.ts:28](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L28)

___

### turn\_index

• **turn\_index**: `number`

#### Inherited from

[IGameState](/gen/interfaces/server_messages.IGameState.md).[turn_index](/gen/interfaces/server_messages.IGameState.md#turn_index)

#### Defined in

[server_messages.ts:27](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L27)

___

### type

• **type**: ``"game_state"``

#### Defined in

[server_messages.ts:36](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L36)

___

### used

• **used**: `boolean`[]

#### Inherited from

[IGameState](/gen/interfaces/server_messages.IGameState.md).[used](/gen/interfaces/server_messages.IGameState.md#used)

#### Defined in

[server_messages.ts:29](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L29)

___

### victory

• **victory**: `boolean`

#### Inherited from

[IGameState](/gen/interfaces/server_messages.IGameState.md).[victory](/gen/interfaces/server_messages.IGameState.md#victory)

#### Defined in

[server_messages.ts:31](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L31)
