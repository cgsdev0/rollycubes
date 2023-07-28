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
	"syscall"
	"time"

	api "github.com/cgsdev0/rollycubes/ssh-gateway/api"
	"github.com/cgsdev0/rollycubes/ssh-gateway/user"
	"github.com/muesli/termenv"

	"github.com/charmbracelet/bubbles/list"
	"github.com/charmbracelet/bubbles/textinput"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	ssh "github.com/charmbracelet/ssh"
	wish "github.com/charmbracelet/wish"
	"github.com/charmbracelet/wish/bubbletea"
	lm "github.com/charmbracelet/wish/logging"
	gossh "golang.org/x/crypto/ssh"
	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

type CommonModel struct {
	ctx     ssh.Context
	ws      *websocket.Conn
	program *tea.Program
}

type LobbyScene struct {
	Common *CommonModel
	list   list.Model
}

type GameScene struct {
	Common *CommonModel
	State  *api.GameState
	Width  int
	Height int

	viewport   viewport.Model
	textInput  textinput.Model
	roomCode   string
	disconnect chan struct{}
}

type SwitchSceneMsg struct {
	scene tea.Model
}

type WebsocketMsg struct {
	Msg  []byte
	Type string
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

func (m GameScene) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd
	switch msg := msg.(type) {
	case WebsocketMsg:
		switch msg.Type {
		case "welcome":
			welcome, err := api.UnmarshalWelcomeMsg(msg.Msg)
			if err != nil {
				log.Printf("idfk it broke %v+\n", err)
				break
			}
			state, err := api.UnmarshalGameState(msg.Msg)
			if err != nil {
				log.Printf("idfk it broke %v+\n", err)
				break
			}
			fmt.Printf("Your index is %d\n", welcome.ID)
			reverse(state.ChatLog)
			m.State = &state
			m.viewport.SetContent(strings.Join(m.State.ChatLog, "\n"))
			m.viewport.SetYOffset(m.viewport.YOffset + 100000000) // lol
		case "chat":
			chat, err := api.UnmarshalChatMsg(msg.Msg)
			if err != nil {
				log.Printf("idfk it broke %v+\n", err)
				break
			}
			m.State.ChatLog = append(m.State.ChatLog, chat.Msg)
			m.viewport.SetContent(strings.Join(m.State.ChatLog, "\n"))
			m.viewport.SetYOffset(m.viewport.YOffset + 100000000) // lol
		}
	case tea.WindowSizeMsg:
		m.Height = msg.Height
		m.Width = msg.Width
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
	var cmd2 tea.Cmd
	m.textInput, cmd2 = m.textInput.Update(msg)
	var cmd3 tea.Cmd
	if !m.textInput.Focused() {
		m.viewport, cmd3 = m.viewport.Update(msg)
	}
	return m, tea.Batch(cmd, cmd2, cmd3)
}

func (m GameScene) Init() tea.Cmd {
	return nil
}

func (m LobbyScene) Init() tea.Cmd {
	return nil
}

func (m GameScene) View() string {
	// var chat = lipgloss.NewStyle().
	// 	BorderStyle(lipgloss.RoundedBorder()).
	// 	BorderForeground(lipgloss.Color("228")).
	// 	BorderBackground(lipgloss.Color("63"))

	// var chatStr string
	// if m.State != nil {
	// 	chatStr = strings.Join(m.State.ChatLog, "\n")
	// }
	return lipgloss.JoinVertical(lipgloss.Left,
		m.viewport.View(),
		m.textInput.View())
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

	stuff    string
	roomList api.RoomList
	err      error

	scene tea.Model
}

func startWebsocket(m model, s GameScene) {
	ctx := m.Common.ctx
	serverURL := "wss://rollycubes.com/ws/room/" + s.roomCode
	c, _, err := websocket.Dial(ctx, serverURL, &websocket.DialOptions{HTTPHeader: http.Header{"Cookie": {"_session=awefo34irj2r04"}}})
	if err != nil {
		// ...
		panic(err)
	}
	m.Common.ws = c
	// Create a channel to signal when to close the connection

	waitForClose := func(ctx context.Context, conn *websocket.Conn, done chan struct{}) {
		defer close(done)
		<-done
		log.Println("recv")
		m.Common.ws = nil
		conn.Close(websocket.StatusInternalError, "goodbye")
	}
	readMessages := func(ctx context.Context, conn *websocket.Conn) {
		for {
			messageType, message, err := conn.Read(ctx)
			if err != nil {
				log.Printf("Error reading message: %v", err)
				// TODO: retry connection?
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
	go waitForClose(ctx, c, s.disconnect)
	go readMessages(ctx, c)
}
func (m model) Init() tea.Cmd {
	return nil
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
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
			ch := make(chan struct{})
			newScene := GameScene{
				viewport:   viewport.New(m.Width, m.Height-1),
				Common:     m.Common,
				roomCode:   room.Code,
				disconnect: ch,
				Width:      m.Width,
				Height:     m.Height,
				textInput:  textinput.New(),
			}
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

	return m.scene.View()
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
		commonModel := &CommonModel{ctx: s.Context()}
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
		opts := []tea.ProgramOption{tea.WithAltScreen()}
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
		wish.WithAddress("127.0.0.1:3022"),
		wish.WithIdleTimeout(30*time.Minute),
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
