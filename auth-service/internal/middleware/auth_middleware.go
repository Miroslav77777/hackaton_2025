package middleware

import (
	"context"
	"net/http"
	"strings"

	"auth-service/internal/utils"

	"github.com/golang-jwt/jwt"
)

type contextKey string

func JWTAuth(secret []byte) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			hdr := r.Header.Get("Authorization")
			parts := strings.SplitN(hdr, " ", 2)
			if len(parts) != 2 || parts[0] != "Bearer" {
				http.Error(w, "missing auth header", http.StatusUnauthorized)
				return
			}
			tok, err := utils.ParseToken(parts[1], secret)
			if err != nil || !tok.Valid {
				http.Error(w, "invalid token", http.StatusUnauthorized)
				return
			}
			claims := tok.Claims.(jwt.MapClaims)
			uid := int(claims["sub"].(float64))
			ctx := context.WithValue(r.Context(), contextKey("user_id"), uid)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
