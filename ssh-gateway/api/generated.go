// This file was generated from JSON Schema using quicktype, do not modify it directly.
// To parse and unparse this JSON data, add this code to your project and do:
//
//    dice, err := UnmarshalDice(bytes)
//    bytes, err = dice.Marshal()
//
//    color, err := UnmarshalColor(bytes)
//    bytes, err = color.Marshal()
//
//    userData, err := UnmarshalUserData(bytes)
//    bytes, err = userData.Marshal()
//
//    authRefreshTokenResponse, err := UnmarshalAuthRefreshTokenResponse(bytes)
//    bytes, err = authRefreshTokenResponse.Marshal()
//
//    authDonateResponse, err := UnmarshalAuthDonateResponse(bytes)
//    bytes, err = authDonateResponse.Marshal()
//
//    authSettingsRequest, err := UnmarshalAuthSettingsRequest(bytes)
//    bytes, err = authSettingsRequest.Marshal()
//
//    player, err := UnmarshalPlayer(bytes)
//    bytes, err = player.Marshal()
//
//    userID, err := UnmarshalUserID(bytes)
//    bytes, err = userID.Marshal()
//
//    achievementProgress, err := UnmarshalAchievementProgress(bytes)
//    bytes, err = achievementProgress.Marshal()
//
//    achievementUnlock, err := UnmarshalAchievementUnlock(bytes)
//    bytes, err = achievementUnlock.Marshal()
//
//    reportStats, err := UnmarshalReportStats(bytes)
//    bytes, err = reportStats.Marshal()
//
//    serverPlayer, err := UnmarshalServerPlayer(bytes)
//    bytes, err = serverPlayer.Marshal()
//
//    userStats, err := UnmarshalUserStats(bytes)
//    bytes, err = userStats.Marshal()
//
//    achievement, err := UnmarshalAchievement(bytes)
//    bytes, err = achievement.Marshal()
//
//    achievementData, err := UnmarshalAchievementData(bytes)
//    bytes, err = achievementData.Marshal()
//
//    diceType, err := UnmarshalDiceType(bytes)
//    bytes, err = diceType.Marshal()
//
//    dieRoll, err := UnmarshalDieRoll(bytes)
//    bytes, err = dieRoll.Marshal()
//
//    gameError, err := UnmarshalGameError(bytes)
//    bytes, err = gameError.Marshal()
//
//    redirect, err := UnmarshalRedirect(bytes)
//    bytes, err = redirect.Marshal()
//
//    room, err := UnmarshalRoom(bytes)
//    bytes, err = room.Marshal()
//
//    iGameState, err := UnmarshalIGameState(bytes)
//    bytes, err = iGameState.Marshal()
//
//    gameState, err := UnmarshalGameState(bytes)
//    bytes, err = gameState.Marshal()
//
//    roomListMsg, err := UnmarshalRoomListMsg(bytes)
//    bytes, err = roomListMsg.Marshal()
//
//    refetchPlayerMsg, err := UnmarshalRefetchPlayerMsg(bytes)
//    bytes, err = refetchPlayerMsg.Marshal()
//
//    welcomeMsg, err := UnmarshalWelcomeMsg(bytes)
//    bytes, err = welcomeMsg.Marshal()
//
//    restartMsg, err := UnmarshalRestartMsg(bytes)
//    bytes, err = restartMsg.Marshal()
//
//    spectatorsMsg, err := UnmarshalSpectatorsMsg(bytes)
//    bytes, err = spectatorsMsg.Marshal()
//
//    winMsg, err := UnmarshalWinMsg(bytes)
//    bytes, err = winMsg.Marshal()
//
//    rollMsg, err := UnmarshalRollMsg(bytes)
//    bytes, err = rollMsg.Marshal()
//
//    rollAgainMsg, err := UnmarshalRollAgainMsg(bytes)
//    bytes, err = rollAgainMsg.Marshal()
//
//    joinMsg, err := UnmarshalJoinMsg(bytes)
//    bytes, err = joinMsg.Marshal()
//
//    disconnectMsg, err := UnmarshalDisconnectMsg(bytes)
//    bytes, err = disconnectMsg.Marshal()
//
//    reconnectMsg, err := UnmarshalReconnectMsg(bytes)
//    bytes, err = reconnectMsg.Marshal()
//
//    kickMsg, err := UnmarshalKickMsg(bytes)
//    bytes, err = kickMsg.Marshal()
//
//    chatMsg, err := UnmarshalChatMsg(bytes)
//    bytes, err = chatMsg.Marshal()
//
//    updateTurnMsg, err := UnmarshalUpdateTurnMsg(bytes)
//    bytes, err = updateTurnMsg.Marshal()
//
//    updateNameMsg, err := UnmarshalUpdateNameMsg(bytes)
//    bytes, err = updateNameMsg.Marshal()
//
//    updateMsg, err := UnmarshalUpdateMsg(bytes)
//    bytes, err = updateMsg.Marshal()

package api

import "encoding/json"

func UnmarshalDice(data []byte) (Dice, error) {
	var r Dice
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *Dice) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalColor(data []byte) (Color, error) {
	var r Color
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *Color) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalUserData(data []byte) (UserData, error) {
	var r UserData
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *UserData) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalAuthRefreshTokenResponse(data []byte) (AuthRefreshTokenResponse, error) {
	var r AuthRefreshTokenResponse
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *AuthRefreshTokenResponse) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalAuthDonateResponse(data []byte) (AuthDonateResponse, error) {
	var r AuthDonateResponse
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *AuthDonateResponse) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalAuthSettingsRequest(data []byte) (AuthSettingsRequest, error) {
	var r AuthSettingsRequest
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *AuthSettingsRequest) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalPlayer(data []byte) (Player, error) {
	var r Player
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *Player) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalUserID(data []byte) (UserID, error) {
	var r UserID
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *UserID) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalAchievementProgress(data []byte) (AchievementProgress, error) {
	var r AchievementProgress
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *AchievementProgress) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalAchievementUnlock(data []byte) (AchievementUnlock, error) {
	var r AchievementUnlock
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *AchievementUnlock) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalReportStats(data []byte) (ReportStats, error) {
	var r ReportStats
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *ReportStats) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalServerPlayer(data []byte) (ServerPlayer, error) {
	var r ServerPlayer
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *ServerPlayer) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalUserStats(data []byte) (UserStats, error) {
	var r UserStats
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *UserStats) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalAchievement(data []byte) (Achievement, error) {
	var r Achievement
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *Achievement) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalAchievementData(data []byte) (AchievementData, error) {
	var r AchievementData
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *AchievementData) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalDiceType(data []byte) (DiceType, error) {
	var r DiceType
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *DiceType) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalDieRoll(data []byte) (DieRoll, error) {
	var r DieRoll
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *DieRoll) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalGameError(data []byte) (GameError, error) {
	var r GameError
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *GameError) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalRedirect(data []byte) (Redirect, error) {
	var r Redirect
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *Redirect) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalRoom(data []byte) (Room, error) {
	var r Room
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *Room) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalIGameState(data []byte) (IGameState, error) {
	var r IGameState
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *IGameState) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalGameState(data []byte) (GameState, error) {
	var r GameState
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *GameState) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalRoomListMsg(data []byte) (RoomListMsg, error) {
	var r RoomListMsg
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *RoomListMsg) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalRefetchPlayerMsg(data []byte) (RefetchPlayerMsg, error) {
	var r RefetchPlayerMsg
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *RefetchPlayerMsg) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalWelcomeMsg(data []byte) (WelcomeMsg, error) {
	var r WelcomeMsg
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *WelcomeMsg) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalRestartMsg(data []byte) (RestartMsg, error) {
	var r RestartMsg
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *RestartMsg) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalSpectatorsMsg(data []byte) (SpectatorsMsg, error) {
	var r SpectatorsMsg
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *SpectatorsMsg) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalWinMsg(data []byte) (WinMsg, error) {
	var r WinMsg
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *WinMsg) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalRollMsg(data []byte) (RollMsg, error) {
	var r RollMsg
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *RollMsg) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalRollAgainMsg(data []byte) (RollAgainMsg, error) {
	var r RollAgainMsg
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *RollAgainMsg) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalJoinMsg(data []byte) (JoinMsg, error) {
	var r JoinMsg
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *JoinMsg) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalDisconnectMsg(data []byte) (DisconnectMsg, error) {
	var r DisconnectMsg
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *DisconnectMsg) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalReconnectMsg(data []byte) (ReconnectMsg, error) {
	var r ReconnectMsg
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *ReconnectMsg) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalKickMsg(data []byte) (KickMsg, error) {
	var r KickMsg
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *KickMsg) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalChatMsg(data []byte) (ChatMsg, error) {
	var r ChatMsg
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *ChatMsg) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalUpdateTurnMsg(data []byte) (UpdateTurnMsg, error) {
	var r UpdateTurnMsg
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *UpdateTurnMsg) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalUpdateNameMsg(data []byte) (UpdateNameMsg, error) {
	var r UpdateNameMsg
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *UpdateNameMsg) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalUpdateMsg(data []byte) (UpdateMsg, error) {
	var r UpdateMsg
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *UpdateMsg) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

type UserData struct {
	Achievements []Achievement `json:"achievements"`
	Color        Color         `json:"color"`
	CreatedDate  string        `json:"createdDate"`
	Dice         Dice          `json:"dice"`
	Donor        bool          `json:"donor"`
	ID           string        `json:"id"`
	ImageURL     *string       `json:"image_url"`
	PubkeyText   *string       `json:"pubkey_text"`
	Stats        *UserStats    `json:"stats"`
	Username     string        `json:"username"`
}

type Achievement struct {
	ID       string `json:"id"`
	Progress int64  `json:"progress"`
	RD       *int64 `json:"rd"`
	Rn       *int64 `json:"rn"`
	Unlocked string `json:"unlocked"`
}

type Color struct {
	Hue float64 `json:"hue"`
	Sat float64 `json:"sat"`
}

type Dice struct {
	Type DiceType `json:"type"`
}

type UserStats struct {
	Doubles int64 `json:"doubles"`
	Games   int64 `json:"games"`
	Rolls   int64 `json:"rolls"`
	WINS    int64 `json:"wins"`
}

type AuthRefreshTokenResponse struct {
	AccessToken string `json:"access_token"`
}

type AuthDonateResponse struct {
	Link string `json:"link"`
}

type AuthSettingsRequest struct {
	Color    *Color    `json:"color,omitempty"`
	Setting  Setting   `json:"setting"`
	DiceType *DiceType `json:"dice_type,omitempty"`
	Text     *string   `json:"text,omitempty"`
}

type AchievementProgress struct {
	AchievementID string                  `json:"achievement_id"`
	Progress      int64                   `json:"progress"`
	Type          AchievementProgressType `json:"type"`
	UserID        UserID                  `json:"user_id"`
	UserIndex     int64                   `json:"user_index"`
}

type UserID struct {
	ID   string     `json:"id"`
	Type UserIDType `json:"type"`
}

type AchievementUnlock struct {
	Description string                `json:"description"`
	ID          string                `json:"id"`
	ImageURL    *string               `json:"image_url"`
	MaxProgress int64                 `json:"max_progress"`
	Name        string                `json:"name"`
	Type        AchievementUnlockType `json:"type"`
	UserID      string                `json:"user_id"`
	UserIndex   int64                 `json:"user_index"`
}

type ReportStats struct {
	Doubles int64  `json:"doubles"`
	Games   int64  `json:"games"`
	Rolls   int64  `json:"rolls"`
	UserID  UserID `json:"user_id"`
	WINS    int64  `json:"wins"`
}

type AchievementData struct {
	Description string  `json:"description"`
	ID          string  `json:"id"`
	ImageURL    *string `json:"image_url"`
	MaxProgress int64   `json:"max_progress"`
	Name        string  `json:"name"`
}

type DieRoll struct {
	Used  bool  `json:"used"`
	Value int64 `json:"value"`
}

type GameError struct {
	Error string        `json:"error"`
	Type  GameErrorType `json:"type"`
}

type Redirect struct {
	Room string       `json:"room"`
	Type RedirectType `json:"type"`
}

type IGameState struct {
	ChatLog        []string `json:"chatLog"`
	Players        []Player `json:"players"`
	PrivateSession bool     `json:"privateSession"`
	Rolled         bool     `json:"rolled"`
	Rolls          []int64  `json:"rolls"`
	Spectators     int64    `json:"spectators"`
	TurnIndex      int64    `json:"turn_index"`
	Used           []bool   `json:"used"`
	Victory        bool     `json:"victory"`
}

type Player struct {
	Connected bool    `json:"connected"`
	Crowned   *bool   `json:"crowned,omitempty"`
	Name      *string `json:"name,omitempty"`
	Score     int64   `json:"score"`
	SkipCount int64   `json:"skip_count"`
	UserID    *string `json:"user_id,omitempty"`
	WinCount  int64   `json:"win_count"`
}

type GameState struct {
	ChatLog        []string       `json:"chatLog"`
	Players        []ServerPlayer `json:"players"`
	PrivateSession bool           `json:"privateSession"`
	Rolled         bool           `json:"rolled"`
	Rolls          []int64        `json:"rolls"`
	Spectators     int64          `json:"spectators"`
	TurnIndex      int64          `json:"turn_index"`
	Type           GameStateType  `json:"type"`
	Used           []bool         `json:"used"`
	Victory        bool           `json:"victory"`
}

type ServerPlayer struct {
	Connected    bool    `json:"connected"`
	Crowned      *bool   `json:"crowned,omitempty"`
	DoublesCount int64   `json:"doubles_count"`
	Name         *string `json:"name,omitempty"`
	RollCount    int64   `json:"roll_count"`
	Score        int64   `json:"score"`
	Session      string  `json:"session"`
	SkipCount    int64   `json:"skip_count"`
	TurnCount    int64   `json:"turn_count"`
	UserID       *string `json:"user_id,omitempty"`
	WinCount     int64   `json:"win_count"`
}

type RoomListMsg struct {
	Rooms []Room           `json:"rooms"`
	Type  *RoomListMsgType `json:"type,omitempty"`
}

type Room struct {
	Code        string `json:"code"`
	HostName    string `json:"host_name"`
	LastUpdated string `json:"last_updated"`
	PlayerCount int64  `json:"player_count"`
}

type RefetchPlayerMsg struct {
	Type   RefetchPlayerMsgType `json:"type"`
	UserID string               `json:"user_id"`
}

type WelcomeMsg struct {
	ChatLog        []string       `json:"chatLog"`
	ID             int64          `json:"id"`
	Players        []Player       `json:"players"`
	PrivateSession bool           `json:"privateSession"`
	Rolled         bool           `json:"rolled"`
	Rolls          []int64        `json:"rolls"`
	Spectators     int64          `json:"spectators"`
	TurnIndex      int64          `json:"turn_index"`
	Type           WelcomeMsgType `json:"type"`
	Used           []bool         `json:"used"`
	Victory        bool           `json:"victory"`
}

type RestartMsg struct {
	ID   int64          `json:"id"`
	Type RestartMsgType `json:"type"`
}

type SpectatorsMsg struct {
	Count int64             `json:"count"`
	Type  SpectatorsMsgType `json:"type"`
}

type WinMsg struct {
	ID   int64      `json:"id"`
	Type WinMsgType `json:"type"`
}

type RollMsg struct {
	Rolls []int64     `json:"rolls"`
	Type  RollMsgType `json:"type"`
}

type RollAgainMsg struct {
	Type RollAgainMsgType `json:"type"`
}

type JoinMsg struct {
	ID     int64       `json:"id"`
	Name   *string     `json:"name,omitempty"`
	Type   JoinMsgType `json:"type"`
	UserID *string     `json:"user_id,omitempty"`
}

type DisconnectMsg struct {
	ID   int64             `json:"id"`
	Type DisconnectMsgType `json:"type"`
}

type ReconnectMsg struct {
	ID     int64            `json:"id"`
	Name   *string          `json:"name,omitempty"`
	Type   ReconnectMsgType `json:"type"`
	UserID *string          `json:"user_id,omitempty"`
}

type KickMsg struct {
	ID   int64       `json:"id"`
	Type KickMsgType `json:"type"`
}

type ChatMsg struct {
	Msg  string      `json:"msg"`
	Type ChatMsgType `json:"type"`
}

type UpdateTurnMsg struct {
	ID   int64             `json:"id"`
	Skip *bool             `json:"skip,omitempty"`
	Type UpdateTurnMsgType `json:"type"`
}

type UpdateNameMsg struct {
	ID   int64             `json:"id"`
	Name string            `json:"name"`
	Type UpdateNameMsgType `json:"type"`
}

// TODO: add descriptions to these things
type UpdateMsg struct {
	ID    int64         `json:"id"`
	Reset *bool         `json:"reset,omitempty"`
	Score int64         `json:"score"`
	Type  UpdateMsgType `json:"type"`
	Used  []bool        `json:"used,omitempty"`
}

type DiceType string

const (
	D20 DiceType = "D20"
	D6  DiceType = "D6"
)

type Setting string

const (
	Pubkey          Setting = "Pubkey"
	SettingColor    Setting = "Color"
	SettingDiceType Setting = "DiceType"
)

type AchievementProgressType string

const (
	TypeAchievementProgress AchievementProgressType = "achievement_progress"
)

type UserIDType string

const (
	Anonymous UserIDType = "Anonymous"
	User      UserIDType = "User"
)

type AchievementUnlockType string

const (
	TypeAchievementUnlock AchievementUnlockType = "achievement_unlock"
)

type GameErrorType string

const (
	Error GameErrorType = "error"
)

type RedirectType string

const (
	TypeRedirect RedirectType = "redirect"
)

type GameStateType string

const (
	TypeGameState GameStateType = "game_state"
)

type RoomListMsgType string

const (
	RoomList RoomListMsgType = "room_list"
)

type RefetchPlayerMsgType string

const (
	RefetchPlayer RefetchPlayerMsgType = "refetch_player"
)

type WelcomeMsgType string

const (
	Welcome WelcomeMsgType = "welcome"
)

type RestartMsgType string

const (
	Restart RestartMsgType = "restart"
)

type SpectatorsMsgType string

const (
	Spectators SpectatorsMsgType = "spectators"
)

type WinMsgType string

const (
	Win WinMsgType = "win"
)

type RollMsgType string

const (
	Roll RollMsgType = "roll"
)

type RollAgainMsgType string

const (
	RollAgain RollAgainMsgType = "roll_again"
)

type JoinMsgType string

const (
	Join JoinMsgType = "join"
)

type DisconnectMsgType string

const (
	Disconnect DisconnectMsgType = "disconnect"
)

type ReconnectMsgType string

const (
	Reconnect ReconnectMsgType = "reconnect"
)

type KickMsgType string

const (
	Kick KickMsgType = "kick"
)

type ChatMsgType string

const (
	Chat ChatMsgType = "chat"
)

type UpdateTurnMsgType string

const (
	UpdateTurn UpdateTurnMsgType = "update_turn"
)

type UpdateNameMsgType string

const (
	UpdateName UpdateNameMsgType = "update_name"
)

type UpdateMsgType string

const (
	Update UpdateMsgType = "update"
)
