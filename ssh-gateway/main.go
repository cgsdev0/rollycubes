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
	"github.com/charmbracelet/lipgloss"
	ssh "github.com/charmbracelet/ssh"
	wish "github.com/charmbracelet/wish"
	bm "github.com/charmbracelet/wish/bubbletea"
	lm "github.com/charmbracelet/wish/logging"
	gossh "golang.org/x/crypto/ssh"
)

type model struct {
	user *user.User

	list     list.Model
	choices  []string         // items on the to-do list
	cursor   int              // which to-do list item our cursor is pointing at
	selected map[int]struct{} // which to-do items are selected

	width  int
	height int

	stuff    string
	roomList api.RoomList
	err      error
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

		// The "up" and "k" keys move the cursor up
		case "up", "k":
			if m.cursor > 0 {
				m.cursor--
			}

		// The "down" and "j" keys move the cursor down
		case "down", "j":
			if m.cursor < len(m.choices)-1 {
				m.cursor++
			}

		// The "enter" key and the spacebar (a literal space) toggle
		// the selected state for the item that the cursor is pointing at.
		case "enter", " ":
			log.Printf("making a req\n")
			resp, err := http.Get("https://rollycubes.com/list")

			if err != nil {
				m.err = err
				return nil, nil
			}
			defer resp.Body.Close()
			body, err := io.ReadAll(resp.Body)
			roomList, err := api.UnmarshalRoomList(body)
			if err != nil {
				m.err = err
				return nil, nil
			}
			m.roomList = roomList
			return m, m.list.SetItems(m.roomList.Rooms)
		}
	}

	var cmd tea.Cmd
	m.list, cmd = m.list.Update(msg)
	return m, cmd
}

func (m model) View() string {
	// The header
	s := "Welcome to Rolly Cubes!\n"

	if m.user != nil {
		s = "Welcome back, " + m.user.DisplayName + "!\n"
	}

	var page = lipgloss.NewStyle().
		BorderStyle(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color("228")).
		Width(m.width - 2).
		Height(m.height - 2).Padding(1).PaddingTop(0).PaddingBottom(0)

	if m.err != nil {
		s += fmt.Sprintf("error! %s\n", m.err)
	} else {
		for _, room := range m.roomList.Rooms {

			// Render the row
			s += fmt.Sprintf("room: %s\n", room.HostName)
		}
	}

	// The footer
	s += "\nPress q to quit.\n"

	// Send the UI for rendering
	// Set a rounded, yellow-on-purple border to the top and left
	return page.Render(m.list.View())
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

				model := &model{
					user: u,

					list: list.New(nil, list.NewDefaultDelegate(), 0, 0),
					// A map which indicates which choices are selected. We're using
					// the  map like a mathematical set. The keys refer to the indexes
					// of the `choices` slice, above.
					selected: make(map[int]struct{}),
					width:    pty.Window.Width,
					height:   pty.Window.Height,
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
