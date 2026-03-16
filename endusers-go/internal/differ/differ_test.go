package differ

import (
	"encoding/json"
	"testing"

	"github.com/castrojo/endusers-website/endusers-go/internal/models"
)

func marshalMembers(t *testing.T, members []models.SafeMember) []byte {
	t.Helper()
	b, err := json.Marshal(members)
	if err != nil {
		t.Fatalf("marshal members: %v", err)
	}
	return b
}

func TestDiff_NoChanges(t *testing.T) {
	cases := []struct {
		name    string
		members []models.SafeMember
	}{
		{
			name:    "empty state",
			members: []models.SafeMember{},
		},
		{
			name: "single member unchanged",
			members: []models.SafeMember{
				{Name: "Google", Slug: "google", Tier: "Platinum", JoinedAt: "2016-01-01"},
			},
		},
		{
			name: "multiple members unchanged",
			members: []models.SafeMember{
				{Name: "Google", Slug: "google", Tier: "Platinum"},
				{Name: "Acme Corp", Slug: "acme-corp", Tier: "Silver"},
			},
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			prev := marshalMembers(t, tc.members)
			events, _ := Diff(prev, tc.members)
			if len(events) != 0 {
				t.Errorf("expected 0 events, got %d: %+v", len(events), events)
			}
		})
	}
}

func TestDiff_MemberAdded(t *testing.T) {
	cases := []struct {
		name     string
		curr     models.SafeMember
		wantType string
	}{
		{
			name:     "new platinum member",
			curr:     models.SafeMember{Name: "Google", Slug: "google", Tier: "Platinum"},
			wantType: "joined",
		},
		{
			name:     "new silver member",
			curr:     models.SafeMember{Name: "Acme Corp", Slug: "acme-corp", Tier: "Silver"},
			wantType: "joined",
		},
		{
			name:     "new end user member",
			curr:     models.SafeMember{Name: "Spotify", Slug: "spotify", Tier: "End User", IsEndUser: true},
			wantType: "joined",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			events, _ := Diff([]byte("[]"), []models.SafeMember{tc.curr})
			if len(events) != 1 {
				t.Fatalf("expected 1 event, got %d", len(events))
			}
			if events[0].Type != tc.wantType {
				t.Errorf("event type = %q, want %q", events[0].Type, tc.wantType)
			}
			if events[0].MemberSlug != tc.curr.Slug {
				t.Errorf("slug = %q, want %q", events[0].MemberSlug, tc.curr.Slug)
			}
			if events[0].ID == "" {
				t.Error("event ID must not be empty")
			}
			if events[0].Tier != tc.curr.Tier {
				t.Errorf("tier = %q, want %q", events[0].Tier, tc.curr.Tier)
			}
		})
	}
}

func TestDiff_TierChanged(t *testing.T) {
	cases := []struct {
		name       string
		prev       models.SafeMember
		curr       models.SafeMember
		wantType   string
		wantOldTier string
		wantNewTier string
	}{
		{
			name:        "silver to gold",
			prev:        models.SafeMember{Name: "Acme Corp", Slug: "acme-corp", Tier: "Silver"},
			curr:        models.SafeMember{Name: "Acme Corp", Slug: "acme-corp", Tier: "Gold"},
			wantType:    "tier_changed",
			wantOldTier: "Silver",
			wantNewTier: "Gold",
		},
		{
			name:        "gold to platinum",
			prev:        models.SafeMember{Name: "BigCo", Slug: "bigco", Tier: "Gold"},
			curr:        models.SafeMember{Name: "BigCo", Slug: "bigco", Tier: "Platinum"},
			wantType:    "tier_changed",
			wantOldTier: "Gold",
			wantNewTier: "Platinum",
		},
		{
			name:        "end user to silver",
			prev:        models.SafeMember{Name: "Startup", Slug: "startup", Tier: "End User", IsEndUser: true},
			curr:        models.SafeMember{Name: "Startup", Slug: "startup", Tier: "Silver"},
			wantType:    "tier_changed",
			wantOldTier: "End User",
			wantNewTier: "Silver",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			prevJSON := marshalMembers(t, []models.SafeMember{tc.prev})
			events, _ := Diff(prevJSON, []models.SafeMember{tc.curr})
			if len(events) != 1 {
				t.Fatalf("expected 1 event, got %d: %+v", len(events), events)
			}
			e := events[0]
			if e.Type != tc.wantType {
				t.Errorf("type = %q, want %q", e.Type, tc.wantType)
			}
			if e.OldTier != tc.wantOldTier {
				t.Errorf("oldTier = %q, want %q", e.OldTier, tc.wantOldTier)
			}
			if e.Tier != tc.wantNewTier {
				t.Errorf("tier = %q, want %q", e.Tier, tc.wantNewTier)
			}
		})
	}
}
