import { test } from "node:test";
import assert from "node:assert/strict";
import { filterSections, countRows, isHelpKey, helpKey, takenKeys, takenBy } from "../help-core.js";

const S = [["MOVE", [["j k", "next / previous"], ["g G", "top / bottom"]]], ["EDIT", [["⌘D", "duplicate", { bind: "cmd-d" }]]]];

test("filter: every word must match title, keys or description", () => {
  assert.equal(countRows(filterSections(S, "")), 3);
  assert.deepEqual(filterSections(S, "move top").map(([t, r]) => [t, r.length]), [["MOVE", 1]]);
  assert.deepEqual(filterSections(S, "dup"), [["EDIT", [S[1][1][0]]]]);
  assert.deepEqual(filterSections(S, "nothing here"), []);
});

test("? opens (and shift-/), h only when asked, never with cmd", () => {
  assert.ok(isHelpKey({ key: "?" }));
  assert.ok(isHelpKey({ key: "/", modifiers: { shift: true } }));
  assert.ok(!isHelpKey({ key: "/" }));
  assert.ok(!isHelpKey({ key: "?", modifiers: { platform: true } }));
  assert.ok(!isHelpKey({ key: "h" }));
  assert.ok(isHelpKey({ key: "h" }, { h: true }));
});

test("scrolling clamps to the content", () => {
  const st = { q: "", typing: false, y: 0 }, view = { page: 200, max: 100 };
  assert.equal(helpKey(st, "j", {}, view).st.y, 40);
  assert.equal(helpKey(st, "k", {}, view).st.y, 0);
  assert.equal(helpKey(st, "d", { control: true }, view).st.y, 100);
  assert.equal(helpKey(st, "G", {}, view).st.y, 100);
  assert.equal(helpKey({ ...st, y: 90 }, "g", {}, view).st.y, 0);
});

test("/ types a filter; Enter keeps it; Esc clears, then leaves", () => {
  let r = helpKey({ q: "", typing: false, y: 30 }, "/");
  assert.equal(r.st.typing, true);
  r = helpKey(r.st, "d"); r = helpKey(r.st, "u");
  assert.equal(r.st.q, "du");
  assert.equal(r.st.y, 0);
  assert.equal(helpKey(r.st, "enter").st.typing, false);
  const cleared = helpKey(r.st, "escape").st;
  assert.deepEqual([cleared.q, cleared.typing], ["", true]);
  assert.equal(helpKey(cleared, "escape").st.typing, false);
  assert.equal(helpKey(r.st, "j").st.q, "duj"); // while typing, j is a letter
});

test("any other key closes; modifier keys alone don't", () => {
  assert.equal(helpKey({ q: "", typing: false, y: 0 }, "x").close, true);
  assert.equal(helpKey({ q: "", typing: false, y: 0 }, "escape").close, true);
  assert.equal(helpKey({ q: "", typing: false, y: 0 }, "shift").close, false);
});

test("keys Herdr takes first, minus the mod's own section", () => {
  const keys = { global: { "cmd-d": "pane.split:right", "cmd-g": "x" }, "layout:matrix": { "cmd-k": { command: "pane.go" } }, "mod:draw": { "cmd-g": "group" } };
  const t = takenKeys(JSON.stringify(keys), "draw");
  assert.equal(t.get("cmd-d"), "pane.split:right");
  assert.equal(t.get("cmd-k"), "pane.go");
  assert.equal(t.has("cmd-g"), false);
  assert.equal(takenBy(S[1][1][0], t), "pane.split:right");
  assert.equal(takenBy(S[0][1][0], t), null);
  assert.equal(takenKeys("not json", "x").size, 0);
});
