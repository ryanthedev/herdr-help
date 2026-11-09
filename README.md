# herdr-help

One `?` key overlay for every Herdr mod. It combines herdr-md's help (search, scrolling, keycaps, fade) and
herdr-draw's (click outside to close, flags keys that keys.json gives to Herdr first).

## Why it's copied, not imported

Herdr won't load a module from outside a mod's own folder (`resolves outside the application directory`),
symlinks included (checked 2026-11-09). So each mod carries a copy in `<mod>/help/`:

```sh
./sync.sh ~/repos/herdr-stage/mod      # writes mod/help/help.js, help-core.js, SOURCE
```

Edit here, never the copies, then re-run sync.sh for each mod that uses it.

## Use

```js
import { Help } from "./help/help.js";

const KEYS = [
  ["MOVE", [["j k", "next / previous"], ["g G", "top / bottom"]]],
  ["EDIT", [["⌘D", "duplicate", { bind: "cmd-d" }]]],   // bind: flag it if keys.json takes cmd-d first
];

init(_p, cx)  { this.keysHelp = new Help(KEYS, { title: "My keys", mod: "my-mod" }); }
onKey(e, cx)  { if (this.keysHelp.key(e, cx)) return; /* your keys */ }
render(cx)    { return root.relative().child(...).when(..., el => el.child(this.keysHelp.panel(colors))); }
```

- `key(e, cx)` first in your key handler: `?` opens; while open it takes every key (`/` filters, j/k
  ctrl-d/u g/G scroll, anything else closes). Skip it while your own text field is typing.
- `panel(colors)` is `null` while closed. The root it goes in must be `relative()`.
- `colors` (all optional, else the Herdr theme): `bg surface border ink ink2 dim accent warn font mono`.
- Options: `title`, `mod` (your mod name, for the keys.json check), `h: true` (h opens it too), `width`.
- `button(colors)`: a clickable `?` chip for a toolbar.

## Tests

`npm test` covers the pure part (help-core.js): filtering, keys, scrolling bounds, the keys.json check.

## Used by

- Stage (~/repos/herdr-stage). Next candidates: herdr-md, herdr-draw, fleet, engram (each has its own help).
