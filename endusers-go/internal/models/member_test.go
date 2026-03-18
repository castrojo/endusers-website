package models_test

import (
	"encoding/json"
	"testing"

	"github.com/castrojo/endusers-website/endusers-go/internal/models"
)

func TestSlugify(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"Google", "google"},
		{"Red Hat", "red-hat"},
		{"IBM Corp.", "ibm-corp"},
		{"CNCF Inc.", "cncf-inc"},
		{"A & B Systems", "a-b-systems"},
		{"", ""},
		{"Multiple   Spaces", "multiple-spaces"},
		{"123 Numbers", "123-numbers"},
	}
	for _, tc := range tests {
		t.Run(tc.input, func(t *testing.T) {
			got := models.Slugify(tc.input)
			if got != tc.want {
				t.Errorf("Slugify(%q) = %q, want %q", tc.input, got, tc.want)
			}
		})
	}
}

func TestNormalizeTier(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"Platinum", "Platinum"},
		{"platinum member", "Platinum"},
		{"Gold", "Gold"},
		{"gold sponsorship", "Gold"},
		{"Silver", "Silver"},
		{"End User Supporter", "End User"},
		{"end user", "End User"},
		{"Academic Institution", "Academic"},
		{"Nonprofit Organization", "Nonprofit"},
		{"Non-Profit", "Nonprofit"},
		{"", ""},
		{"Unknown Tier", "Unknown Tier"},
	}
	for _, tc := range tests {
		t.Run(tc.input, func(t *testing.T) {
			got := models.NormalizeTier(tc.input)
			if got != tc.want {
				t.Errorf("NormalizeTier(%q) = %q, want %q", tc.input, got, tc.want)
			}
		})
	}
}

func TestLogoFullURL(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"", ""},
		{"https://example.com/logo.svg", "https://example.com/logo.svg"},
		{"http://example.com/logo.png", "http://example.com/logo.png"},
		{"logos/google.svg", "https://landscape.cncf.io/logos/google.svg"},
		{"cached_logos/acme.svg", "https://landscape.cncf.io/cached_logos/acme.svg"},
	}
	for _, tc := range tests {
		t.Run(tc.input, func(t *testing.T) {
			got := models.LogoFullURL(tc.input)
			if got != tc.want {
				t.Errorf("LogoFullURL(%q) = %q, want %q", tc.input, got, tc.want)
			}
		})
	}
}

func TestEvent_JSONRoundTrip(t *testing.T) {
	evt := models.Event{
		ID:          "abc-123",
		Type:        "joined",
		MemberName:  "Acme Corp",
		MemberSlug:  "acme-corp",
		LogoURL:     "https://example.com/logo.svg",
		Tier:        "Gold",
		OldTier:     "",
		Timestamp:   "2024-06-01T00:00:00Z",
		Description: "Acme Corp joined as Gold member.",
	}
	data, err := json.Marshal(evt)
	if err != nil {
		t.Fatalf("marshal failed: %v", err)
	}
	var got models.Event
	if err := json.Unmarshal(data, &got); err != nil {
		t.Fatalf("unmarshal failed: %v", err)
	}
	if got.ID != evt.ID {
		t.Errorf("ID: got %q, want %q", got.ID, evt.ID)
	}
	if got.Type != evt.Type {
		t.Errorf("Type: got %q, want %q", got.Type, evt.Type)
	}
	if got.MemberName != evt.MemberName {
		t.Errorf("MemberName: got %q, want %q", got.MemberName, evt.MemberName)
	}
	if got.Tier != evt.Tier {
		t.Errorf("Tier: got %q, want %q", got.Tier, evt.Tier)
	}
}

func TestEvent_OldTierOmittedWhenEmpty(t *testing.T) {
	evt := models.Event{Type: "joined", OldTier: ""}
	data, err := json.Marshal(evt)
	if err != nil {
		t.Fatalf("marshal failed: %v", err)
	}
	if string(data) == "" {
		t.Fatal("expected non-empty JSON")
	}
	// OldTier has omitempty — verify the field is absent from JSON
	var raw map[string]any
	if err := json.Unmarshal(data, &raw); err != nil {
		t.Fatalf("unmarshal to map failed: %v", err)
	}
	if _, ok := raw["oldTier"]; ok {
		t.Error("expected oldTier to be omitted from JSON when empty")
	}
}
