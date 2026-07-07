package main

import (
	"embed"
	"fmt"
	"io/fs"
	"os/exec"
	"runtime"
	"time"

	"sode-no-shita/backend"
)

//go:embed all:frontend/dist
var frontendFS embed.FS

func openBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	case "darwin":
		cmd = exec.Command("open", url)
	case "linux":
		cmd = exec.Command("xdg-open", url)
	default:
		return
	}
	_ = cmd.Start()
}

func main() {
	port := 8080
	url := fmt.Sprintf("http://localhost:%d", port)

	// フロントエンドのサブディレクトリを展開
	distFS, err := fs.Sub(frontendFS, "frontend/dist")
	if err != nil {
		fmt.Printf("Failed to sub fs: %v\n", err)
		return
	}

	// ブラウザ自動起動
	go func() {
		time.Sleep(1 * time.Second)
		fmt.Printf("Opening browser to %s\n", url)
		openBrowser(url)
	}()

	err = backend.StartWebServer(port, distFS)
	if err != nil {
		fmt.Printf("Failed to start web server: %v\n", err)
	}
}
