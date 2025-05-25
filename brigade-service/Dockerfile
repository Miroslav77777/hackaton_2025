# syntax=docker/dockerfile:1

# --- BUILD STAGE ---
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /brigade-service ./api/main.go

# --- FINAL IMAGE ---
FROM alpine:3.18
RUN apk add --no-cache ca-certificates
COPY --from=builder /brigade-service /brigade-service
COPY reports /reports
WORKDIR /
ENTRYPOINT ["/brigade-service"]
EXPOSE 8080
