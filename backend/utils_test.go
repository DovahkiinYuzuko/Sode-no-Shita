package backend

import (
	"strings"
	"testing"
)

func TestSDPCompression(t *testing.T) {
	originalSDP := "v=0\r\no=alice 2890844526 2890844526 IN IP4 host.anywhere.com\r\ns=-\r\nt=0 0\r\nc=IN IP4 host.anywhere.com"

	compressed, err := CompressSDP(originalSDP)
	if err != nil {
		t.Fatalf("CompressSDP failed: %v", err)
	}

	decompressed, err := DecompressSDP(compressed)
	if err != nil {
		t.Fatalf("DecompressSDP failed: %v", err)
	}

	if decompressed != originalSDP {
		t.Errorf("Expected %q, but got %q", originalSDP, decompressed)
	}
}

func TestSDPCompression_WithWhitespaceAndNewlines(t *testing.T) {
	originalSDP := "v=0\r\no=alice 2890844526 2890844526 IN IP4 host.anywhere.com\r\ns=-\r\nt=0 0\r\nc=IN IP4 host.anywhere.com"

	compressed, err := CompressSDP(originalSDP)
	if err != nil {
		t.Fatalf("CompressSDP failed: %v", err)
	}

	// 途中にスペース、タブ、改行を混ぜる
	n := len(compressed) / 2
	tampered := "  \r\n\t " + compressed[:n] + "\r\n  \t " + compressed[n:] + " \n "

	decompressed, err := DecompressSDP(tampered)
	if err != nil {
		t.Fatalf("DecompressSDP with whitespaces failed: %v", err)
	}

	if decompressed != originalSDP {
		t.Errorf("Expected %q, but got %q", originalSDP, decompressed)
	}
}

func TestSDPCompression_ChecksumCorruption(t *testing.T) {
	originalSDP := "v=0\r\no=alice 2890844526 2890844526 IN IP4 host.anywhere.com\r\ns=-\r\nt=0 0\r\nc=IN IP4 host.anywhere.com"

	compressed, err := CompressSDP(originalSDP)
	if err != nil {
		t.Fatalf("CompressSDP failed: %v", err)
	}

	// 末尾や途中の文字を削って破損させる
	if strings.Contains(compressed, ".") {
		parts := strings.Split(compressed, ".")
		corruptedPayload := parts[0][:len(parts[0])-5] + "." + parts[1]
		_, err = DecompressSDP(corruptedPayload)
		if err == nil {
			t.Fatalf("Expected error for corrupted payload, but got nil")
		}

		corruptedChecksum := parts[0] + ".ffffffff"
		_, err = DecompressSDP(corruptedChecksum)
		if err == nil {
			t.Fatalf("Expected error for mismatched checksum, but got nil")
		}
	}
}

func TestSDPCompression_LegacyFormatCompatibility(t *testing.T) {
	// 旧形式（チェックサムピリオドなし）の動作確認
	originalSDP := "v=0\r\no=alice 2890844526 2890844526 IN IP4 host.anywhere.com\r\ns=-\r\nt=0 0\r\nc=IN IP4 host.anywhere.com"

	compressed, err := CompressSDP(originalSDP)
	if err != nil {
		t.Fatalf("CompressSDP failed: %v", err)
	}

	// チェックサム部分（ピリオド以降）を取り除いて旧形式を模擬
	payload := strings.Split(compressed, ".")[0]
	decompressed, err := DecompressSDP(payload)
	if err != nil {
		t.Fatalf("DecompressSDP for legacy format failed: %v", err)
	}

	if decompressed != originalSDP {
		t.Errorf("Expected %q, but got %q", originalSDP, decompressed)
	}
}
