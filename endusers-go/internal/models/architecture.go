package models

// SafeArchitecture is a CNCF reference architecture entry, parsed from
// github.com/cncf/architecture and enriched with project maturity from the landscape.
type SafeArchitecture struct {
	Slug           string       `json:"slug"`
	Title          string       `json:"title"`
	OrgName        string       `json:"orgName"`
	OrgTeam        string       `json:"orgTeam,omitempty"`
	OrgUrl         string       `json:"orgUrl,omitempty"`
	OrgLogoUrl     string       `json:"orgLogoUrl"`
	OrgDescription string       `json:"orgDescription,omitempty"`
	OrgSize        string       `json:"orgSize,omitempty"`
	UserSize       string       `json:"userSize,omitempty"`
	Industries     []string     `json:"industries,omitempty"`
	Tags           []string     `json:"tags,omitempty"`
	RefArchTypes   []string     `json:"refArchTypes,omitempty"`
	ArchUrl        string       `json:"archUrl"`
	SubmittedAt    string       `json:"submittedAt,omitempty"`
	Projects       []ArchProject `json:"projects,omitempty"`
}

// ArchProject is a single CNCF project used in the reference architecture,
// extracted from {{< card header="ProjectName" >}} blocks in the markdown body.
type ArchProject struct {
	Name       string `json:"name"`
	LogoUrl    string `json:"logoUrl,omitempty"`
	Maturity   string `json:"maturity,omitempty"` // "graduated" | "incubating" | "sandbox" | ""
	UsingSince string `json:"usingSince,omitempty"`
}
