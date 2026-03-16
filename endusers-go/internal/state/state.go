package state

import (
	"encoding/json"
	"os"
	"path/filepath"
)

// State holds persistent sync state
type State struct {
	ETag string `json:"etag"`
}

const cacheDir = ".sync-cache"

// LoadState reads persisted state from disk
func LoadState() State {
	data, err := os.ReadFile(filepath.Join(cacheDir, "state.json"))
	if err != nil {
		return State{}
	}
	var s State
	_ = json.Unmarshal(data, &s)
	return s
}

// SaveState persists state to disk
func SaveState(s State) error {
	if err := os.MkdirAll(cacheDir, 0755); err != nil {
		return err
	}
	data, _ := json.MarshalIndent(s, "", "  ")
	return os.WriteFile(filepath.Join(cacheDir, "state.json"), data, 0644)
}

// LoadPreviousMembers reads the previous members snapshot
func LoadPreviousMembers() ([]byte, error) {
	return os.ReadFile(filepath.Join(cacheDir, "previous_members.json"))
}

// SavePreviousMembers persists the members snapshot
func SavePreviousMembers(data []byte) error {
	if err := os.MkdirAll(cacheDir, 0755); err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(cacheDir, "previous_members.json"), data, 0644)
}
