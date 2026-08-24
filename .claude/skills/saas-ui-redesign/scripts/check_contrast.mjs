#!/usr/bin/env node
/**
 * check_contrast.mjs — WCAG 2.2 contrast validator for a set of design tokens.
 *
 * No dependencies. No network. Node >= 14 (ESM).
 *
 * Usage:
 *   node check_contrast.mjs [--mode light|dark] [--surface #hex] <entry...>
 *
 * Entry syntax:
 *   #1c2024                     role defaults to "text"
 *   text=#1c2024                named entry
 *   border=#b9bbc6:ui           named entry with an explicit role
 *   #d9d9e0:decorative          unnamed entry with an explicit role
 *
 * Roles and their minimum ratio against the surface:
 *   text        4.5:1   WCAG 2.2 SC 1.4.3, body text
 *   large       3:1     WCAG 2.2 SC 1.4.3, >=24px or >=18.66px bold
 *   ui          3:1     WCAG 2.2 SC 1.4.11, controls, focus rings, meaningful borders
 *   decorative  none    reported only; never fails
 *
 * Result per entry:
 *   [PASS]  meets its role's minimum
 *   [WARN]  misses its role's minimum but still clears 3:1
 *   [FAIL]  below 3:1, or below its role minimum with no 3:1 fallback
 *
 * Exit codes:
 *   0  no FAIL
 *   1  at least one FAIL
 *   2  usage error
 */

const ROLES = {
  text: { min: 4.5, label: "body text", sc: "1.4.3" },
  large: { min: 3, label: "large text", sc: "1.4.3" },
  ui: { min: 3, label: "UI component / border", sc: "1.4.11" },
  decorative: { min: 0, label: "decorative", sc: "n/a" },
};

const DEFAULT_SURFACE = { light: "#ffffff", dark: "#111111" };

const USAGE = `Usage: node check_contrast.mjs [--mode light|dark] [--surface #hex] <entry...>

  --mode light|dark   Selects the default surface. Default: light.
  --surface #hex      Surface the entries are measured against.
                      Defaults to ${DEFAULT_SURFACE.light} (light) or ${DEFAULT_SURFACE.dark} (dark).
  -h, --help          Print this message.

Entry:  [name=]#hex[:role]      role = text | large | ui | decorative (default: text)

Example:
  node check_contrast.mjs --mode light --surface '#f9f9fb' \\
    sidebar-foreground='#60646c' \\
    sidebar-accent-foreground='#1c2024' \\
    sidebar-ring='#0090ff:ui' \\
    sidebar-border='#d9d9e0:decorative'`;

function usageError(message) {
  process.stderr.write(`error: ${message}\n\n${USAGE}\n`);
  process.exit(2);
}

function normalizeHex(input) {
  const value = input.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(value)) {
    return (
      "#" +
      value
        .toLowerCase()
        .split("")
        .map((c) => c + c)
        .join("")
    );
  }
  if (/^[0-9a-fA-F]{6}$/.test(value)) return "#" + value.toLowerCase();
  return null;
}

/** WCAG 2.x relative luminance. https://www.w3.org/TR/WCAG22/#dfn-relative-luminance */
function relativeLuminance(hex) {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio. https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio */
function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseEntry(arg) {
  let rest = arg;
  let name = null;

  const eq = rest.indexOf("=");
  if (eq !== -1) {
    name = rest.slice(0, eq).trim();
    rest = rest.slice(eq + 1).trim();
    if (!name) usageError(`entry "${arg}" has an empty name`);
  }

  let role = "text";
  const colon = rest.lastIndexOf(":");
  if (colon !== -1) {
    const candidate = rest.slice(colon + 1).trim().toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(ROLES, candidate)) {
      usageError(
        `entry "${arg}" has unknown role "${candidate}"; expected one of ${Object.keys(ROLES).join(", ")}`
      );
    }
    role = candidate;
    rest = rest.slice(0, colon).trim();
  }

  const hex = normalizeHex(rest);
  if (!hex) {
    usageError(`entry "${arg}" is not a 3- or 6-digit hex color (alpha is not supported)`);
  }

  return { name: name || hex, hex, role };
}

function parseArgs(argv) {
  let mode = "light";
  let surface = null;
  const entries = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      process.stdout.write(`${USAGE}\n`);
      process.exit(0);
    } else if (arg === "--mode") {
      mode = argv[++i];
      if (mode !== "light" && mode !== "dark") {
        usageError(`--mode expects "light" or "dark", received "${mode === undefined ? "" : mode}"`);
      }
    } else if (arg === "--surface") {
      const raw = argv[++i];
      if (raw === undefined) usageError("--surface expects a hex color");
      surface = normalizeHex(raw);
      if (!surface) usageError(`--surface "${raw}" is not a 3- or 6-digit hex color`);
    } else if (arg.startsWith("--")) {
      usageError(`unknown option "${arg}"`);
    } else {
      entries.push(parseEntry(arg));
    }
  }

  if (entries.length === 0) usageError("no colors given");
  return { mode, surface: surface || DEFAULT_SURFACE[mode], entries };
}

function main() {
  const { mode, surface, entries } = parseArgs(process.argv.slice(2));

  const nameWidth = Math.max(...entries.map((e) => e.name.length), 4);
  const results = entries.map((entry) => {
    const ratio = contrastRatio(entry.hex, surface);
    const { min } = ROLES[entry.role];
    let status;
    if (ratio + 1e-9 >= min) status = "PASS";
    else if (ratio + 1e-9 >= 3) status = "WARN";
    else status = "FAIL";
    return { ...entry, ratio, min, status };
  });

  process.stdout.write(`contrast check — mode: ${mode}, surface: ${surface}\n\n`);
  for (const r of results) {
    const { label, sc } = ROLES[r.role];
    const need = r.min > 0 ? `needs ${r.min.toFixed(1)}:1 (SC ${sc})` : "no minimum";
    process.stdout.write(
      `[${r.status}] ${r.name.padEnd(nameWidth)}  ${r.hex}  ${r.ratio.toFixed(2).padStart(6)}:1  ${label}, ${need}\n`
    );
  }

  const failed = results.filter((r) => r.status === "FAIL").length;
  const warned = results.filter((r) => r.status === "WARN").length;
  process.stdout.write(
    `\n${results.length - failed - warned} pass, ${warned} warn, ${failed} fail\n`
  );
  process.exit(failed > 0 ? 1 : 0);
}

main();
