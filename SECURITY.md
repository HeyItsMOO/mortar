# Security policy

Licence: [`LICENSE`](LICENSE).

## Reporting a vulnerability

Do not open an issue. Use GitHub's private vulnerability reporting on this repository, or email <opensource@rethunk.tech>, with a description, affected paths or version, steps to reproduce, and impact.

## Supported versions

Only the latest release; fixes ship in a new release, not as patches to older ones.

## Verifying downloads

Packages, repositories and each release's `SHA256SUMS` are signed with OpenPGP key "Mortar packages <opensource@rethunk.tech>":

```text
D8B1 C4C2 05C5 FB36 33CB  8B99 00B7 5959 B637 DCB5
```

The key is at [`build/linux/repo/mortar-archive-keyring.asc`](build/linux/repo/mortar-archive-keyring.asc), <https://mortar.rethunk.tech/packages/mortar-archive-keyring.asc> and keyserver.ubuntu.com:

```sh
curl -fsSL https://mortar.rethunk.tech/packages/mortar-archive-keyring.asc | gpg --import
gpg --verify SHA256SUMS.asc SHA256SUMS
sha256sum --check --ignore-missing SHA256SUMS
gh attestation verify <file> --repo Rethunk-Tech/mortar
```

`gh attestation verify` checks GitHub build provenance. Mortar's updater requires an ed25519 signature in the release `manifest.json` before installing.
