import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const outputPath = path.join(rootDir, "symbols.generated.js");
const outputDir = path.join(rootDir, "symbol-catalog");

function atom(value) {
  return { type: "atom", value };
}

function str(value) {
  return { type: "string", value };
}

function val(node) {
  return node?.value ?? "";
}

function tokenizeSexpr(source) {
  const tokens = [];
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (ch === ";") {
      while (i < source.length && source[i] !== "\n") i += 1;
      continue;
    }
    if (ch === "(" || ch === ")") {
      tokens.push(ch);
      i += 1;
      continue;
    }
    if (ch === "\"") {
      i += 1;
      let value = "";
      while (i < source.length) {
        const c = source[i];
        if (c === "\\" && i + 1 < source.length) {
          value += source[i + 1];
          i += 2;
          continue;
        }
        if (c === "\"") {
          i += 1;
          break;
        }
        value += c;
        i += 1;
      }
      tokens.push(str(value));
      continue;
    }
    let value = "";
    while (i < source.length && !/\s|\(|\)/.test(source[i])) {
      value += source[i];
      i += 1;
    }
    tokens.push(atom(value));
  }
  return tokens;
}

function parseSexpr(source) {
  const tokens = tokenizeSexpr(source);
  let index = 0;

  function parseList() {
    const list = [];
    index += 1;
    while (index < tokens.length) {
      const token = tokens[index];
      if (token === ")") {
        index += 1;
        return list;
      }
      if (token === "(") {
        list.push(parseList());
      } else {
        list.push(token);
        index += 1;
      }
    }
    throw new Error("Unclosed S-expression list");
  }

  if (tokens[index] !== "(") throw new Error("Expected S-expression root list");
  return parseList();
}

function isList(node, name) {
  return Array.isArray(node) && val(node[0]) === name;
}

function children(node, name) {
  return node.filter((child) => isList(child, name));
}

function child(node, name) {
  return node.find((entry) => isList(entry, name));
}

function numberValue(node, fallback = 0) {
  const value = Number.parseFloat(val(node));
  return Number.isFinite(value) ? value : fallback;
}

function xyFrom(node, name) {
  const item = child(node, name);
  if (!item) return null;
  return { x: numberValue(item[1]), y: numberValue(item[2]) };
}

function atFrom(node) {
  const item = child(node, "at");
  if (!item) return { x: 0, y: 0, angle: 0 };
  return {
    x: numberValue(item[1]),
    y: numberValue(item[2]),
    angle: numberValue(item[3], 0)
  };
}

function strokeFrom(node) {
  const stroke = child(node, "stroke");
  const width = child(stroke || [], "width");
  return {
    width: Math.max(0.12, numberValue(width?.[1], 0.15)),
    type: val(child(stroke || [], "type")?.[1]) || "default"
  };
}

function fillFrom(node) {
  const fill = child(node, "fill");
  const type = val(child(fill || [], "type")?.[1]) || "none";
  if (type === "none") return "none";
  return "currentColor";
}

function fontSizeFrom(node, fallback = 1.27) {
  const effects = child(node, "effects");
  const font = child(effects || [], "font");
  const size = child(font || [], "size");
  return numberValue(size?.[1], fallback);
}

function screenPoint(point) {
  return { x: point.x, y: -point.y };
}

function pushPoint(bounds, point) {
  bounds.push(screenPoint(point));
}

function attrs(values) {
  return Object.entries(values)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}="${escapeXml(value)}"`)
    .join(" ");
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function strokeAttrs(node) {
  const stroke = strokeFrom(node);
  const dash = stroke.type === "dash" ? "2 1.2" : stroke.type === "dot" ? "0.4 1" : "";
  return attrs({
    stroke: "currentColor",
    "stroke-width": stroke.width,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "stroke-dasharray": dash
  });
}

function renderPolyline(node, bounds) {
  const pts = child(node, "pts");
  const points = children(pts || [], "xy").map((xy) => ({ x: numberValue(xy[1]), y: numberValue(xy[2]) }));
  if (points.length < 2) return "";
  points.forEach((point) => pushPoint(bounds, point));
  return `<polyline points="${points.map((point) => {
    const p = screenPoint(point);
    return `${p.x},${p.y}`;
  }).join(" ")}" ${strokeAttrs(node)} fill="${fillFrom(node)}"></polyline>`;
}

function renderRectangle(node, bounds) {
  const start = xyFrom(node, "start");
  const end = xyFrom(node, "end");
  if (!start || !end) return "";
  pushPoint(bounds, start);
  pushPoint(bounds, end);
  const a = screenPoint(start);
  const b = screenPoint(end);
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const width = Math.abs(a.x - b.x);
  const height = Math.abs(a.y - b.y);
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" ${strokeAttrs(node)} fill="${fillFrom(node)}"></rect>`;
}

function renderCircle(node, bounds) {
  const center = xyFrom(node, "center");
  const radius = numberValue(child(node, "radius")?.[1], 0);
  if (!center || radius <= 0) return "";
  pushPoint(bounds, { x: center.x - radius, y: center.y - radius });
  pushPoint(bounds, { x: center.x + radius, y: center.y + radius });
  const c = screenPoint(center);
  return `<circle cx="${c.x}" cy="${c.y}" r="${radius}" ${strokeAttrs(node)} fill="${fillFrom(node)}"></circle>`;
}

function renderArc(node, bounds) {
  const start = xyFrom(node, "start");
  const mid = xyFrom(node, "mid");
  const end = xyFrom(node, "end");
  if (!start || !mid || !end) return "";
  [start, mid, end].forEach((point) => pushPoint(bounds, point));
  const a = screenPoint(start);
  const m = screenPoint(mid);
  const b = screenPoint(end);
  return `<path d="M ${a.x} ${a.y} Q ${m.x} ${m.y} ${b.x} ${b.y}" ${strokeAttrs(node)} fill="none"></path>`;
}

function renderBezier(node, bounds) {
  const pts = child(node, "pts");
  const points = children(pts || [], "xy").map((xy) => ({ x: numberValue(xy[1]), y: numberValue(xy[2]) }));
  if (points.length < 4) return "";
  points.forEach((point) => pushPoint(bounds, point));
  const p = points.map(screenPoint);
  return `<path d="M ${p[0].x} ${p[0].y} C ${p[1].x} ${p[1].y}, ${p[2].x} ${p[2].y}, ${p[3].x} ${p[3].y}" ${strokeAttrs(node)} fill="${fillFrom(node)}"></path>`;
}

function renderText(node, bounds) {
  const text = val(node[1]);
  const at = atFrom(node);
  const p = screenPoint(at);
  const size = fontSizeFrom(node);
  bounds.push({ x: p.x - text.length * size * 0.3, y: p.y - size });
  bounds.push({ x: p.x + text.length * size * 0.3, y: p.y + size });
  return `<text x="${p.x}" y="${p.y}" font-size="${size}" text-anchor="middle" dominant-baseline="middle" fill="currentColor" transform="rotate(${-at.angle} ${p.x} ${p.y})">${escapeXml(text)}</text>`;
}

function pinEnd(at, length) {
  const radians = at.angle * Math.PI / 180;
  return {
    x: at.x + Math.cos(radians) * length,
    y: at.y + Math.sin(radians) * length
  };
}

function pinLabelPosition(at, length, distance) {
  const radians = at.angle * Math.PI / 180;
  return {
    x: at.x + Math.cos(radians) * (length + distance),
    y: at.y + Math.sin(radians) * (length + distance)
  };
}

function renderPin(node, bounds, pins) {
  const electricalType = val(node[1]) || "unspecified";
  const graphicStyle = val(node[2]) || "line";
  const at = atFrom(node);
  const length = numberValue(child(node, "length")?.[1], 2.54);
  const end = pinEnd(at, length);
  const nameNode = child(node, "name");
  const numberNode = child(node, "number");
  const name = val(nameNode?.[1]);
  const number = val(numberNode?.[1]);
  const startScreen = screenPoint(at);
  const endScreen = screenPoint(end);
  pushPoint(bounds, at);
  pushPoint(bounds, end);
  pins.push({
    name,
    number,
    electricalType,
    graphicStyle,
    x: startScreen.x,
    y: startScreen.y
  });

  const pieces = [`<line x1="${startScreen.x}" y1="${startScreen.y}" x2="${endScreen.x}" y2="${endScreen.y}" ${strokeAttrs(node)}></line>`];
  if (graphicStyle === "inverted" || graphicStyle === "inverted_clock") {
    pieces.push(`<circle cx="${startScreen.x}" cy="${startScreen.y}" r="0.45" ${strokeAttrs(node)} fill="#ffffff"></circle>`);
  }
  if (graphicStyle.includes("clock")) {
    const size = 0.7;
    pieces.push(`<path d="M ${endScreen.x - size} ${endScreen.y - size} L ${endScreen.x} ${endScreen.y} L ${endScreen.x - size} ${endScreen.y + size}" ${strokeAttrs(node)} fill="none"></path>`);
  }
  if (number) {
    const label = screenPoint(pinLabelPosition(at, length, 0.8));
    bounds.push({ x: label.x - 1, y: label.y - 1 });
    bounds.push({ x: label.x + 1, y: label.y + 1 });
    pieces.push(`<text x="${label.x}" y="${label.y}" font-size="1" text-anchor="middle" dominant-baseline="middle" fill="currentColor">${escapeXml(number)}</text>`);
  }
  return pieces.join("");
}

function propertyMap(symbolNode) {
  const properties = {};
  for (const property of children(symbolNode, "property")) {
    properties[val(property[1])] = val(property[2]);
  }
  return properties;
}

function unitStyleFromName(parentName, childName) {
  if (!childName.startsWith(`${parentName}_`)) return null;
  const match = childName.match(/_(\d+)_(\d+)$/);
  if (!match) return null;
  return {
    unit: Number.parseInt(match[1], 10),
    style: Number.parseInt(match[2], 10)
  };
}

function collectDrawableNodes(symbolNode, parentName) {
  const drawables = [];
  for (const entry of symbolNode) {
    if (!Array.isArray(entry)) continue;
    const type = val(entry[0]);
    if (["arc", "circle", "bezier", "polyline", "rectangle", "text", "pin"].includes(type)) {
      drawables.push(entry);
    }
    if (type === "symbol") {
      const info = unitStyleFromName(parentName, val(entry[1]));
      if (!info || ((info.unit === 0 || info.unit === 1) && (info.style === 0 || info.style === 1))) {
        drawables.push(...collectDrawableNodes(entry, parentName));
      }
    }
  }
  return drawables;
}

function symbolToSvg(symbolNode, libraryName) {
  const name = val(symbolNode[1]);
  const drawables = collectDrawableNodes(symbolNode, name);
  const bounds = [];
  const pins = [];
  const svg = drawables.map((node) => {
    const type = val(node[0]);
    if (type === "polyline") return renderPolyline(node, bounds);
    if (type === "rectangle") return renderRectangle(node, bounds);
    if (type === "circle") return renderCircle(node, bounds);
    if (type === "arc") return renderArc(node, bounds);
    if (type === "bezier") return renderBezier(node, bounds);
    if (type === "text") return renderText(node, bounds);
    if (type === "pin") return renderPin(node, bounds, pins);
    return "";
  }).filter(Boolean).join("");

  let viewBox;
  if (bounds.length) {
    const minX = Math.min(...bounds.map((point) => point.x)) - 1.8;
    const minY = Math.min(...bounds.map((point) => point.y)) - 1.8;
    const maxX = Math.max(...bounds.map((point) => point.x)) + 1.8;
    const maxY = Math.max(...bounds.map((point) => point.y)) + 1.8;
    viewBox = [
      Number(minX.toFixed(3)),
      Number(minY.toFixed(3)),
      Number((maxX - minX).toFixed(3)),
      Number((maxY - minY).toFixed(3))
    ];
  } else {
    viewBox = [-5, -5, 10, 10];
  }

  return {
    id: `${libraryName}:${name}`,
    library: libraryName,
    name,
    properties: propertyMap(symbolNode),
    viewBox,
    pins,
    svg: svg || `<rect x="-4" y="-3" width="8" height="6" rx="0.6" stroke="currentColor" stroke-width="0.18" fill="none"></rect>`
  };
}

function discoverKiCadSymbolDirs() {
  const explicit = process.argv.slice(2).map((entry) => path.resolve(entry)).filter((entry) => fs.existsSync(entry));
  if (explicit.length) return explicit;

  const candidates = [];
  for (const key of ["KICAD_SYMBOL_DIR", "KICAD10_SYMBOL_DIR", "KICAD9_SYMBOL_DIR"]) {
    if (process.env[key]) candidates.push(process.env[key]);
  }

  const programFiles = [process.env.ProgramFiles, process.env["ProgramFiles(x86)"]].filter(Boolean);
  for (const base of programFiles) {
    const kicad = path.join(base, "KiCad");
    if (!fs.existsSync(kicad)) continue;
    const versions = fs.readdirSync(kicad, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => Number.parseFloat(b) - Number.parseFloat(a));
    for (const version of versions) {
      candidates.push(path.join(kicad, version, "share", "kicad", "symbols"));
    }
  }

  return [...new Set(candidates.map((entry) => path.resolve(entry)).filter((entry) => fs.existsSync(entry)))];
}

function symbolFilesFromDirs(dirs) {
  return dirs.flatMap((dir) => fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".kicad_sym"))
    .map((entry) => path.join(dir, entry.name)));
}

function safeLibraryFileName(libraryName) {
  return `${libraryName.replace(/[^A-Za-z0-9_.-]/g, "_")}.js`;
}

function assertInsideRoot(targetPath) {
  const relative = path.relative(rootDir, targetPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to write outside project root: ${targetPath}`);
  }
}

function generate() {
  const dirs = discoverKiCadSymbolDirs();
  if (!dirs.length) {
    throw new Error("No KiCad symbol directories found. Pass a symbol directory path as an argument.");
  }

  assertInsideRoot(outputDir);
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });

  const libraries = {};
  let symbolCount = 0;
  const files = symbolFilesFromDirs(dirs);
  for (const file of files) {
    const libraryName = path.basename(file, ".kicad_sym");
    const source = fs.readFileSync(file, "utf8");
    const root = parseSexpr(source);
    if (!isList(root, "kicad_symbol_lib")) continue;
    const librarySymbols = {};
    for (const symbolNode of children(root, "symbol")) {
      const entry = symbolToSvg(symbolNode, libraryName);
      librarySymbols[entry.id] = entry;
      symbolCount += 1;
    }
    const fileName = safeLibraryFileName(libraryName);
    const relativeFile = `symbol-catalog/${fileName}`;
    const libraryOutputPath = path.join(outputDir, fileName);
    assertInsideRoot(libraryOutputPath);
    fs.writeFileSync(
      libraryOutputPath,
      `(function(){\n` +
        `  const catalog = window.KICAD_SYMBOL_CATALOG = window.KICAD_SYMBOL_CATALOG || { symbols: {}, libraries: {}, loadedLibraries: {} };\n` +
        `  catalog.symbols = Object.assign(catalog.symbols || {}, ${JSON.stringify(librarySymbols)});\n` +
        `  catalog.loadedLibraries = catalog.loadedLibraries || {};\n` +
        `  catalog.loadedLibraries[${JSON.stringify(libraryName)}] = true;\n` +
        `})();\n`,
      "utf8"
    );
    libraries[libraryName] = {
      file: relativeFile,
      count: Object.keys(librarySymbols).length,
      symbols: Object.keys(librarySymbols).map((id) => id.slice(libraryName.length + 1))
    };
  }

  const catalog = {
    generatedAt: new Date().toISOString(),
    sourceDirs: dirs,
    symbolCount,
    loadedLibraries: {},
    libraries,
    symbols: {}
  };

  assertInsideRoot(outputPath);
  fs.writeFileSync(
    outputPath,
    `window.KICAD_SYMBOL_CATALOG = ${JSON.stringify(catalog)};\n`,
    "utf8"
  );
  console.log(`Generated ${catalog.symbolCount} symbols from ${files.length} files into ${Object.keys(libraries).length} catalog chunks.`);
  console.log(outputPath);
}

generate();
