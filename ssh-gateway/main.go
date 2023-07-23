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
	"syscall"
	"time"

	"github.com/cgsdev0/rollycubes/ssh-gateway/api"
	"github.com/cgsdev0/rollycubes/ssh-gateway/user"

	"github.com/charmbracelet/bubbles/list"
	tea "github.com/charmbracelet/bubbletea"
	ssh "github.com/charmbracelet/ssh"
	wish "github.com/charmbracelet/wish"
	bm "github.com/charmbracelet/wish/bubbletea"
	lm "github.com/charmbracelet/wish/logging"
	gossh "golang.org/x/crypto/ssh"
	"nhooyr.io/websocket"
)

type LobbyScene struct {
	list list.Model
}

type GameScene struct {
	roomCode   string
	disconnect chan struct{}
}

type SwitchSceneMsg struct {
	scene tea.Model
}

func (m LobbyScene) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {

	case tea.WindowSizeMsg:
		m.list.SetHeight(msg.Height - 2)
		m.list.SetWidth(msg.Width - 4)

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
	return m, nil
}

func (m GameScene) Init() tea.Cmd {
	return nil
}

func (m LobbyScene) Init() tea.Cmd {
	return nil
}

func (m GameScene) View() string {
	return m.roomCode
}

func (m LobbyScene) View() string {
	return m.list.View()
}

type model struct {
	user *user.User

	session ssh.Session

	choices  []string         // items on the to-do list
	cursor   int              // which to-do list item our cursor is pointing at
	selected map[int]struct{} // which to-do items are selected

	width  int
	height int

	stuff    string
	roomList api.RoomList
	err      error

	scene tea.Model
}

func startWebsocket(ctx ssh.Context, m model, s GameScene) {
	serverURL := "wss://rollycubes.com/ws/room/" + s.roomCode
	c, _, err := websocket.Dial(ctx, serverURL, &websocket.DialOptions{HTTPHeader: http.Header{"Cookie": {"_session=awefo34irj2r04"}}})
	if err != nil {
		// ...
		panic(err)
	}
	// Create a channel to signal when to close the connection

	waitForClose := func(ctx context.Context, conn *websocket.Conn, done chan struct{}) {
		defer close(done)
		<-done
		log.Println("recv")
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
		m.width = msg.Width
		m.height = msg.Height

	// Is it a key press?
	case tea.KeyMsg:

		// Cool, what was the actual key pressed?
		switch msg.String() {

		// These keys should exit the program.
		case "ctrl+c", "q":
			return m, tea.Quit

			// The "enter" key and the spacebar (a literal space) toggle
			// the selected state for the item that the cursor is pointing at.
		case "enter":
			lobbyScene, ok := m.scene.(LobbyScene)
			if !ok {
				log.Println("not lobby")
				return m, nil
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
			newScene := GameScene{roomCode: room.Code, disconnect: ch}
			log.Println("new scene")
			m.scene = newScene
			go startWebsocket(m.session.Context(), m, newScene)
			return m, nil
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
			bm.Middleware(func(s ssh.Session) (tea.Model, []tea.ProgramOption) {
				pty, _, active := s.Pty()
				if !active {
					log.Printf("no active terminal, skipping")
					return nil, nil
				}
				key := s.PublicKey()
				var u *user.User
				if key != nil {
					bytes := key.Marshal()
					based := url.QueryEscape(b64.StdEncoding.EncodeToString(bytes))
					u = store.Take(based)
				}
				lobbyScene := LobbyScene{
					list: list.New([]list.Item{}, list.NewDefaultDelegate(), pty.Window.Width-6, pty.Window.Height-2),
				}
				lobbyScene.list.Title = "Active Rooms"
				model := &model{
					user: u,

					session: s,
					// A map which indicates which choices are selected. We're using
					// the  map like a mathematical set. The keys refer to the indexes
					// of the `choices` slice, above.
					selected: make(map[int]struct{}),
					width:    pty.Window.Width,
					height:   pty.Window.Height,
					scene:    lobbyScene,
				}
				return model, []tea.ProgramOption{tea.WithAltScreen()}
			}),
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
