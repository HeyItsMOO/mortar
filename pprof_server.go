//go:build server

package main

import (
	"log"
	"net/http"
	"net/http/pprof"
	"os"
	"strings"
	"time"
)

// MORTAR_PPROF=<addr> serves Go's profiling endpoints (/debug/pprof/) in server mode, for the memory harness and for
// profiling a self-test sandbox. Unset, nothing listens; the desktop build never has it. prepareServerMode starts it,
// which only the long-running server reaches, not a CLI call of the same binary.
func servePprof() {
	addr := os.Getenv("MORTAR_PPROF")
	if addr == "" {
		return
	}
	mux := http.NewServeMux()
	mux.HandleFunc("/debug/pprof/", pprof.Index)
	mux.HandleFunc("/debug/pprof/profile", pprof.Profile)
	mux.HandleFunc("/debug/pprof/symbol", pprof.Symbol)
	mux.HandleFunc("/debug/pprof/trace", pprof.Trace)
	if !strings.Contains(addr, ":") {
		addr = "127.0.0.1:" + addr
	} else if strings.HasPrefix(addr, ":") {
		addr = "127.0.0.1" + addr
	}
	srv := &http.Server{
		Addr:              addr,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      60 * time.Second,
	}
	go func() { log.Printf("pprof: %v", srv.ListenAndServe()) }()
}
