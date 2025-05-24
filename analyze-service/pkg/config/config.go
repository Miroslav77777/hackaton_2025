package config

import (
	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

// Config — все настройки приложения
type Config struct {
	DBUrl              string  `mapstructure:"DB_URL"`
	HTTPPort           string  `mapstructure:"HTTP_PORT"`
	WeatherAPIKey      string  `mapstructure:"WEATHER_API_KEY"`
	DefaultLatitude    float64 `mapstructure:"DEFAULT_LAT"`
	DefaultLongitude   float64 `mapstructure:"DEFAULT_LON"`
	City               string  `mapstructure:"CITY"`
	AnalysisWindowDays int     `mapstructure:"ANALYSIS_WINDOW_DAYS"`
	Concurrency        int     `mapstructure:"CONCURRENCY"`
}

func Load() (*Config, error) {
	// 1) подгружаем .env, если он есть рядом с кодом
	_ = godotenv.Load("pkg/config/.env")

	// 2) автоматический рид окружения
	viper.AutomaticEnv()

	// 3) дефолты
	viper.SetDefault("HTTP_PORT", "8080")
	viper.SetDefault("ANALYSIS_WINDOW_DAYS", 30)
	viper.SetDefault("CITY", "Краснодар")
	viper.SetDefault("CONCURRENCY", 100)

	// 4) биндим нужные переменные
	viper.BindEnv("DB_URL")
	viper.BindEnv("HTTP_PORT")
	viper.BindEnv("WEATHER_API_KEY")
	viper.BindEnv("DEFAULT_LAT")
	viper.BindEnv("DEFAULT_LON")
	viper.BindEnv("CITY")
	viper.BindEnv("ANALYSIS_WINDOW_DAYS")
	viper.BindEnv("CONCURRENCY")

	// 5) читаем в структуру
	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}
