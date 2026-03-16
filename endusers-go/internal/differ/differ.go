package differ

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/castrojo/endusers-website/endusers-go/internal/models"
	"github.com/google/uuid"
)

// DiffableFields holds the fields we compare for change detection
type DiffableFields struct {
	Name        string
	Tier        string
	IsEndUser   bool
	JoinedAt    string
	HomepageURL string
}

func toDiffable(m models.SafeMember) DiffableFields {
	return DiffableFields{
		Name:        m.Name,
		Tier:        m.Tier,
		IsEndUser:   m.IsEndUser,
		JoinedAt:    m.JoinedAt,
		HomepageURL: m.HomepageURL,
	}
}

// Diff computes events between previous and current member lists
func Diff(previousJSON []byte, current []models.SafeMember) ([]models.Event, map[string]string) {
	var previous []models.SafeMember
	if len(previousJSON) > 0 {
		_ = json.Unmarshal(previousJSON, &previous)
	}

	prevBySlug := make(map[string]models.SafeMember)
	for _, m := range previous {
		prevBySlug[m.Slug] = m
	}

	currBySlug := make(map[string]models.SafeMember)
	for _, m := range current {
		currBySlug[m.Slug] = m
	}

	now := time.Now().UTC().Format(time.RFC3339)
	var events []models.Event
	updatedAt := make(map[string]string)

	for slug, curr := range currBySlug {
		prev, existed := prevBySlug[slug]
		if !existed {
			events = append(events, models.Event{
				ID:          uuid.New().String(),
				Type:        "joined",
				MemberName:  curr.Name,
				MemberSlug:  slug,
				LogoURL:     curr.LogoURL,
				Tier:        curr.Tier,
				Timestamp:   now,
				Description: fmt.Sprintf("%s joined CNCF as a %s member", curr.Name, curr.Tier),
			})
			updatedAt[slug] = now
			continue
		}
		currD, prevD := toDiffable(curr), toDiffable(prev)
		if currD.Tier != prevD.Tier {
			events = append(events, models.Event{
				ID:          uuid.New().String(),
				Type:        "tier_changed",
				MemberName:  curr.Name,
				MemberSlug:  slug,
				LogoURL:     curr.LogoURL,
				Tier:        curr.Tier,
				OldTier:     prev.Tier,
				Timestamp:   now,
				Description: fmt.Sprintf("%s tier changed from %s to %s", curr.Name, prev.Tier, curr.Tier),
			})
			updatedAt[slug] = now
		} else if currD != prevD {
			events = append(events, models.Event{
				ID:          uuid.New().String(),
				Type:        "updated",
				MemberName:  curr.Name,
				MemberSlug:  slug,
				LogoURL:     curr.LogoURL,
				Tier:        curr.Tier,
				Timestamp:   now,
				Description: fmt.Sprintf("%s membership info was updated", curr.Name),
			})
			updatedAt[slug] = now
		} else {
			updatedAt[slug] = prev.UpdatedAt
		}
	}

	for slug, prev := range prevBySlug {
		if _, exists := currBySlug[slug]; !exists {
			events = append(events, models.Event{
				ID:          uuid.New().String(),
				Type:        "left",
				MemberName:  prev.Name,
				MemberSlug:  slug,
				LogoURL:     prev.LogoURL,
				Tier:        prev.Tier,
				Timestamp:   now,
				Description: fmt.Sprintf("%s is no longer a CNCF member", prev.Name),
			})
		}
	}

	return events, updatedAt
}
