package backend

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"net/http"
	"time"
)

// 補助：JSONエラーレスポンス送信
func writeJSONError(w http.ResponseWriter, status int, errMsg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": errMsg})
}

func StartWebServer(port int, frontendFS fs.FS) error {
	mux := http.NewServeMux()

	// 1. OSダイアログ連携 API
	mux.HandleFunc("/api/dialog/file", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}
		paths, err := SelectLocalFiles()
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, err.Error())
			return
		}
		
		GlobalState.Lock()
		GlobalState.SelectedFiles = paths
		// 自分が送信側（sender）であることを確定する
		if len(paths) > 0 {
			GlobalState.Role = "sender"
		}
		GlobalState.Unlock()

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"files": paths})
	})

	mux.HandleFunc("/api/dialog/dir", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}
		path, err := SelectLocalDirectory()
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, err.Error())
			return
		}

		GlobalState.Lock()
		GlobalState.SaveDir = path
		GlobalState.Unlock()

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"dir": path})
	})

	// 2. WebRTCシグナリング API
	mux.HandleFunc("/api/webrtc/offer", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}
		code, err := InitWebRTCPeer(true)
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, err.Error())
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"code": code})
	})

	mux.HandleFunc("/api/webrtc/answer", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}
		var req struct {
			Code string `json:"code"`
		}
		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil || req.Code == "" {
			writeJSONError(w, http.StatusBadRequest, "Invalid code")
			return
		}

		// 受信側の接続準備
		_, err = InitWebRTCPeer(false)
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, err.Error())
			return
		}

		// Answerを生成
		answerCode, err := AcceptOfferAndCreateAnswer(req.Code)
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, err.Error())
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"code": answerCode})
	})

	mux.HandleFunc("/api/webrtc/connect", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}
		var req struct {
			Code string `json:"code"`
		}
		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil || req.Code == "" {
			writeJSONError(w, http.StatusBadRequest, "Invalid code")
			return
		}

		err = ConnectAnswer(req.Code)
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, err.Error())
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "connected"})
	})

	// ダウンロード要求 API (個別)
	mux.HandleFunc("/api/download/file", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}
		var req struct {
			Name string `json:"name"`
		}
		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil || req.Name == "" {
			writeJSONError(w, http.StatusBadRequest, "Invalid file name")
			return
		}

		if dataChannel == nil {
			writeJSONError(w, http.StatusInternalServerError, "P2P connection not established")
			return
		}

		msg := Message{
			Type: "request",
			Name: req.Name,
		}
		bytesMsg, err := json.Marshal(msg)
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, err.Error())
			return
		}

		err = dataChannel.SendText(string(bytesMsg))
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, err.Error())
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "request_sent"})
	})

	// ダウンロード要求 API (一括)
	mux.HandleFunc("/api/download/all", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}

		if dataChannel == nil {
			writeJSONError(w, http.StatusInternalServerError, "P2P connection not established")
			return
		}

		msg := Message{
			Type: "request_all",
		}
		bytesMsg, err := json.Marshal(msg)
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, err.Error())
			return
		}

		err = dataChannel.SendText(string(bytesMsg))
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, err.Error())
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "request_all_sent"})
	})

	// 3. SSEによるリアルタイムステータス進捗配信 API
	mux.HandleFunc("/api/status", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		flusher, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
			return
		}

		ticker := time.NewTicker(500 * time.Millisecond)
		defer ticker.Stop()

		for {
			select {
			case <-r.Context().Done():
				return
			case <-ticker.C:
				GlobalState.Lock()
				data, err := json.Marshal(GlobalState)
				GlobalState.Unlock()
				if err != nil {
					continue
				}
				_, _ = fmt.Fprintf(w, "data: %s\n\n", data)
				flusher.Flush()
			}
		}
	})

	// 4. 静的アセット配信
	fileServer := http.FileServer(http.FS(frontendFS))
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// APIリクエストでなければ静的ファイルをサーブ
		fileServer.ServeHTTP(w, r)
	})

	addr := fmt.Sprintf(":%d", port)
	fmt.Printf("Server starting at http://localhost%s\n", addr)
	return http.ListenAndServe(addr, mux)
}
