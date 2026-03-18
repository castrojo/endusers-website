package fetcher

import (
	"testing"

	"github.com/castrojo/endusers-website/endusers-go/internal/models"
)

func TestFilterAndConvert_OnlyCNCFMembers(t *testing.T) {
	dataset := models.FullDataset{
		Items: []models.FullItem{
			{Name: "Acme Corp", Category: "CNCF Members", MemberSubcategory: "Platinum", EndUser: true},
			{Name: "NotAMember", Category: "CNCF Projects"},
			{Name: "Beta Systems", Category: "CNCF Members", MemberSubcategory: "Gold", EndUser: true},
			{Name: "Other Thing", Category: "Serverless"},
		},
		CrunchbaseData: map[string]models.CrunchbaseItem{},
	}
	got := filterAndConvert(dataset)
	if len(got) != 2 {
		t.Errorf("expected 2 CNCF members, got %d", len(got))
	}
}

func TestFilterAndConvert_ExcludesNonEndUsers(t *testing.T) {
	dataset := models.FullDataset{
		Items: []models.FullItem{
			{Name: "Regular Corp", Category: "CNCF Members", MemberSubcategory: "Gold", EndUser: false},
			{Name: "End User Co", Category: "CNCF Members", MemberSubcategory: "Silver", EndUser: true},
		},
		CrunchbaseData: map[string]models.CrunchbaseItem{},
	}
	got := filterAndConvert(dataset)
	if len(got) != 1 {
		t.Errorf("expected 1 end user member, got %d", len(got))
	}
	if got[0].Name != "End User Co" {
		t.Errorf("expected End User Co, got %s", got[0].Name)
	}
}

func TestFilterAndConvert_ExcludesNonCNCFCategory(t *testing.T) {
	dataset := models.FullDataset{
		Items: []models.FullItem{
			{Name: "Random Project", Category: "CNCF Projects", EndUser: true},
		},
		CrunchbaseData: map[string]models.CrunchbaseItem{},
	}
	got := filterAndConvert(dataset)
	if len(got) != 0 {
		t.Errorf("expected 0 members from non-CNCF-Members category, got %d", len(got))
	}
}

func TestToSafeMember_BasicFields(t *testing.T) {
	item := models.FullItem{
		Name:              "Test Member",
		Category:          "CNCF Members",
		MemberSubcategory: "Silver",
		HomepageURL:       "https://example.com",
	}
	m := toSafeMember(item, nil)
	if m.Name != "Test Member" {
		t.Errorf("expected name 'Test Member', got %q", m.Name)
	}
	if m.Slug == "" {
		t.Error("expected non-empty slug")
	}
	if m.Tier == "" {
		t.Error("expected non-empty tier")
	}
	if m.HomepageURL != "https://example.com" {
		t.Errorf("expected homepage URL, got %q", m.HomepageURL)
	}
}

func TestToSafeMember_EndUserFlag(t *testing.T) {
	item := models.FullItem{
		Name:     "End User Co",
		Category: "CNCF Members",
		EndUser:  true,
	}
	m := toSafeMember(item, nil)
	if !m.IsEndUser {
		t.Error("expected IsEndUser to be true")
	}
}

func TestToSafeMember_CrunchbaseEnrichment(t *testing.T) {
	item := models.FullItem{
		Name:          "Enriched Corp",
		Category:      "CNCF Members",
		CrunchbaseURL: "https://crunchbase.com/org/enriched",
	}
	cbData := map[string]models.CrunchbaseItem{
		"https://crunchbase.com/org/enriched": {
			Description: "A great company",
			Country:     "Canada",
			City:        "Toronto",
		},
	}
	m := toSafeMember(item, cbData)
	if m.Description != "A great company" {
		t.Errorf("expected description from crunchbase, got %q", m.Description)
	}
	if m.Country != "Canada" {
		t.Errorf("expected country Canada, got %q", m.Country)
	}
}
