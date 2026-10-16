//go:build !windows

package main

// requireWebView2 has nothing to check: only Windows uses WebView2.
func requireWebView2() error { return nil }
