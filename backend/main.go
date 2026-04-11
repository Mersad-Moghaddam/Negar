package main

import (
	"context"
	"log"
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

	cfg, err := configs.Load()
	if err != nil {
		log.Fatal(err)
	}
	logger := requestctx.NewLogger()

	db, err := gorm.Open(mysql.Open(cfg.MySQLDSN()), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}
	if err = repositories.AssertSchema(db); err != nil {
		log.Fatal(err)
	}

	rdb := redis.NewClient(&redis.Options{Addr: cfg.RedisAddr, Password: cfg.RedisPassword, DB: cfg.RedisDB})
	if err = rdb.Ping(context.Background()).Err(); err != nil {
		log.Fatal(err)
	}

	deps := initRepositories.New(db, rdb)
	ir := repositories.NewInitialRepositories(deps)
	server := core.NewServer(cfg, mainController.DepsFromInitialRepositories(ir), logger)

	go func() {
		if err = server.Listen(":" + cfg.AppPort); err != nil {
			log.Printf("server stopped: %v", err)
		}
	}()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	<-sigCh

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = server.ShutdownWithContext(ctx)
	sqlDB, _ := db.DB()
	if sqlDB != nil {
		_ = sqlDB.Close()
	}
	_ = rdb.Close()
}
