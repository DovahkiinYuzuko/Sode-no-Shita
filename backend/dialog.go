package backend

import (
	"os"
	"strings"

	"github.com/ncruces/zenity"
)

func SelectLocalFiles() ([]string, error) {
	if testFiles := os.Getenv("SODENOSHITA_TEST_FILES"); testFiles != "" {
		return strings.Split(testFiles, ","), nil
	}
	paths, err := zenity.SelectFileMultiple(
		zenity.Title("送信するファイルを選択してください（複数選択可）"),
	)
	if err != nil {
		if err == zenity.ErrCanceled {
			return nil, nil
		}
		return nil, err
	}
	return paths, nil
}

func SelectLocalDirectory() (string, error) {
	if testDir := os.Getenv("SODENOSHITA_TEST_SAVEDIR"); testDir != "" {
		return testDir, nil
	}
	path, err := zenity.SelectFile(
		zenity.Title("受信ファイルの保存先フォルダを選択してください"),
		zenity.Directory(),
	)
	if err != nil {
		if err == zenity.ErrCanceled {
			return "", nil
		}
		return "", err
	}
	return path, nil
}
