package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"libro-backend/controllers/mainController"
	"libro-backend/middleware/requestctx"
	"libro-backend/repositories"
	"libro-backend/repositories/initRepositories"
	"libro-backend/services/core"
	"libro-backend/statics/configs"
)

func main() {
	_ = godotenv.Load("dev.env")

	logger := requestctx.NewLogger()

	cfg, err := configs.Load()
	if err != nil {
		logger.Error("config_load_failed", "error", err.Error())
		os.Exit(1)
	}

	db, err := gorm.Open(mysql.Open(cfg.MySQLDSN()), &gorm.Config{})
	if err != nil {
		logger.Error("mysql_connect_failed", "error", err.Error())
		os.Exit(1)
	}
	if err = repositories.AssertSchema(db); err != nil {
		logger.Error("schema_check_failed", "error", err.Error())
		os.Exit(1)
	}

	rdb := redis.NewClient(&redis.Options{Addr: cfg.RedisAddr, Password: cfg.RedisPassword, DB: cfg.RedisDB})
	if err = rdb.Ping(context.Background()).Err(); err != nil {
		logger.Error("redis_connect_failed", "error", err.Error())
		os.Exit(1)
	}

	deps := initRepositories.New(db, rdb)
	ir := repositories.NewInitialRepositories(deps)
	server := core.NewServer(cfg, mainController.DepsFromInitialRepositories(ir), logger)

	listenErrCh := make(chan error, 1)
	go func() {
		listenErrCh <- server.Listen(":" + cfg.AppPort)
	}()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-sigCh:
		logger.Info("shutdown_signal", "signal", sig.String())
	case listenErr := <-listenErrCh:
		if listenErr != nil {
			logger.Error("http_server_stopped", "error", listenErr.Error())
			os.Exit(1)
		}
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = server.ShutdownWithContext(ctx)
	sqlDB, _ := db.DB()
	if sqlDB != nil {
		_ = sqlDB.Close()
	}
	_ = rdb.Close()
}
