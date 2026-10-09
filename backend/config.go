package backend

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
)

type AppConfig struct {
	Theme          string `json:"theme"`                    // "dark" | "light"
	Lang           string `json:"lang"`                     // "ja" | "en"
	TurnServerURL  string `json:"turnServerUrl,omitempty"`  // "turn:host:port"
	TurnUsername   string `json:"turnUsername,omitempty"`   // username
	TurnCredential string `json:"turnCredential,omitempty"` // password/credential
}

const configFileName = "sode-no-shita-config.json"

// LoadConfig は設定ファイルを読み込む。存在しない場合はデフォルト設定で新規作成する
func LoadConfig() AppConfig {
	defaultConfig := AppConfig{
		Theme: "dark",
		Lang:  "en",
	}

	// ファイル存在チェック
	if _, err := os.Stat(configFileName); os.IsNotExist(err) {
		log.Println("[Config] Config file not found, creating default config")
		err := SaveConfig(defaultConfig)
		if err != nil {
			log.Printf("[Config] Failed to create default config file: %v\n", err)
		}
		return defaultConfig
	}

	// 読み込み
	data, err := ioutil.ReadFile(configFileName)
	if err != nil {
		log.Printf("[Config] Failed to read config file: %v. Using default config\n", err)
		return defaultConfig
	}

	var cfg AppConfig
	err = json.Unmarshal(data, &cfg)
	if err != nil {
		log.Printf("[Config] Failed to parse config file: %v. Using default config\n", err)
		return defaultConfig
	}

	log.Printf("[Config] Config loaded: theme=%s, lang=%s\n", cfg.Theme, cfg.Lang)
	return cfg
}

// SaveConfig は設定をファイルに保存する
func SaveConfig(cfg AppConfig) error {
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}

	err = ioutil.WriteFile(configFileName, data, 0644)
	if err != nil {
		return err
	}

	log.Printf("[Config] Config saved: theme=%s, lang=%s\n", cfg.Theme, cfg.Lang)
	return nil
}
