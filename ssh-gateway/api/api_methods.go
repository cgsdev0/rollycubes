package api

import "fmt"

func (i Room) Title() string       { return i.HostName }
func (i Room) Description() string { return fmt.Sprint(i.PlayerCount) }
func (i Room) FilterValue() string { return i.HostName }
