package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"auth-service/internal/service"
)

type AuthHandler struct {
	svc *service.AuthService
}

func NewAuthHandler(s *service.AuthService) *AuthHandler {
	return &AuthHandler{svc: s}
}

type authReq struct {
	Username     string `json:"username"`
	Password     string `json:"password,omitempty"`
	RefreshToken string `json:"refresh_token,omitempty"`
}

type authResp struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req authReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	at, rt, err := h.svc.Login(req.Username, req.Password)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	json.NewEncoder(w).Encode(authResp{AccessToken: at, RefreshToken: rt})
}

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	var req authReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.RefreshToken == "" {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	at, rt, err := h.svc.Refresh(req.RefreshToken)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	json.NewEncoder(w).Encode(authResp{AccessToken: at, RefreshToken: rt})
}

func (h *AuthHandler) Protected(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(int)
	w.Write([]byte(fmt.Sprintf("Hello, user #%d!", userID)))
}
