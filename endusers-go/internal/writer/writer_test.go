package writer

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/castrojo/endusers-website/endusers-go/internal/models"
)

// chdirTemp changes the process working directory to t.TempDir() so that
// the hardcoded "src/data" path lands inside the temp tree.
// The original directory is restored via t.Cleanup.
func chdirTemp(t *testing.T) string {
	t.Helper()
	tmp := t.TempDir()
	orig, err := os.Getwd()
	if err != nil {
		t.Fatalf("Getwd: %v", err)
	}
	if err := os.Chdir(tmp); err != nil {
		t.Fatalf("Chdir: %v", err)
	}
	t.Cleanup(func() { os.Chdir(orig) })
	// "src/data" relative to tmp == filepath.Join(tmp, "src", "data")
	return tmp
}

func TestWriteMembers_ProducesValidJSON(t *testing.T) {
	tmp := chdirTemp(t)

	members := []models.SafeMember{
		{Name: "Google", Slug: "google", Tier: "Platinum", JoinedAt: "2016-03-10"},
		{Name: "Acme Corp", Slug: "acme-corp", Tier: "Silver", JoinedAt: "2020-06-01"},
	}

	if err := WriteMembers(members, nil); err != nil {
		t.Fatalf("WriteMembers: %v", err)
	}

	outPath := filepath.Join(tmp, "src", "data", "members.json")
	data, err := os.ReadFile(outPath)
	if err != nil {
		t.Fatalf("ReadFile: %v", err)
	}

	var result []models.SafeMember
	if err := json.Unmarshal(data, &result); err != nil {
		t.Errorf("output is not valid JSON: %v", err)
	}
	if len(result) != 2 {
		t.Errorf("expected 2 members in output, got %d", len(result))
	}
	raw := string(data)
	if !strings.Contains(raw, "google") {
		t.Error("output JSON does not contain 'google'")
	}
}

func TestWriteMembers_SortsByJoinedAt(t *testing.T) {
	tmp := chdirTemp(t)

	members := []models.SafeMember{
		{Name: "Older Corp", Slug: "older-corp", Tier: "Silver", JoinedAt: "2015-01-01"},
		{Name: "Newer Corp", Slug: "newer-corp", Tier: "Gold", JoinedAt: "2023-09-15"},
	}

	if err := WriteMembers(members, nil); err != nil {
		t.Fatalf("WriteMembers: %v", err)
	}

	data, err := os.ReadFile(filepath.Join(tmp, "src", "data", "members.json"))
	if err != nil {
		t.Fatalf("ReadFile: %v", err)
	}

	var result []models.SafeMember
	if err := json.Unmarshal(data, &result); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if len(result) < 2 {
		t.Fatalf("expected at least 2 results, got %d", len(result))
	}
	if result[0].Slug != "newer-corp" {
		t.Errorf("first member = %q, want %q (should be sorted newest joinedAt first)", result[0].Slug, "newer-corp")
	}
}

func TestWriteChangelog_MergesWithExisting(t *testing.T) {
	tmp := chdirTemp(t)

	existing := []models.Event{
		{ID: "old-id", Type: "joined", MemberName: "Old Member", MemberSlug: "old-member",
			Tier: "Silver", Timestamp: "2020-01-01T00:00:00Z", Description: "old"},
	}
	existingData, err := json.Marshal(existing)
	if err != nil {
		t.Fatalf("marshal existing: %v", err)
	}
	existingPath := filepath.Join(tmp, "existing-changelog.json")
	if err := os.WriteFile(existingPath, existingData, 0644); err != nil {
		t.Fatalf("WriteFile existing: %v", err)
	}

	newEvents := []models.Event{
		{ID: "new-id", Type: "joined", MemberName: "New Member", MemberSlug: "new-member",
			Tier: "Gold", Timestamp: "2024-06-01T00:00:00Z", Description: "new"},
	}

	if err := WriteChangelog(newEvents, existingPath); err != nil {
		t.Fatalf("WriteChangelog: %v", err)
	}

	data, err := os.ReadFile(filepath.Join(tmp, "src", "data", "changelog.json"))
	if err != nil {
		t.Fatalf("ReadFile changelog: %v", err)
	}

	var result []models.Event
	if err := json.Unmarshal(data, &result); err != nil {
		t.Errorf("output is not valid JSON: %v", err)
	}
	if len(result) != 2 {
		t.Errorf("expected 2 merged events, got %d", len(result))
	}
	if result[0].MemberSlug != "new-member" {
		t.Errorf("first event slug = %q, want %q (newest first)", result[0].MemberSlug, "new-member")
	}
}
