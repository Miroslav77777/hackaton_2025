package proxy

import (
	"net/http/httputil"
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"
)

type Route struct {
	PathPrefix string
	Target     string
}

var Routes = []Route{
	// Example route:
	{PathPrefix: "/api", Target: "http://localhost:8081"},
	// Добавляем проксирование на brigade-service
	{PathPrefix: "/brigade", Target: "http://localhost:3001"},
}

func SetupProxyRoutes(router *gin.Engine) {
	for _, route := range Routes {
		target, err := url.Parse(route.Target)
		if err != nil {
			panic("Invalid target URL: " + route.Target)
		}

		proxy := httputil.NewSingleHostReverseProxy(target)

		// Создаём хендлер для каждого префикса
		// Проксируем: /api/addresses → /addresses, /brigade/xxx → /xxx
		handler := func(prefix string, proxy *httputil.ReverseProxy) gin.HandlerFunc {
			return func(c *gin.Context) {
				c.Request.URL.Path = strings.TrimPrefix(c.Request.URL.Path, prefix)
				proxy.ServeHTTP(c.Writer, c.Request)
			}
		}
		router.Any(route.PathPrefix+"/*any", handler(route.PathPrefix, proxy))
	}
}
