package backend

import (
	"bytes"
	"compress/zlib"
	"encoding/base64"
	"errors"
	"fmt"
	"hash/crc32"
	"io"
	"strings"
	"unicode"
)

// CompressSDP はSDPテキストをzlib圧縮し、CRC32チェックサムを付与したBase64URL文字列を生成します。
func CompressSDP(sdp string) (string, error) {
	var b bytes.Buffer
	w := zlib.NewWriter(&b)
	_, err := w.Write([]byte(sdp))
	if err != nil {
		return "", err
	}
	err = w.Close()
	if err != nil {
		return "", err
	}

	compressedBytes := b.Bytes()
	crc := crc32.ChecksumIEEE(compressedBytes)
	payload := base64.RawURLEncoding.EncodeToString(compressedBytes)
	chk := fmt.Sprintf("%08x", crc)

	return payload + "." + chk, nil
}

// DecompressSDP は空白や改行をサニタイズした上で、チェックサムを検証し、SDPテキストを復元します。
func DecompressSDP(code string) (string, error) {
	// 空白文字（スペース、タブ、改行等）を完全除去
	cleaned := strings.Map(func(r rune) rune {
		if unicode.IsSpace(r) {
			return -1
		}
		return r
	}, code)

	if cleaned == "" {
		return "", errors.New("connection code is empty")
	}

	var data []byte
	var err error

	if strings.Contains(cleaned, ".") {
		parts := strings.Split(cleaned, ".")
		if len(parts) != 2 {
			return "", errors.New("invalid connection code format")
		}
		payload := parts[0]
		expectedChk := strings.ToLower(parts[1])

		data, err = base64.RawURLEncoding.DecodeString(payload)
		if err != nil {
			return "", fmt.Errorf("corrupted connection code: %w", err)
		}

		actualCrc := crc32.ChecksumIEEE(data)
		if fmt.Sprintf("%08x", actualCrc) != expectedChk {
			return "", errors.New("connection code checksum mismatch: code may be truncated or corrupted")
		}
	} else {
		// 旧形式コードとの後方互換性
		data, err = base64.RawURLEncoding.DecodeString(cleaned)
		if err != nil {
			return "", fmt.Errorf("corrupted connection code: %w", err)
		}
	}

	r, err := zlib.NewReader(bytes.NewReader(data))
	if err != nil {
		return "", fmt.Errorf("failed to decompress connection code: %w", err)
	}
	defer r.Close()

	var out bytes.Buffer
	_, err = io.Copy(&out, r)
	if err != nil {
		return "", fmt.Errorf("failed to decompress connection code: %w", err)
	}

	return out.String(), nil
}
