FROM golang:1.20-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /tenivatt ./cmd/server
RUN CGO_ENABLED=0 GOOS=linux go build -o /tenivatt-hourly ./cmd/hourly
RUN CGO_ENABLED=0 GOOS=linux go build -o /tenivatt-baseline ./cmd/baseline
RUN CGO_ENABLED=0 GOOS=linux go build -o /tenivatt-fetch-weather ./cmd/fetch_weather

FROM scratch
COPY --from=builder /tenivatt        /tenivatt
COPY --from=builder /tenivatt-hourly  /tenivatt-hourly
COPY --from=builder /tenivatt-baseline /tenivatt-baseline
COPY --from=builder /tenivatt-fetch-weather /tenivatt-fetch-weather
ENTRYPOINT ["/tenivatt"]   # по умолчанию запускаем HTTP-server
