package main

import (
	"context"
	"crypto/sha1"
	"crypto/x509"
	b64 "encoding/base64"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	api "github.com/cgsdev0/rollycubes/ssh-gateway/api"
	"github.com/cgsdev0/rollycubes/ssh-gateway/user"
	"github.com/muesli/termenv"

	"github.com/charmbracelet/bubbles/list"
	"github.com/charmbracelet/bubbles/table"
	"github.com/charmbracelet/bubbles/textinput"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	ssh "github.com/charmbracelet/ssh"
	wish "github.com/charmbracelet/wish"
	"github.com/charmbracelet/wish/bubbletea"
	lm "github.com/charmbracelet/wish/logging"
	"github.com/golang-jwt/jwt/v5"
	zone "github.com/lrstanley/bubblezone"
	"github.com/muesli/reflow/wrap"
	gossh "golang.org/x/crypto/ssh"
	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

// Tabs.

var (
	activeTabBorder = lipgloss.Border{
		Top:         "─",
		Bottom:      " ",
		Left:        "│",
		Right:       "│",
		TopLeft:     "╭",
		TopRight:    "╮",
		BottomLeft:  "┘",
		BottomRight: "└",
	}

	tabBorder = lipgloss.Border{
		Top:         "─",
		Bottom:      "─",
		Left:        "│",
		Right:       "│",
		TopLeft:     "╭",
		TopRight:    "╮",
		BottomLeft:  "┴",
		BottomRight: "┴",
	}
	tab = lipgloss.NewStyle().
		Border(tabBorder, true).
		Padding(0, 1)

	disconnected = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#ff0000"))

	activeTab = tab.Copy().Border(activeTabBorder, true)

	tabGap = tab.Copy().
		BorderTop(false).
		BorderLeft(false).
		BorderRight(false)
)

type CommonModel struct {
	mu          *sync.Mutex
	ctx         ssh.Context
	ws          *websocket.Conn
	program     *tea.Program
	disconnect  chan struct{}
	zone        *zone.Manager
	session     ssh.Session
	AccessToken string
	User        *user.User
}

type LobbyScene struct {
	Common      *CommonModel
	list        list.Model
	Width       int
	Height      int
	ActiveTab   int
	initialized bool
}

type GameScene struct {
	Common *CommonModel
	State  *api.IGameState
	Width  int
	Height int
	SelfID int

	viewport  viewport.Model
	textInput textinput.Model
	roomCode  string
	players   table.Model
	TabID     int
}

type SwitchSceneMsg struct {
	scene tea.Model
}

type WebsocketMsg struct {
	Msg  []byte
	Type string
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func reverse[S ~[]E, E any](s S) {
	for i, j := 0, len(s)-1; i < j; i, j = i+1, j-1 {
		s[i], s[j] = s[j], s[i]
	}
}

func GetRoomList(activeTab int) (*api.RoomListMsg, error) {
	var resp *http.Response
	var err error
	if activeTab == 0 {
		resp, err = http.Get("https://prod.rollycubes.com/list")
	} else {
		resp, err = http.Get("https://beta.rollycubes.com/list")
	}

	if err != nil {
		log.Println(err)
		return nil, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	roomList, err := api.UnmarshalRoomListMsg(body)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	return &roomList, nil
}

func (m LobbyScene) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {

	case tea.WindowSizeMsg:
		m.Width = msg.Width
		m.Height = msg.Height
		m.list.SetHeight(msg.Height - 4)
		m.list.SetWidth(msg.Width)
		if !m.initialized {
			m.initialized = true

			var cmd tea.Cmd
			roomList, err := GetRoomList(m.ActiveTab)
			if err != nil {
				// lol rip
				return m, nil
			}
			// TODO: sort and filter room list
			for i, v := range roomList.Rooms {
				if v.PlayerCount == 0 {
					continue
				}
				cmd = m.list.InsertItem(i, v)
			}
			return m, cmd
		}

	case tea.MouseMsg:

		if msg.Type != tea.MouseLeft {
			return m, nil
		}

		if m.Common.zone.Get("beta").InBounds(msg) {
			m.ActiveTab = 1
			m.list.SetItems(nil)
			var cmd tea.Cmd
			roomList, err := GetRoomList(m.ActiveTab)
			if err != nil {
				// lol rip
				return m, nil
			}
			// TODO: sort and filter room list
			for i, v := range roomList.Rooms {
				if v.PlayerCount == 0 {
					continue
				}
				cmd = m.list.InsertItem(i, v)
			}
			return m, cmd
		}

		if m.Common.zone.Get("primary").InBounds(msg) {
			m.ActiveTab = 0
			m.list.SetItems(nil)
			var cmd tea.Cmd
			roomList, err := GetRoomList(m.ActiveTab)
			if err != nil {
				// lol rip
				return m, nil
			}
			// TODO: sort and filter room list
			for i, v := range roomList.Rooms {
				if v.PlayerCount == 0 {
					continue
				}
				cmd = m.list.InsertItem(i, v)
			}
			return m, cmd
		}
	// Is it a key press?
	case tea.KeyMsg:

		// Cool, what was the actual key pressed?
		log.Println(msg.String())
		switch msg.String() {

		case "left":
			fallthrough
		case "h":
			m.ActiveTab = 0
			m.list.SetItems(nil)
			var cmd tea.Cmd
			roomList, err := GetRoomList(m.ActiveTab)
			if err != nil {
				// lol rip
				return m, nil
			}
			// TODO: sort and filter room list
			for i, v := range roomList.Rooms {
				if v.PlayerCount == 0 {
					continue
				}
				cmd = m.list.InsertItem(i, v)
			}
			return m, cmd
		case "right":
			fallthrough
		case "l":
			m.ActiveTab = 1
			m.list.SetItems(nil)
			var cmd tea.Cmd
			roomList, err := GetRoomList(m.ActiveTab)
			if err != nil {
				// lol rip
				return m, nil
			}
			// TODO: sort and filter room list
			for i, v := range roomList.Rooms {
				if v.PlayerCount == 0 {
					continue
				}
				cmd = m.list.InsertItem(i, v)
			}
			return m, cmd
		case "r":
			m.list.SetItems(nil)
			var cmd tea.Cmd
			roomList, err := GetRoomList(m.ActiveTab)
			if err != nil {
				// lol rip
				return m, nil
			}
			// TODO: sort and filter room list
			for i, v := range roomList.Rooms {
				if v.PlayerCount == 0 {
					continue
				}
				cmd = m.list.InsertItem(i, v)
			}
			return m, cmd
		}
	}

	var cmd tea.Cmd
	m.list, cmd = m.list.Update(msg)
	return m, cmd
}

func (m GameScene) columns() (int, int) {
	// sidebar := int(float64(m.Width) * 0.3)
	// return sidebar, m.Width - sidebar
	sidebar := 25
	return sidebar, m.Width - sidebar
}

func (m *GameScene) ConstrainSize() {
	m.Width = min(80, m.Width-2)
	m.Height = min(20, m.Height-2)
	m.viewport.Width = m.Width
	m.viewport.Height = m.Height - 1
}

func (m *GameScene) renderTable() {
	var rows []table.Row
	for i, player := range m.State.Players {
		var name string
		if player.Name == nil {
			name = "User" + fmt.Sprint(i+1)
		} else {
			name = *player.Name
		}
		if !player.Connected {
			name = fmt.Sprintf("\x1b[38:5:196m%s\x1b[39m", name)
		} else {
			name = fmt.Sprintf("\x1b[39m%s", name)
		}
		row := table.Row{name, fmt.Sprint(player.Score)}
		rows = append(rows, row)
	}
	m.players.SetRows(rows)
	if !m.players.Focused() {
		m.players.SetCursor(int(m.State.TurnIndex))
	}
}

func (m GameScene) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd
	var cmds []tea.Cmd

	_, chatWidth := m.columns()

	switch msg := msg.(type) {
	case tea.MouseMsg:
		if msg.Type != tea.MouseLeft {
			return m, nil
		}

		if m.Common.zone.Get("add").InBounds(msg) {
			if m.Common.ws != nil {
				msg := api.SimpleMsg{Type: "add"}
				err := wsjson.Write(m.Common.ctx, m.Common.ws, msg)
				if err != nil {
					log.Println(err)
					break
				}
			}
		}
		if m.Common.zone.Get("sub").InBounds(msg) {
			if m.Common.ws != nil {
				msg := api.SimpleMsg{Type: "sub"}
				err := wsjson.Write(m.Common.ctx, m.Common.ws, msg)
				if err != nil {
					log.Println(err)
					break
				}
			}
		}
		if m.Common.zone.Get("sub1").InBounds(msg) {
			if m.Common.ws != nil {
				msg := api.AddSubNMsg{Type: "sub_nth", Idx: 0}
				err := wsjson.Write(m.Common.ctx, m.Common.ws, msg)
				if err != nil {
					log.Println(err)
					break
				}
			}
		}
		if m.Common.zone.Get("sub2").InBounds(msg) {
			if m.Common.ws != nil {
				msg := api.AddSubNMsg{Type: "sub_nth", Idx: 1}
				err := wsjson.Write(m.Common.ctx, m.Common.ws, msg)
				if err != nil {
					log.Println(err)
					break
				}
			}
		}
		if m.Common.zone.Get("add1").InBounds(msg) {
			if m.Common.ws != nil {
				msg := api.AddSubNMsg{Type: "add_nth", Idx: 0}
				err := wsjson.Write(m.Common.ctx, m.Common.ws, msg)
				if err != nil {
					log.Println(err)
					break
				}
			}
		}
		if m.Common.zone.Get("add2").InBounds(msg) {
			if m.Common.ws != nil {
				msg := api.AddSubNMsg{Type: "add_nth", Idx: 1}
				err := wsjson.Write(m.Common.ctx, m.Common.ws, msg)
				if err != nil {
					log.Println(err)
					break
				}
			}
		}
		if m.Common.zone.Get("roll").InBounds(msg) {
			if m.Common.ws != nil {
				msg := api.RollMsg{Type: "roll"}
				err := wsjson.Write(m.Common.ctx, m.Common.ws, msg)
				if err != nil {
					log.Println(err)
					break
				}
			}
		}
		if m.Common.zone.Get("newGame").InBounds(msg) {
			if m.Common.ws != nil {
				msg := api.SimpleMsg{Type: "restart"}
				err := wsjson.Write(m.Common.ctx, m.Common.ws, msg)
				if err != nil {
					log.Println(err)
					break
				}
			}
		}
	case WebsocketMsg:
		switch msg.Type {
		case "kick":
			kick, err := api.UnmarshalKickMsg(msg.Msg)
			if err != nil {
				log.Printf("idfk it broke %v+\n", err)
				break
			}
			m.State.Players = append(m.State.Players[:kick.ID], m.State.Players[kick.ID+1:]...)
			if int(kick.ID) < m.SelfID {
				m.SelfID -= 1
			}
			if kick.ID < m.State.TurnIndex {
				m.State.TurnIndex -= 1
			}
			var rows []table.Row
			for i, player := range m.State.Players {
				var name string
				if player.Name == nil {
					name = "User" + fmt.Sprint(i+1)
				} else {
					name = *player.Name
				}
				row := table.Row{name, fmt.Sprint(player.Score)}
				rows = append(rows, row)
			}
			m.players.SetRows(rows)
			m.players.SetCursor(int(m.State.TurnIndex))
		case "disconnect":
			disconnect, err := api.UnmarshalDisconnectMsg(msg.Msg)
			if err != nil {
				log.Printf("idfk it broke %v+\n", err)
				break
			}
			m.State.Players[disconnect.ID].Connected = false
			m.renderTable()
		case "reconnect":
			reconnect, err := api.UnmarshalReconnectMsg(msg.Msg)
			if err != nil {
				log.Printf("idfk it broke %v+\n", err)
				break
			}
			m.State.Players[reconnect.ID].Connected = true
			if reconnect.UserID != nil {
				m.State.Players[reconnect.ID].UserID = reconnect.UserID
				m.State.Players[reconnect.ID].Name = reconnect.Name
			}
			m.renderTable()
		case "join":
			join, err := api.UnmarshalJoinMsg(msg.Msg)
			if err != nil {
				log.Printf("idfk it broke %v+\n", err)
				break
			}
			newPlayer := api.Player{
				Name: join.Name,
			}
			m.State.Players = append(m.State.Players, newPlayer)
			m.renderTable()
		case "restart":
			restart, err := api.UnmarshalRestartMsg(msg.Msg)
			if err != nil {
				log.Printf("idfk it broke %v+\n", err)
				break
			}
			m.State.TurnIndex = restart.ID
			m.State.Used[0] = false
			m.State.Used[1] = false
			m.State.Victory = false
			m.State.Rolled = false
			m.renderTable()
		case "win":
			m.State.Victory = true
		case "update":
			update, err := api.UnmarshalUpdateMsg(msg.Msg)
			if err != nil {
				log.Printf("idfk it broke %v+\n", err)
				break
			}
			if len(update.Used) > 0 {
				m.State.Used = update.Used
			}
			m.State.Players[update.ID].Score = update.Score
			m.renderTable()
		case "roll":
			roll, err := api.UnmarshalRollMsg(msg.Msg)
			if err != nil {
				log.Printf("idfk it broke %v+\n", err)
				break
			}
			m.State.Rolled = true
			m.State.Rolls = roll.Rolls
			m.State.Used[0] = false
			m.State.Used[1] = false
		case "roll_again":
			_, err := api.UnmarshalRollAgainMsg(msg.Msg)
			if err != nil {
				log.Printf("idfk it broke %v+\n", err)
				break
			}
			m.State.Rolled = false
		case "update_turn":
			update, err := api.UnmarshalUpdateTurnMsg(msg.Msg)
			if err != nil {
				log.Printf("idfk it broke %v+\n", err)
				break
			}
			m.State.TurnIndex = update.ID
			m.State.Rolled = false
			m.players.SetCursor(int(m.State.TurnIndex))

		case "welcome":
			welcome, err := api.UnmarshalWelcomeMsg(msg.Msg)
			if err != nil {
				log.Printf("idfk it broke %v+\n", err)
				break
			}
			state, err := api.UnmarshalIGameState(msg.Msg)
			if err != nil {
				log.Printf("idfk it broke %v+\n", err)
				break
			}
			m.SelfID = int(welcome.ID)
			// Put the players into the table
			m.State = &state
			m.renderTable()
			// Put the chat into the pager
			reverse(state.ChatLog)
			m.State = &state
			wrapped := wrap.String(strings.Join(m.State.ChatLog, "\n"), chatWidth-1)
			m.viewport.SetContent(wrapped)
			m.viewport.SetYOffset(m.viewport.YOffset + 100000000) // lol

			// Update our name
			if m.Common.ws != nil {
				msg := api.UpdateNameMsg{Type: "update_name", Name: m.Common.session.User()}
				err := wsjson.Write(m.Common.ctx, m.Common.ws, msg)
				if err != nil {
					log.Println(err)
					break
				}
			}
		case "update_name":
			updateName, err := api.UnmarshalUpdateNameMsg(msg.Msg)
			if err != nil {
				log.Printf("idfk it broke %v+\n", err)
				break
			}
			m.State.Players[updateName.ID].Name = &updateName.Name
			m.renderTable()
		case "chat":
			chat, err := api.UnmarshalChatMsg(msg.Msg)
			if err != nil {
				log.Printf("idfk it broke %v+\n", err)
				break
			}
			m.State.ChatLog = append(m.State.ChatLog, chat.Msg)
			wrapped := wrap.String(strings.Join(m.State.ChatLog, "\n"), chatWidth)
			m.viewport.SetContent(wrapped)
			m.viewport.SetYOffset(m.viewport.YOffset + 100000000) // lol
		}
	case tea.WindowSizeMsg:
		m.Height = msg.Height
		m.Width = msg.Width
		m.ConstrainSize()
		_, chatWidth := m.columns()
		wrapped := wrap.String(strings.Join(m.State.ChatLog, "\n"), chatWidth)
		m.viewport.SetContent(wrapped)
		m.viewport.SetYOffset(m.viewport.YOffset + 100000000) // lol

	case tea.KeyMsg:
		switch msg.String() {
		case "esc":
			m.textInput.Blur()
			m.players.Blur()
			m.renderTable()
		case "j":
			fallthrough
		case "down":
			if m.textInput.Focused() {
				break
			}
			m.players.Focus()
			m.renderTable()
		case "k":
			fallthrough
		case "up":
			if m.textInput.Focused() {
				break
			}
			m.players.Focus()
			m.renderTable()
		case "i":
			if m.textInput.Focused() {
				break
			}
			m.players.Blur()
			m.renderTable()
			cmd = m.textInput.Focus()
			return m, cmd
		case "enter":
			if m.textInput.Focused() && m.textInput.Value() != "" {
				val := m.textInput.Value()
				if m.Common.ws != nil {
					msg := api.ChatMsg{Type: "chat", Msg: val}
					err := wsjson.Write(m.Common.ctx, m.Common.ws, msg)
					if err != nil {
						log.Println(err)
						break
					}
				}
				m.textInput.SetValue("")
				return m, nil
			}
		}
	}
	m.textInput, cmd = m.textInput.Update(msg)
	cmds = append(cmds, cmd)
	m.players, cmd = m.players.Update(msg)
	cmds = append(cmds, cmd)
	if !m.textInput.Focused() {
		m.viewport, cmd = m.viewport.Update(msg)
		cmds = append(cmds, cmd)
	}
	return m, tea.Batch(cmds...)
}

func (m GameScene) Init() tea.Cmd {
	return nil
}

func (m LobbyScene) Init() tea.Cmd {
	return nil
}

var Dice = [][]string{
	{},
	{
		"       ",
		"   ●   ",
		"       ",
	},
	{
		" ●     ",
		"       ",
		"     ● ",
	},
	{
		" ●     ",
		"   ●   ",
		"     ● ",
	},
	{
		" ●   ● ",
		"       ",
		" ●   ● ",
	},
	{
		" ●   ● ",
		"   ●   ",
		" ●   ● ",
	},
	{
		" ●   ● ",
		" ●   ● ",
		" ●   ● ",
	},
}

func (m GameScene) View() string {
	sidebarWidth, _ := m.columns()
	playerPanel := lipgloss.NewStyle().
		BorderStyle(lipgloss.RoundedBorder()).
		Width(sidebarWidth - 4).
		MarginRight(1).
		MarginLeft(1).
		Height(m.Height - 2 - 5 - 3)

	if m.players.Focused() {
		playerPanel.BorderForeground(lipgloss.Color("57"))
	}
	// var chatStr string
	// if m.State != nil {
	// 	chatStr = strings.Join(m.State.ChatLog, "\n")
	// }
	chat := lipgloss.JoinVertical(lipgloss.Left,
		m.viewport.View(),
		m.textInput.View())
	s := table.DefaultStyles()
	s.Header = s.Header.
		BorderStyle(lipgloss.NormalBorder()).
		BorderForeground(lipgloss.Color("240")).
		BorderBottom(true).
		Bold(false)
	s.Selected = s.Selected.
		Foreground(lipgloss.Color("229")).
		Background(lipgloss.Color("57")).
		Bold(false)
	m.players.SetStyles(s)

	die1s := lipgloss.NewStyle().
		BorderStyle(lipgloss.RoundedBorder()).
		Width(7).
		Height(3).MarginLeft(3).MarginRight(1)

	die2s := lipgloss.NewStyle().
		BorderStyle(lipgloss.RoundedBorder()).
		Width(7).
		Height(3)

	var die1v = 1
	var die2v = 1
	if m.State != nil {
		die1v = int(m.State.Rolls[0])
		die2v = int(m.State.Rolls[1])
	}
	die1 := m.Common.zone.Mark("die1", die1s.Render(strings.Join(Dice[die1v], "\n")))
	die2 := m.Common.zone.Mark("die2", die2s.Render(strings.Join(Dice[die2v], "\n")))
	dice := lipgloss.JoinHorizontal(lipgloss.Bottom, die1, die2)

	var addButton string
	var subButton string

	var add1Button string
	var sub1Button string
	var add2Button string
	var sub2Button string

	newGame := lipgloss.NewStyle().Height(3).Render("")
	rollButton := newGame

	underButtons := false

	var addColor = lipgloss.Color("#007bff")
	var subColor = lipgloss.Color("240")

	if m.State != nil {
		is7 := int(m.State.Rolls[0]+m.State.Rolls[1]) == 7
		if !m.State.Victory {
			if m.State.Rolled && m.SelfID == int(m.State.TurnIndex) && is7 {
				if !m.State.Used[0] {
					underButtons = true
					add1Button = m.Common.zone.Mark("add1", lipgloss.NewStyle().
						Foreground(lipgloss.Color(addColor)).
						BorderForeground(lipgloss.Color(addColor)).
						Width(2).
						MarginLeft(3).
						AlignHorizontal(lipgloss.Center).
						BorderStyle(lipgloss.RoundedBorder()).Render("+"))
					sub1Button = m.Common.zone.Mark("sub1", lipgloss.NewStyle().
						Foreground(lipgloss.Color(subColor)).
						BorderForeground(lipgloss.Color(subColor)).
						Width(2).
						MarginLeft(1).
						AlignHorizontal(lipgloss.Center).
						BorderStyle(lipgloss.RoundedBorder()).Render("-"))
				} else {
					add1Button = "            "
				}
				if !m.State.Used[1] {
					underButtons = true
					add2Button = m.Common.zone.Mark("add2", lipgloss.NewStyle().
						Foreground(lipgloss.Color(addColor)).
						BorderForeground(lipgloss.Color(addColor)).
						Width(2).
						MarginLeft(1).
						AlignHorizontal(lipgloss.Center).
						BorderStyle(lipgloss.RoundedBorder()).Render("+"))
					sub2Button = m.Common.zone.Mark("sub2", lipgloss.NewStyle().
						Foreground(lipgloss.Color(subColor)).
						BorderForeground(lipgloss.Color(subColor)).
						Width(2).
						MarginLeft(1).
						AlignHorizontal(lipgloss.Center).
						BorderStyle(lipgloss.RoundedBorder()).Render("-"))
				}
			}

			if m.State.Rolled && m.SelfID == int(m.State.TurnIndex) && !is7 {
				underButtons = true
				addButton = m.Common.zone.Mark("add", lipgloss.NewStyle().
					Foreground(lipgloss.Color(addColor)).
					BorderForeground(lipgloss.Color(addColor)).
					Width(7).
					MarginLeft(3).
					AlignHorizontal(lipgloss.Center).
					BorderStyle(lipgloss.RoundedBorder()).Render("+"))
				subButton = m.Common.zone.Mark("sub", lipgloss.NewStyle().
					Foreground(lipgloss.Color(subColor)).
					BorderForeground(lipgloss.Color(subColor)).
					Width(7).
					MarginLeft(1).
					AlignHorizontal(lipgloss.Center).
					BorderStyle(lipgloss.RoundedBorder()).Render("-"))
			}

			if !m.State.Rolled && m.SelfID == int(m.State.TurnIndex) {
				rollButton = m.Common.zone.Mark("roll", lipgloss.NewStyle().
					Foreground(lipgloss.Color("#00ff00")).
					BorderForeground(lipgloss.Color("#00ff00")).
					Width(sidebarWidth-8).
					MarginLeft(3).
					AlignHorizontal(lipgloss.Center).
					BorderStyle(lipgloss.RoundedBorder()).Render("Roll"))
			}
		}

		if m.State.Victory {
			newGame = m.Common.zone.Mark("newGame", lipgloss.NewStyle().
				Foreground(lipgloss.Color("#00ff00")).
				BorderForeground(lipgloss.Color("#00ff00")).
				Width(sidebarWidth-8).
				MarginLeft(3).
				AlignHorizontal(lipgloss.Center).
				BorderStyle(lipgloss.RoundedBorder()).Render("New Game"))
		}
	}

	underDice := lipgloss.JoinHorizontal(lipgloss.Bottom, addButton, subButton, add1Button, sub1Button, add2Button, sub2Button)
	if underButtons {
		rollButton = ""
	}
	if m.State != nil && !m.State.Victory {
		newGame = rollButton
	}
	bar := lipgloss.JoinVertical(lipgloss.Left, newGame, dice, underDice, playerPanel.Render(m.players.View()))

	scene := lipgloss.JoinHorizontal(lipgloss.Bottom, bar, chat)
	return lipgloss.NewStyle().
		BorderStyle(lipgloss.RoundedBorder()).
		Width(m.Width).
		Render(scene)
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func (m LobbyScene) View() string {

	var row string
	if m.ActiveTab == 0 {
		row = lipgloss.JoinHorizontal(
			lipgloss.Top,
			activeTab.Render("Primary Servers"),
			m.Common.zone.Mark("beta", tab.Render("Beta Servers")),
		)
	} else {
		row = lipgloss.JoinHorizontal(
			lipgloss.Top,
			m.Common.zone.Mark("primary", tab.Render("Primary Servers")),
			activeTab.Render("Beta Servers"),
		)
	}
	gap := tabGap.Render(strings.Repeat(" ", max(0, m.Width-lipgloss.Width(row)-2)))
	row = lipgloss.JoinHorizontal(lipgloss.Bottom, row, gap)

	return lipgloss.JoinVertical(lipgloss.Center, row, m.list.View())
}

type model struct {
	Common *CommonModel
	user   *user.User

	Width  int
	Height int

	roomList api.RoomListMsg
	err      error

	scene tea.Model
}

func startWebsocket(m model, s GameScene) {
	m.Common.mu.Lock()
	defer m.Common.mu.Unlock()
	ctx := m.Common.ctx
	prodWsUrl := os.Getenv("PROD_WS_URL")
	if len(prodWsUrl) == 0 {
		prodWsUrl = "wss://prod.rollycubes.com"
	}
	betaWsUrl := os.Getenv("BETA_WS_URL")
	if len(betaWsUrl) == 0 {
		betaWsUrl = "wss://beta.rollycubes.com"
	}
	var userIdStr string

	if m.Common.User != nil && len(m.Common.AccessToken) > 0 {
		userIdStr = "?userId=" + m.Common.User.Id
	}
	var serverURL string
	if s.TabID == 0 {
		serverURL = prodWsUrl + "/ws/room/" + s.roomCode + userIdStr
	} else {
		serverURL = betaWsUrl + "/ws/room/" + s.roomCode + userIdStr
	}
	ipstr, _, _ := net.SplitHostPort(m.Common.ctx.RemoteAddr().String())
	fingstring := ipstr + m.Common.ctx.ClientVersion() + m.Common.ctx.User()
	fingerprint := fmt.Sprintf("gateway:%x", sha1.Sum([]byte(fingstring)))
	c, _, err := websocket.Dial(ctx, serverURL, &websocket.DialOptions{HTTPHeader: http.Header{"Cookie": {"_session=" + fingerprint}}})
	if err != nil {
		fmt.Printf("Error connecting to websocket: %v+\n", err)
		return
	}

	if len(userIdStr) > 0 {
		if err = wsjson.Write(ctx, c, api.AuthenticateMsg{
			Type:        "authenticate",
			AccessToken: m.Common.AccessToken,
		}); err != nil {
			panic(err)
		}
	}
	m.Common.ws = c
	// Create a channel to signal when to close the connection

	waitForClose := func(ctx context.Context, conn *websocket.Conn, done chan struct{}) {
		select {
		case <-done:
			log.Println("Done signal")
		case <-ctx.Done():
			log.Println("Context canceled")
		}
		m.Common.mu.Lock()
		defer m.Common.mu.Unlock()
		m.Common.ws = nil
		conn.Close(websocket.StatusInternalError, "goodbye")
	}
	sendPings := func(ctx context.Context, conn *websocket.Conn) {
		for {
			if err = conn.Ping(ctx); err != nil {
				return
			}
			time.Sleep(time.Second * 30)
		}
	}
	readMessages := func(ctx context.Context, conn *websocket.Conn) {
		for {
			messageType, message, err := conn.Read(ctx)
			if err != nil {
				ctx.Done()
				return
			}
			fmt.Printf("Received message: %s\t%s\n", message, messageType)
			var wsMsg WebsocketMsg
			var tmp struct {
				Type string `json:"type"`
			}
			if err := json.Unmarshal(message, &tmp); err != nil {
				log.Printf("Error unmarshaling message: %v", err)
			}
			wsMsg.Type = tmp.Type
			wsMsg.Msg = message
			m.Common.program.Send(wsMsg)
		}
	}
	// Start a goroutine to read messages from the server
	go sendPings(ctx, c)
	go waitForClose(ctx, c, s.Common.disconnect)
	go readMessages(ctx, c)
}
func (m model) Init() tea.Cmd {
	return nil
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	m.Common.mu.Lock()
	defer m.Common.mu.Unlock()
	switch msg := msg.(type) {

	case tea.WindowSizeMsg:
		m.Width = msg.Width
		m.Height = msg.Height

	// Is it a key press?
	case tea.KeyMsg:

		// Cool, what was the actual key pressed?
		switch msg.String() {

		// These keys should exit the program.
		case "ctrl+q":
			return m, tea.Quit

		case "enter":
			lobbyScene, ok := m.scene.(LobbyScene)
			if !ok {
				// this will never happen (probably)
				break
			}
			if lobbyScene.list.SettingFilter() {
				break
			}
			var room api.Room
			if room, ok = lobbyScene.list.SelectedItem().(api.Room); !ok {
				log.Println("creating new room")
				var apiString string
				if lobbyScene.ActiveTab == 0 {
					apiString = "https://prod.rollycubes.com/create?public"
				} else {
					apiString = "https://beta.rollycubes.com/create?public"
				}

				resp, err := http.Get(apiString)
				if err != nil || resp.StatusCode != 200 {
					return m, nil
				}
				defer resp.Body.Close()
				bytes, err := io.ReadAll(resp.Body)
				if err != nil {
					return m, nil
				}
				room.Code = string(bytes)
			}
			columns := []table.Column{
				{Title: "Player", Width: 14},
				{Title: "Pts", Width: 3},
			}
			newScene := GameScene{
				viewport:  viewport.New(m.Width, m.Height-1),
				Common:    m.Common,
				roomCode:  room.Code,
				Width:     m.Width,
				Height:    m.Height,
				textInput: textinput.New(),
				players:   table.New(table.WithColumns(columns), table.WithHeight(8)),
				TabID:     lobbyScene.ActiveTab,
			}
			newScene.ConstrainSize()
			log.Println("new scene")
			m.scene = newScene
			go startWebsocket(m, newScene)
		}
	}

	var cmd tea.Cmd
	m.scene, cmd = m.scene.Update(msg)
	return m, cmd
}

func (m model) View() string {
	// The header
	s := "Welcome to Rolly Cubes!\n"

	if m.user != nil {
		s += "Welcome back, " + m.user.DisplayName + "!\n"
	}

	return m.Common.zone.Scan(lipgloss.Place(m.Width, m.Height, lipgloss.Center, lipgloss.Center, m.scene.View()))
}

// Create that fkin goooooooooooooooood token that lasts a whole ass year.
func signTheyJWT(u user.User, jwt_signing_key any) string {
	type MyCustomClaims struct {
		UserID      string `json:"user_id"`
		DisplayName string `json:"display_name"`
		jwt.RegisteredClaims
	}

	// Create the Claims
	claims := MyCustomClaims{
		u.Id,
		u.DisplayName,
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * 365 * time.Hour)),
			Issuer:    "gateway",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	ss, err := token.SignedString(jwt_signing_key)
	if err != nil {
		return ""
	}
	return ss
}

func bubbleTeaMiddleware(store *user.Store, jwt_signing_key any) wish.Middleware {
	cp := termenv.ANSI256
	h := func(s ssh.Session) *tea.Program {
		pty, _, active := s.Pty()
		if !active {
			log.Printf("no active terminal, skipping")
			return nil
		}
		key := s.PublicKey()
		var u *user.User
		var theyJWT string
		if key != nil {
			bytes := key.Marshal()
			based := url.QueryEscape(b64.StdEncoding.EncodeToString(bytes))
			u = store.Take(based)
			if u != nil {
				log.Println("WE SIGNING A JWT")
				theyJWT = signTheyJWT(*u, jwt_signing_key)
				log.Print(len(theyJWT))
			}
		}
		ch := make(chan struct{})
		commonModel := &CommonModel{
			ctx:         s.Context(),
			mu:          &sync.Mutex{},
			disconnect:  ch,
			zone:        zone.New(),
			session:     s,
			AccessToken: theyJWT,
			User:        u,
		}
		newList := list.New([]list.Item{}, list.NewDefaultDelegate(), pty.Window.Width, pty.Window.Height-4)
		newList.SetStatusBarItemName("room", "rooms")
		lobbyScene := LobbyScene{
			Common: commonModel,
			list:   newList,
			Width:  pty.Window.Width,
			Height: pty.Window.Height,
		}
		lobbyScene.list.Title = "Active Rooms"

		model := &model{
			Common: commonModel,

			user: u,

			// A map which indicates which choices are selected. We're using
			// the  map like a mathematical set. The keys refer to the indexes
			// of the `choices` slice, above.
			Width:  pty.Window.Width,
			Height: pty.Window.Height,
			scene:  lobbyScene,
		}
		opts := []tea.ProgramOption{tea.WithAltScreen(), tea.WithMouseCellMotion()}
		opts = append(opts, tea.WithInput(s), tea.WithOutput(s))
		p := tea.NewProgram(model, opts...)
		commonModel.program = p
		return p
	}
	return bubbletea.MiddlewareWithProgramHandler(h, cp)
}

func main() {
	dat, err := os.ReadFile("secrets/.id")
	if err != nil {
		panic(err)
	}
	block, _ := pem.Decode(dat)
	jwt_signing_key, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		panic(err)
	}

	authUrl := os.Getenv("AUTH_URL")
	if len(authUrl) == 0 {
		authUrl = "https://auth.rollycubes.com"
	}
	store := user.NewStore()
	server, err := wish.NewServer(
		wish.WithAddress("0.0.0.0:3022"),
		wish.WithIdleTimeout(30*time.Minute),
		wish.WithHostKeyPath("secrets/ssh_host_key"),
		wish.WithPublicKeyAuth(func(ctx ssh.Context, key ssh.PublicKey) bool {
			bytes := key.Marshal()
			based := url.QueryEscape(b64.StdEncoding.EncodeToString(bytes))
			resp, err := http.Get(authUrl + "/pubkey/" + based)
			if err != nil || resp.StatusCode != 200 {
				return false
			}
			defer resp.Body.Close()
			bytes, err = io.ReadAll(resp.Body)
			if err != nil {
				return false
			}
			var u user.User
			if err = json.Unmarshal(bytes, &u); err != nil {
				return false
			}

			store.Put(based, u)

			// TODO: issue our own access token because auth is an illusion and reality can be whatever we want
			return true
		}),
		wish.WithKeyboardInteractiveAuth(func(ctx ssh.Context, challenger gossh.KeyboardInteractiveChallenge) bool {
			// fallback to unauthenticated access
			return true
		}),
		wish.WithMiddleware(
			bubbleTeaMiddleware(&store, jwt_signing_key),
			lm.Middleware(),
		))
	if err != nil {
		panic(err)
	}
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	log.Printf("starting server: %s", server.Addr)
	go func() {
		if err := server.ListenAndServe(); err != nil {
			log.Fatalf("server returned an error: %s", err)
		}
	}()

	<-done
	log.Println("stopping server...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("could not shutdown server gracefully: %s", err)
	}
}
