package fonts

import "golang.org/x/sys/windows/registry"

// List is the installed font families, from the fonts registry key.
func List() ([]string, error) {
	k, err := registry.OpenKey(registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts`, registry.QUERY_VALUE)
	if err != nil {
		return nil, err
	}
	defer func() { _ = k.Close() }()
	names, err := k.ReadValueNames(-1)
	if err != nil {
		return nil, err
	}
	return ParseWindowsNames(names), nil
}
