# --- BUILD STAGE ---
FROM golang:1.20-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /auth-service ./cmd/server

# --- FINAL IMAGE ---
FROM alpine:3.17
RUN apk add --no-cache ca-certificates
COPY --from=builder /auth-service /auth-service
WORKDIR /
ENTRYPOINT ["/auth-service"]
EXPOSE 8080
