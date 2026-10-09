package backend

import (
	"os"
	"testing"
)

func TestSaveAndLoadConfigWithTurn(t *testing.T) {
	// 既存の設定ファイルをバックアップ
	originalData, errRead := os.ReadFile(configFileName)

	defer func() {
		if errRead == nil {
			_ = os.WriteFile(configFileName, originalData, 0644)
		} else {
			_ = os.Remove(configFileName)
		}
	}()

	testCfg := AppConfig{
		Theme:          "light",
		Lang:           "ja",
		TurnServerURL:  "turn:example.com:3478",
		TurnUsername:   "testuser",
		TurnCredential: "testpassword",
	}

	err := SaveConfig(testCfg)
	if err != nil {
		t.Fatalf("SaveConfig failed: %v", err)
	}

	loaded := LoadConfig()
	if loaded.Theme != testCfg.Theme {
		t.Errorf("Theme mismatch: got %s, want %s", loaded.Theme, testCfg.Theme)
	}
	if loaded.Lang != testCfg.Lang {
		t.Errorf("Lang mismatch: got %s, want %s", loaded.Lang, testCfg.Lang)
	}
	if loaded.TurnServerURL != testCfg.TurnServerURL {
		t.Errorf("TurnServerURL mismatch: got %s, want %s", loaded.TurnServerURL, testCfg.TurnServerURL)
	}
	if loaded.TurnUsername != testCfg.TurnUsername {
		t.Errorf("TurnUsername mismatch: got %s, want %s", loaded.TurnUsername, testCfg.TurnUsername)
	}
	if loaded.TurnCredential != testCfg.TurnCredential {
		t.Errorf("TurnCredential mismatch: got %s, want %s", loaded.TurnCredential, testCfg.TurnCredential)
	}
}
