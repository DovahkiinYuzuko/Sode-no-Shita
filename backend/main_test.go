package main

import (
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
