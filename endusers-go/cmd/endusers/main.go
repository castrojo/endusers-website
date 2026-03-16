package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/castrojo/endusers-website/endusers-go/internal/differ"
	"github.com/castrojo/endusers-website/endusers-go/internal/fetcher"
	"github.com/castrojo/endusers-website/endusers-go/internal/state"
	"github.com/castrojo/endusers-website/endusers-go/internal/writer"
)

func main() {
	s := state.LoadState()
	fmt.Println("Fetching landscape.cncf.io/data/full.json...")
	result, err := fetcher.FetchMembers(s.ETag)
	if err != nil {
		log.Fatalf("fetch error: %v", err)
	}

	if !result.Modified {
		fmt.Println("No changes (ETag matched).")
		return
	}

	fmt.Printf("Fetched %d CNCF members\n", len(result.Members))

	prevData, _ := state.LoadPreviousMembers()
	events, updatedAt := differ.Diff(prevData, result.Members)
	fmt.Printf("Detected %d changelog events\n", len(events))

	if err := writer.WriteChangelog(events, "src/data/changelog.json"); err != nil {
		log.Fatalf("writing changelog: %v", err)
	}
	if err := writer.WriteMembers(result.Members, updatedAt); err != nil {
		log.Fatalf("writing members: %v", err)
	}

	data, _ := json.MarshalIndent(result.Members, "", "  ")
	_ = state.SavePreviousMembers(data)
	_ = state.SaveState(state.State{ETag: result.ETag})

	tiers := map[string]int{}
	endUsers := 0
	for _, m := range result.Members {
		tiers[m.Tier]++
		if m.IsEndUser {
			endUsers++
		}
	}
	fmt.Printf("Platinum:%d Gold:%d Silver:%d EndUser:%d Academic:%d Nonprofit:%d (enduser flag: %d)\n",
		tiers["Platinum"], tiers["Gold"], tiers["Silver"], tiers["End User"], tiers["Academic"], tiers["Nonprofit"], endUsers)
	_, _ = fmt.Fprintf(os.Stderr, "endusers-website: wrote %d members, %d events\n", len(result.Members), len(events))
}
