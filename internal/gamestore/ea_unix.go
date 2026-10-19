//go:build !windows

package gamestore

// eaRegistryDir is empty off Windows: only Windows has the registry the EA installers write to.
func eaRegistryDir(string) string { return "" }
