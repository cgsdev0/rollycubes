package user

import "context"

var ContextKey = struct{ string }{"user"}

func WithContext(ctx context.Context, user *User) context.Context {
	return context.WithValue(ctx, ContextKey, user)
}

func FromContext(ctx context.Context) *User {
	if c, ok := ctx.Value(ContextKey).(*User); ok {
		return c
	}

	return nil
}
