package config

type Route struct {
	PathPrefix string
	Target     string
}

var routes = []Route{
	{
		PathPrefix: "/api/addresses",
		Target:     "http://localhost:8080",
	},
	{
		PathPrefix: "/api/addresses",
		Target:     "http://localhost:8080",
	},
}
