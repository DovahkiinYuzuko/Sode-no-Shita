package backend

import (
	"bytes"
	"compress/zlib"
	"encoding/base64"
	"io"
)

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
	return base64.RawURLEncoding.EncodeToString(b.Bytes()), nil
}

func DecompressSDP(code string) (string, error) {
	data, err := base64.RawURLEncoding.DecodeString(code)
	if err != nil {
		return "", err
	}
	r, err := zlib.NewReader(bytes.NewReader(data))
	if err != nil {
		return "", err
	}
	defer r.Close()
	var out bytes.Buffer
	_, err = io.Copy(&out, r)
	if err != nil {
		return "", err
	}
	return out.String(), nil
}
