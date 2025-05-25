package main

import (
	"log"
	"time"

	"api-gateway/proxy"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	// --- CORS-политики ---
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"*",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "ngrok-skip-browser-warning"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Настраиваем проксирование
	proxy.SetupProxyRoutes(router)

	log.Println("🚀 API Gateway listening on :9000")
	if err := router.Run(":9999"); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
