#!/bin/sh
# sync.sh <mod source folder>...: copy herdr-help into each mod as <folder>/help/ (Herdr mods can't import
# from outside their own folder, so every mod carries a copy). Re-run after editing help.js or help-core.js.
set -e
SRC="$(cd "$(dirname "$0")" && pwd)"
[ $# -gt 0 ] || { echo "usage: sync.sh <mod folder>..." >&2; exit 2; }
for dir in "$@"; do
  mkdir -p "$dir/help"
  cp "$SRC/help.js" "$SRC/help-core.js" "$dir/help/"
  printf 'Copied from %s by sync.sh. Edit there, not here.\n' "$SRC" > "$dir/help/SOURCE"
  echo "synced $dir/help"
done
