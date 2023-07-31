package api

import "fmt"

func (i Room) Title() string       { return i.HostName }
func (i Room) Description() string { return fmt.Sprint(i.PlayerCount) }
func (i Room) FilterValue() string { return i.HostName }

type SimpleMsg struct {
	Type string `json:"type"`
}

type AddSubNMsg struct {
	Type string `json:"type"`
	Idx  int    `json:"n"`
}

type AuthenticateMsg struct {
	Type        string `json:"type"`
	AccessToken string `json:"access_token"`
}
