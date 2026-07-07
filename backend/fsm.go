package backend

import (
	"fmt"
	"log"
)

type FSMState string

const (
	StateIdle             FSMState = "IDLE"
	StateGeneratingOffer  FSMState = "GENERATING_OFFER"
	StateWaitingForAnswer FSMState = "WAITING_FOR_ANSWER"
	StateGeneratingAnswer FSMState = "GENERATING_ANSWER"
	StateConnecting       FSMState = "CONNECTING"
	StateConnected        FSMState = "CONNECTED"
	StateFailed           FSMState = "FAILED"
)

// 状態遷移の有効な組み合わせを定義
var validTransitions = map[FSMState][]FSMState{
	StateIdle:             {StateGeneratingOffer, StateGeneratingAnswer},
	StateGeneratingOffer:  {StateWaitingForAnswer, StateFailed},
	StateWaitingForAnswer: {StateConnecting, StateFailed, StateIdle},
	StateGeneratingAnswer: {StateConnecting, StateFailed},
	StateConnecting:       {StateConnected, StateFailed, StateIdle},
	StateConnected:        {StateIdle, StateFailed},
	StateFailed:           {StateIdle},
}

// TransitionTo は接続のFSM状態をスレッドセーフに更新する
func TransitionTo(next FSMState) error {
	GlobalState.Lock()
	defer GlobalState.Unlock()

	current := GlobalState.FSMState
	if current == "" {
		GlobalState.FSMState = StateIdle
		current = StateIdle
	}

	if current == next {
		return nil
	}

	// 遷移の検証
	allowed := false
	for _, state := range validTransitions[current] {
		if state == next {
			allowed = true
			break
		}
	}

	// 強制リセット（IDLE）および強制失敗（FAILED）への遷移は常に許可する
	if next == StateIdle || next == StateFailed {
		allowed = true
	}

	if !allowed {
		return fmt.Errorf("invalid FSM transition from %s to %s", current, next)
	}

	log.Printf("[FSM] Transition: %s -> %s\n", current, next)
	GlobalState.FSMState = next

	// 互換性維持のために従来の ConnState も自動同期する
	switch next {
	case StateConnected:
		GlobalState.ConnState = "connected"
	case StateConnecting, StateGeneratingOffer, StateGeneratingAnswer:
		GlobalState.ConnState = "connecting"
	default:
		GlobalState.ConnState = "disconnected"
	}

	return nil
}
