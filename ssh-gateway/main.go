package main

import (
	"context"
	b64 "encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
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
	zone "github.com/lrstanley/bubblezone"
	"github.com/muesli/reflow/wrap"
	gossh "golang.org/x/crypto/ssh"
	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

type CommonModel struct {
	mu         *sync.Mutex
	ctx        ssh.Context
	ws         *websocket.Conn
	program    *tea.Program
	disconnect chan struct{}
	zone       *zone.Manager
}

type LobbyScene struct {
	Common *CommonModel
	list   list.Model
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

func (m LobbyScene) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {

	case tea.WindowSizeMsg:
		m.list.SetHeight(msg.Height)
		m.list.SetWidth(msg.Width)

	// Is it a key press?
	case tea.KeyMsg:

		// Cool, what was the actual key pressed?
		switch msg.String() {

		case "r":
			resp, err := http.Get("https://rollycubes.com/list")

			if err != nil {
				log.Println(err)
				return m, nil
			}
			defer resp.Body.Close()
			body, err := io.ReadAll(resp.Body)
			roomList, err := api.UnmarshalRoomList(body)
			if err != nil {
				log.Println(err)
				return m, nil
			}
			m.list.SetItems(nil)
			var cmd tea.Cmd
			// TODO: sort and filter room list
			for i, v := range roomList.Rooms {
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
				msg := api.RollMsg{Type: api.Roll}
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
		case "restart":
			restart, err := api.UnmarshalRestartMsg(msg.Msg)
			if err != nil {
				log.Printf("idfk it broke %v+\n", err)
				break
			}
			m.State.TurnIndex = restart.ID
			m.State.Used[0] = false
			m.State.Used[1] = false
			var rows []table.Row
			for i := range m.State.Players {
				m.State.Players[i].Score = 0
				var name string
				if m.State.Players[i].Name == nil {
					name = "User" + fmt.Sprint(i+1)
				} else {
					name = *m.State.Players[i].Name
				}
				rows = append(rows, table.Row{name, fmt.Sprint(m.State.Players[i].Score)})
			}
			m.players.SetRows(rows)
			m.State.Victory = false
			m.State.Rolled = false
			m.players.SetCursor(int(m.State.TurnIndex))
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
			var rows []table.Row
			for i, player := range state.Players {
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
			m.players.SetCursor(int(state.TurnIndex))
			// Put the chat into the pager
			reverse(state.ChatLog)
			m.State = &state
			wrapped := wrap.String(strings.Join(m.State.ChatLog, "\n"), chatWidth-1)
			m.viewport.SetContent(wrapped)
			m.viewport.SetYOffset(m.viewport.YOffset + 100000000) // lol
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
		case "i":
			if m.textInput.Focused() {
				break
			}
			cmd = m.textInput.Focus()
			return m, cmd
		case "enter":
			if m.textInput.Focused() && m.textInput.Value() != "" {
				val := m.textInput.Value()
				if m.Common.ws != nil {
					msg := api.ChatMsg{Type: api.Chat, Msg: val}
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

	var rollButton string
	var addButton string
	var subButton string

	var add1Button string
	var sub1Button string
	var add2Button string
	var sub2Button string

	var newGame string

	var addColor = lipgloss.Color("#007bff")
	var subColor = lipgloss.Color("240")

	if m.State != nil {
		is7 := int(m.State.Rolls[0]+m.State.Rolls[1]) == 7
		if !m.State.Victory {
			if m.State.Rolled && m.SelfID == int(m.State.TurnIndex) && is7 {
				if !m.State.Used[0] {
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

func (m LobbyScene) View() string {
	return m.list.View()
}

type model struct {
	Common *CommonModel
	user   *user.User

	session ssh.Session

	Width  int
	Height int

	roomList api.RoomList
	err      error

	scene tea.Model
}

func startWebsocket(m model, s GameScene) {
	m.Common.mu.Lock()
	defer m.Common.mu.Unlock()
	ctx := m.Common.ctx
	prodWsUrl := os.Getenv("PROD_WS_URL")
	if len(prodWsUrl) == 0 {
		prodWsUrl = "wss://rollycubes.com"
	}
	serverURL := prodWsUrl + "/ws/room/" + s.roomCode
	c, _, err := websocket.Dial(ctx, serverURL, &websocket.DialOptions{HTTPHeader: http.Header{"Cookie": {"_session=awefo34irj2r04"}}})
	if err != nil {
		fmt.Printf("Error connecting to websocket: %v+\n", err)
		return
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

			// The "enter" key and the spacebar (a literal space) toggle
			// the selected state for the item that the cursor is pointing at.
		case "enter":
			lobbyScene, ok := m.scene.(LobbyScene)
			if !ok {
				break
			}
			if lobbyScene.list.SettingFilter() {
				log.Println("filtering")
				break
			}
			var room api.Room
			if room, ok = lobbyScene.list.SelectedItem().(api.Room); !ok {
				log.Println("not selected")
				return m, nil
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

func bubbleTeaMiddleware(store *user.Store) wish.Middleware {
	cp := termenv.ANSI256
	h := func(s ssh.Session) *tea.Program {
		pty, _, active := s.Pty()
		if !active {
			log.Printf("no active terminal, skipping")
			return nil
		}
		key := s.PublicKey()
		var u *user.User
		if key != nil {
			bytes := key.Marshal()
			based := url.QueryEscape(b64.StdEncoding.EncodeToString(bytes))
			u = store.Take(based)
		}
		ch := make(chan struct{})
		commonModel := &CommonModel{
			ctx:        s.Context(),
			mu:         &sync.Mutex{},
			disconnect: ch,
			zone:       zone.New(),
		}
		lobbyScene := LobbyScene{
			Common: commonModel,
			list:   list.New([]list.Item{}, list.NewDefaultDelegate(), pty.Window.Width-6, pty.Window.Height-2),
		}
		lobbyScene.list.Title = "Active Rooms"

		model := &model{
			Common: commonModel,

			user: u,

			session: s,
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
	store := user.NewStore()
	server, err := wish.NewServer(
		wish.WithAddress("0.0.0.0:3022"),
		wish.WithIdleTimeout(30*time.Minute),
		wish.WithHostKeyPath("secrets/ssh_host_key"),
		wish.WithPublicKeyAuth(func(ctx ssh.Context, key ssh.PublicKey) bool {
			bytes := key.Marshal()
			based := url.QueryEscape(b64.StdEncoding.EncodeToString(bytes))
			resp, err := http.Get("http://localhost:3031/pubkey/" + based)
			if err != nil || resp.StatusCode != 200 {
				return false
			}
			defer resp.Body.Close()
			bytes, err = io.ReadAll(resp.Body)
			if err != nil {
				return false
			}
			log.Printf("%s\n", string(bytes))
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
			bubbleTeaMiddleware(&store),
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
