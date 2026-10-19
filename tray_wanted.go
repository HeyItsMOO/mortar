package main

import "github.com/Rethunk-Tech/mortar/internal/settings"

// trayWanted reports whether the settings call for a tray icon.
func trayWanted(s settings.Settings) bool { return s.KeepInTray || s.StartMinimised }
