package backend

import (
	"archive/zip"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/pion/webrtc/v3"
)

// ファイルのメタデータ
type FileInfo struct {
	Name string `json:"name"`
	Size int64  `json:"size"`
}

// Data Channel用メッセージ
type Message struct {
	Type  string     `json:"type"`            // "list", "request", "request_all", "start", "end", "error"
	Files []FileInfo `json:"files,omitempty"` // "list"用
	Name  string     `json:"name,omitempty"`  // "request", "start"用
	Size  int64      `json:"size,omitempty"`  // "start"用
}

// 共有するグローバルステート
type State struct {
	sync.Mutex
	ConnState      string     `json:"connState"` // "disconnected", "connecting", "connected"
	Role           string     `json:"role"`      // "sender", "receiver"
	SelectedFiles  []string   `json:"selectedFiles"`
	RemoteFiles    []FileInfo `json:"remoteFiles"`
	SaveDir        string     `json:"saveDir"`
	TransferFile   string     `json:"transferFile"`
	BytesSent      int64      `json:"bytesSent"`
	BytesReceived  int64      `json:"bytesReceived"`
	TotalBytes     int64      `json:"totalBytes"`
	Speed          float64    `json:"speed"`
	IsTransferring bool       `json:"isTransferring"`
}

var GlobalState = &State{
	ConnState:     "disconnected",
	SelectedFiles: []string{},
	RemoteFiles:   []FileInfo{},
}

var (
	peerConnection *webrtc.PeerConnection
	dataChannel    *webrtc.DataChannel
	api            *webrtc.API
)

func init() {
	// WebRTC APIの初期化
	s := webrtc.SettingEngine{}
	
	m := &webrtc.MediaEngine{}
	_ = m.RegisterDefaultCodecs()
	
	api = webrtc.NewAPI(
		webrtc.WithSettingEngine(s),
		webrtc.WithMediaEngine(m),
	)
}

func InitWebRTCPeer(isOffer bool) (string, error) {
	GlobalState.Lock()
	GlobalState.ConnState = "connecting"
	GlobalState.Unlock()

	config := webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{
				URLs: []string{"stun:stun.l.google.com:19302"},
			},
		},
	}

	var err error
	peerConnection, err = api.NewPeerConnection(config)
	if err != nil {
		return "", err
	}

	peerConnection.OnConnectionStateChange(func(s webrtc.PeerConnectionState) {
		GlobalState.Lock()
		defer GlobalState.Unlock()
		switch s {
		case webrtc.PeerConnectionStateConnected:
			GlobalState.ConnState = "connected"
		case webrtc.PeerConnectionStateDisconnected, webrtc.PeerConnectionStateFailed, webrtc.PeerConnectionStateClosed:
			GlobalState.ConnState = "disconnected"
			GlobalState.IsTransferring = false
		}
	})

	if isOffer {
		GlobalState.Lock()
		GlobalState.Role = "sender"
		GlobalState.Unlock()

		// 送信側のData Channel作成
		ordered := true
		maxRetransmits := uint16(0)
		options := &webrtc.DataChannelInit{
			Ordered:        &ordered,
			MaxRetransmits: &maxRetransmits,
		}
		dataChannel, err = peerConnection.CreateDataChannel("file-transfer", options)
		if err != nil {
			return "", err
		}
		setupDataChannel(dataChannel)

		offer, err := peerConnection.CreateOffer(nil)
		if err != nil {
			return "", err
		}
		err = peerConnection.SetLocalDescription(offer)
		if err != nil {
			return "", err
		}

		// Gather Completeを待つ
		gatherComplete := webrtc.GatheringCompletePromise(peerConnection)
		<-gatherComplete

		localDesc := peerConnection.LocalDescription()
		return CompressSDP(localDesc.SDP)
	}

	GlobalState.Lock()
	GlobalState.Role = "receiver"
	GlobalState.Unlock()

	// 受信側はオファーを待つので、DataChannelはOnDataChannelで登録
	peerConnection.OnDataChannel(func(d *webrtc.DataChannel) {
		dataChannel = d
		setupDataChannel(d)
	})

	return "", nil
}

func ConnectAnswer(answerCode string) error {
	sdp, err := DecompressSDP(answerCode)
	if err != nil {
		return err
	}

	answer := webrtc.SessionDescription{
		Type: webrtc.SDPTypeAnswer,
		SDP:  sdp,
	}

	return peerConnection.SetRemoteDescription(answer)
}

func AcceptOfferAndCreateAnswer(offerCode string) (string, error) {
	sdp, err := DecompressSDP(offerCode)
	if err != nil {
		return "", err
	}

	offer := webrtc.SessionDescription{
		Type: webrtc.SDPTypeOffer,
		SDP:  sdp,
	}

	err = peerConnection.SetRemoteDescription(offer)
	if err != nil {
		return "", err
	}

	answer, err := peerConnection.CreateAnswer(nil)
	if err != nil {
		return "", err
	}

	err = peerConnection.SetLocalDescription(answer)
	if err != nil {
		return "", err
	}

	// Gather Completeを待つ
	gatherComplete := webrtc.GatheringCompletePromise(peerConnection)
	<-gatherComplete

	localDesc := peerConnection.LocalDescription()
	return CompressSDP(localDesc.SDP)
}

func setupDataChannel(d *webrtc.DataChannel) {
	d.OnOpen(func() {
		// 接続完了後、送信側ならファイルリストを相手に送る
		GlobalState.Lock()
		role := GlobalState.Role
		files := GlobalState.SelectedFiles
		GlobalState.Unlock()

		if role == "sender" && len(files) > 0 {
			sendInfoList(files)
		}
	})

	var currentFile *os.File

	d.OnMessage(func(msg webrtc.DataChannelMessage) {
		if !msg.IsString {
			// バイナリデータ（ファイルのチャンク受信）
			if currentFile == nil {
				fmt.Println("Error: Received chunk but no file is open")
				return
			}
			_, err := currentFile.Write(msg.Data)
			if err != nil {
				fmt.Printf("File write error: %v\n", err)
				return
			}

			GlobalState.Lock()
			GlobalState.BytesReceived += int64(len(msg.Data))
			bytesRecv := GlobalState.BytesReceived
			total := GlobalState.TotalBytes
			GlobalState.Unlock()

			// 進行状況のパーセンテージを画面へ流すためのシグナル
			if total > 0 && bytesRecv >= total {
				// 終わりの判定は type: end で行うが、進捗は更新する
			}
			return
		}

		// JSONメッセージ
		var m Message
		err := json.Unmarshal(msg.Data, &m)
		if err != nil {
			fmt.Printf("JSON parsing error: %v\n", err)
			return
		}

		switch m.Type {
		case "list":
			// 受信側がファイルリストを受け取る
			GlobalState.Lock()
			GlobalState.RemoteFiles = m.Files
			GlobalState.Unlock()

		case "request":
			// 送信側が個別ファイル転送要求を受け取る
			go func() {
				err := handleFileSendRequest(m.Name)
				if err != nil {
					sendError(err.Error())
				}
			}()

		case "request_all":
			// 送信側が一括ZIP転送要求を受け取る
			go func() {
				err := handleZipSendRequest()
				if err != nil {
					sendError(err.Error())
				}
			}()

		case "start":
			// 受信側がファイル転送開始通知を受け取る
			GlobalState.Lock()
			saveDir := GlobalState.SaveDir
			GlobalState.IsTransferring = true
			GlobalState.TransferFile = m.Name
			GlobalState.TotalBytes = m.Size
			GlobalState.BytesReceived = 0
			GlobalState.Unlock()

			if saveDir == "" {
				sendError("保存先フォルダが設定されていません")
				return
			}

			// 保存用ファイルを開く
			targetPath := filepath.Join(saveDir, m.Name)
			// ディレクトリ階層がある場合も考慮して自動作成
			err := os.MkdirAll(filepath.Dir(targetPath), 0755)
			if err != nil {
				sendError(err.Error())
				return
			}

			currentFile, err = os.OpenFile(targetPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
			if err != nil {
				sendError(err.Error())
				return
			}

			// 速度測定用のゴルーチン開始
			go measureSpeed()

		case "end":
			// 受信側がファイル転送終了通知を受け取る
			if currentFile != nil {
				_ = currentFile.Close()
				currentFile = nil
			}
			GlobalState.Lock()
			GlobalState.IsTransferring = false
			GlobalState.Unlock()

		case "error":
			fmt.Printf("Remote error: %s\n", m.Name)
			if currentFile != nil {
				_ = currentFile.Close()
				currentFile = nil
			}
			GlobalState.Lock()
			GlobalState.IsTransferring = false
			GlobalState.Unlock()
		}
	})
}

// ファイルリストの送信
func sendInfoList(filePaths []string) {
	var infos []FileInfo
	for _, fp := range filePaths {
		stat, err := os.Stat(fp)
		if err != nil {
			continue
		}
		infos = append(infos, FileInfo{
			Name: filepath.Base(fp),
			Size: stat.Size(),
		})
	}
	
	msg := Message{
		Type:  "list",
		Files: infos,
	}
	
	bytes, _ := json.Marshal(msg)
	_ = dataChannel.SendText(string(bytes))
}

func sendError(errMsg string) {
	msg := Message{
		Type: "error",
		Name: errMsg,
	}
	bytes, _ := json.Marshal(msg)
	if dataChannel != nil {
		_ = dataChannel.SendText(string(bytes))
	}
}

// フロー制御付きData Channel送信
func sendWithFlowControl(r io.Reader, totalSize int64) error {
	buf := make([]byte, 32768) // 32KBチャンク
	
	GlobalState.Lock()
	GlobalState.BytesSent = 0
	GlobalState.Unlock()

	for {
		n, err := r.Read(buf)
		if n > 0 {
			// pionのData Channelバッファ監視
			for dataChannel.BufferedAmount() > 1024*1024 { // 1MB制限
				time.Sleep(10 * time.Millisecond)
			}
			
			errSend := dataChannel.Send(buf[:n])
			if errSend != nil {
				return errSend
			}

			GlobalState.Lock()
			GlobalState.BytesSent += int64(n)
			GlobalState.Unlock()
		}
		if err != nil {
			if err == io.EOF {
				break
			}
			return err
		}
	}
	return nil
}

func handleFileSendRequest(fileName string) error {
	GlobalState.Lock()
	files := GlobalState.SelectedFiles
	GlobalState.Unlock()

	var targetPath string
	for _, fp := range files {
		if filepath.Base(fp) == fileName {
			targetPath = fp
			break
		}
	}

	if targetPath == "" {
		return errors.New("file not found on sender side")
	}

	file, err := os.Open(targetPath)
	if err != nil {
		return err
	}
	defer file.Close()

	stat, err := file.Stat()
	if err != nil {
		return err
	}

	GlobalState.Lock()
	GlobalState.IsTransferring = true
	GlobalState.TransferFile = fileName
	GlobalState.TotalBytes = stat.Size()
	GlobalState.Unlock()

	// 1. 開始メッセージ
	startMsg := Message{
		Type: "start",
		Name: fileName,
		Size: stat.Size(),
	}
	bStart, _ := json.Marshal(startMsg)
	_ = dataChannel.SendText(string(bStart))

	// 速度測定
	go measureSpeed()

	// 2. バイナリデータ送信
	err = sendWithFlowControl(file, stat.Size())
	if err != nil {
		return err
	}

	// 3. 終了メッセージ
	endMsg := Message{
		Type: "end",
	}
	bEnd, _ := json.Marshal(endMsg)
	_ = dataChannel.SendText(string(bEnd))

	GlobalState.Lock()
	GlobalState.IsTransferring = false
	GlobalState.Unlock()

	return nil
}

func handleZipSendRequest() error {
	GlobalState.Lock()
	files := GlobalState.SelectedFiles
	GlobalState.Unlock()

	if len(files) == 0 {
		return errors.New("no files selected to archive")
	}

	// io.Pipeを使って、オンザフライでZIP化しながら直接WebRTCへ流す
	pr, pw := io.Pipe()
	zipWriter := zip.NewWriter(pw)

	var totalSize int64
	for _, fp := range files {
		stat, err := os.Stat(fp)
		if err == nil {
			totalSize += stat.Size() // 概算サイズ（ZIPヘッダー等は含まないがおおよその目安）
		}
	}

	GlobalState.Lock()
	GlobalState.IsTransferring = true
	GlobalState.TransferFile = "archive.zip"
	GlobalState.TotalBytes = totalSize
	GlobalState.Unlock()

	// 1. 開始メッセージ
	startMsg := Message{
		Type: "start",
		Name: "archive.zip",
		Size: totalSize,
	}
	bStart, _ := json.Marshal(startMsg)
	_ = dataChannel.SendText(string(bStart))

	go measureSpeed()

	// バックグラウンドでZIP生成
	go func() {
		defer pw.Close()
		defer zipWriter.Close()

		for _, fp := range files {
			file, err := os.Open(fp)
			if err != nil {
				fmt.Printf("Zip open error: %v\n", err)
				continue
			}
			
			header, err := zip.FileInfoHeader(nil) // ダミーヘッダー取得
			if err == nil {
				header.Name = filepath.Base(fp)
				header.Method = zip.Deflate // 圧縮方式
				
				writer, errWriter := zipWriter.CreateHeader(header)
				if errWriter == nil {
					_, _ = io.Copy(writer, file)
				}
			}
			_ = file.Close()
		}
	}()

	// 2. パイプからの読み込みデータをフロー制御で送信
	err := sendWithFlowControl(pr, totalSize)
	if err != nil {
		_ = pr.CloseWithError(err)
		return err
	}

	// 3. 終了メッセージ
	endMsg := Message{
		Type: "end",
	}
	bEnd, _ := json.Marshal(endMsg)
	_ = dataChannel.SendText(string(bEnd))

	GlobalState.Lock()
	GlobalState.IsTransferring = false
	GlobalState.Unlock()

	return nil
}

func measureSpeed() {
	var lastBytes int64
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		GlobalState.Lock()
		isTrans := GlobalState.IsTransferring
		role := GlobalState.Role
		var currentBytes int64
		if role == "sender" {
			currentBytes = GlobalState.BytesSent
		} else {
			currentBytes = GlobalState.BytesReceived
		}
		GlobalState.Unlock()

		if !isTrans {
			break
		}

		select {
		case <-ticker.C:
			delta := currentBytes - lastBytes
			lastBytes = currentBytes
			
			GlobalState.Lock()
			GlobalState.Speed = float64(delta) // bytes/sec
			GlobalState.Unlock()
		}
	}
	
	GlobalState.Lock()
	GlobalState.Speed = 0
	GlobalState.Unlock()
}
