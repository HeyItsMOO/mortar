//go:build !linux

package secret

import "errors"

func retrievePortalSecret() ([]byte, error) { return nil, errors.New("the secret portal needs Linux") }
