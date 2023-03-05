[client](/) / [Modules](/gen/modules.md) / [server\_messages](/gen/modules/server_messages.md) / WelcomeMsg

# Interface: WelcomeMsg

[server_messages](/gen/modules/server_messages.md).WelcomeMsg

## Hierarchy

- [`IGameState`](/gen/interfaces/server_messages.IGameState.md)

  ↳ **`WelcomeMsg`**

## Table of contents

### Properties

- [chatLog](/gen/interfaces/server_messages.WelcomeMsg.md#chatlog)
- [id](/gen/interfaces/server_messages.WelcomeMsg.md#id)
- [players](/gen/interfaces/server_messages.WelcomeMsg.md#players)
- [privateSession](/gen/interfaces/server_messages.WelcomeMsg.md#privatesession)
- [rolled](/gen/interfaces/server_messages.WelcomeMsg.md#rolled)
- [rolls](/gen/interfaces/server_messages.WelcomeMsg.md#rolls)
- [turn\_index](/gen/interfaces/server_messages.WelcomeMsg.md#turn_index)
- [type](/gen/interfaces/server_messages.WelcomeMsg.md#type)
- [used](/gen/interfaces/server_messages.WelcomeMsg.md#used)
- [victory](/gen/interfaces/server_messages.WelcomeMsg.md#victory)

## Properties

### chatLog

• **chatLog**: `string`[]

#### Inherited from

[IGameState](/gen/interfaces/server_messages.IGameState.md).[chatLog](/gen/interfaces/server_messages.IGameState.md#chatlog)

#### Defined in

[server_messages.ts:26](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L26)

___

### id

• **id**: `number`

#### Defined in

[server_messages.ts:42](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L42)

___

### players

• **players**: [`Player`](/gen/interfaces/store_types.Player.md)[]

#### Inherited from

[IGameState](/gen/interfaces/server_messages.IGameState.md).[players](/gen/interfaces/server_messages.IGameState.md#players)

#### Defined in

[server_messages.ts:25](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L25)

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

• **type**: ``"welcome"``

#### Defined in

[server_messages.ts:41](https://github.com/cgsdev0/rollycubes/blob/1c25446/client/src/types/server_messages.ts#L41)

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
