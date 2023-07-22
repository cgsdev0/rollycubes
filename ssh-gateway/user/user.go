package user

import (
	"sync"
)

type User struct {
	DisplayName string `json:"display_name"`
	Id          string `json:"id"`
}

// Store is safe to use concurrently.
type Store struct {
	mu sync.Mutex
	v  map[string]User
}

func NewStore() Store {
	return Store{
		v: make(map[string]User),
	}
}
func (c *Store) Put(key string, u User) {
	c.mu.Lock()
	c.v[key] = u
	c.mu.Unlock()
}

func (c *Store) Take(key string) *User {
	c.mu.Lock()
	defer c.mu.Unlock()
	if val, ok := c.v[key]; ok {
		delete(c.v, key)
		return &val
	}
	return nil
}
