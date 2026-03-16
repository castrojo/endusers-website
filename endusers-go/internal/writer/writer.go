package writer

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"

	"github.com/castrojo/endusers-website/endusers-go/internal/models"
)

const dataDir = "src/data"

// WriteMembers writes the members list to src/data/members.json
func WriteMembers(members []models.SafeMember, updatedAt map[string]string) error {
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return err
	}
	for i, m := range members {
		if ts, ok := updatedAt[m.Slug]; ok && ts != "" {
			members[i].UpdatedAt = ts
		} else if m.UpdatedAt == "" && m.JoinedAt != "" {
			members[i].UpdatedAt = m.JoinedAt
		}
	}
	sort.Slice(members, func(i, j int) bool {
		return members[i].JoinedAt > members[j].JoinedAt
	})
	data, err := json.MarshalIndent(members, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(dataDir, "members.json"), data, 0644)
}

// WriteChangelog merges new events with existing changelog and writes to disk
func WriteChangelog(newEvents []models.Event, existingPath string) error {
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return err
	}
	var existing []models.Event
	if data, err := os.ReadFile(existingPath); err == nil {
		_ = json.Unmarshal(data, &existing)
	}
	all := append(newEvents, existing...)
	sort.Slice(all, func(i, j int) bool { return all[i].Timestamp > all[j].Timestamp })
	data, err := json.MarshalIndent(all, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(dataDir, "changelog.json"), data, 0644)
}
