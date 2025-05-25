package main

import (
	"database/sql"
	"log"
	"net/http"

	handler "risk-service/handlers"
	"risk-service/repository"

	_ "github.com/lib/pq"
)

func main() {
	db, err := sql.Open("postgres", "postgres://tenivatt:ZXCghoul1337228@217.198.6.110:5432/tenivatt?sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	repo := &repository.AddressRepo{DB: db}
	handler := &handler.Handler{Repo: repo}

	if err := handler.LoadGeoJSON("data/krasnodar_buildings.geojson"); err != nil {
		log.Fatalf("failed to load geojson: %v", err)
	}

	http.HandleFunc("/addresses", handler.GetAddresses)

	log.Println("Listening on :8081")
	log.Fatal(http.ListenAndServe(":8081", nil))
}
