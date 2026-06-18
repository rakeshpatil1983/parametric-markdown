# Parametric Markdown

> Design as text for humans and machines.

Parametric Markdown is an early-stage, text-first design language and browser renderer for creating technical designs from readable Markdown-like source. The long-term goal is one deterministic language that humans and LLMs can write, review, version, validate, and exchange with established engineering tools.

The project currently supports **electronic schematics**, **electrical single-line diagrams**, **physical panel wiring**, and **idealized educational waveforms**. PCB design and parametric 3D CAD remain planned work.

## Why Parametric Markdown?

Engineering source should be as easy to review and version as software source. A useful design language should be:

- **Readable**: understandable without opening a proprietary binary file.
- **Deterministic**: the same source produces the same design.
- **Parametric**: dimensions, values, constraints, and relationships remain editable intent.
- **Validatable**: broken references, open connections, and invalid constraints produce clear diagnostics.
- **Interoperable**: exchange designs with tools such as KiCad and FreeCAD instead of replacing them.
- **LLM-friendly**: explicit structure and stable identifiers allow models to generate small, reviewable changes.

## Project Status

Parametric Markdown is a prototype. The current browser application includes:

- A live Markdown editor and SVG preview with no build step.
- Electronic circuit blocks using KiCad-style symbols.
- Custom component definitions with named and numbered pins.
- Automatic rotation, functional groups, colors, labels, and orthogonal wire routing.
- Local and global nets, including conventional supply and return symbols.
- Structural diagnostics for missing symbols, open pins, invalid references, and connection errors.
- Electrical single-line diagrams with sources, protection, buses, contactors, relays, loads, and branches.
- Separate power feeders, relay control commands, and equipment-status feedback.
- Physical panel-wiring blocks with terminal IDs, wire numbers, colors, sizes, automatic routing, and sticker-style SVG output.
- Educational waveform sheets with ideal sine, PWM, triangle, sawtooth, pulse, step, DC, and exponential traces.
- SVG and Markdown downloads.

Not implemented yet:

- KiCad schematic or PCB export.
- PCB footprints, placement, routing, layers, zones, and design rules.
- Parametric 2D sketches or 3D solid modeling.
- FreeCAD, STEP, or other mechanical CAD export.
- SPICE simulation or circuit-derived waveform calculation.

## Quick Start

Serve the repository as static files:

```powershell
cd D:\Rakesh_patil\schematic_markdown
python -m http.server 4173
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173) in a browser. The included example also demonstrates a DOL starter wiring sticker and an educational waveform sheet.

## Language Examples

### Electronic Schematic

````markdown
```circuit
define POWER_INPUT annotation=J label="DC Input" {
  pin 1 VCC right
  pin 2 GND bottom
}

J1: POWER_INPUT value="5 V input"
R1: Device:R value="1 k"
LED1: Device:LED value="Power"

layout direction=LR gap=90

J1.VCC --> R1.1
R1.2 --> LED1.A
LED1.K --> global:0V
J1.GND --> global:0V
```
````

### Electrical Single-Line Diagram

````markdown
```line
title "Protected motor feeder"
layout direction=TB gap=64 rankgap=52

GRID: source label="Utility supply" voltage="415 VAC"
QF1: breaker label="Motor breaker"
KM1: contactor label="Motor contactor" coil="24 VDC"
OL1: overload label="Motor overload"
M1: motor label="Pump motor"
PR1: protection_relay label="Protection relay"

GRID --> QF1
QF1 --> KM1
KM1 --> OL1
OL1 --> M1

PR1 --control--> KM1 label="TRIP / ENABLE"
KM1 --feedback--> PR1 label="AUX STATUS"
```
````

Power feeders use `-->`. Control and feedback are separate relationships because a feedback loop must not become a cycle in the power-flow graph.

### Physical Panel Wiring

````markdown
```wiring
title "DOL starter panel wiring"
layout direction=LR gap=86 rowgap=118 wrap=5

X1: terminal_strip label="Incoming" terminals="1:L1@left,2:L2@left,3:L3@left,4:PE@left"
QF1: breaker_3p label="Main breaker"
KM1: contactor label="Main contactor"

X1.1 --> QF1.1 wire=101 color=BN size=2.5mm2
QF1.2 --> KM1.L1 wire=111 color=BN size=2.5mm2
```
````

Unlike a `line` block, a `wiring` block represents physical conductors between real device terminals. The renderer validates endpoint references and wire metadata, then produces a numbered sticker-style SVG.

### Educational Waveforms

````markdown
```waveform
title "Basic signal shapes"
time start=0 end=10 unit=ms divisions=10

AC: sine label="AC input" amplitude=1 cycles=2 unit=V color=#2563eb
PWM: square label="PWM, 35% duty" low=0 high=5 duty=35 cycles=5 unit=V color=#dc2626
VC: exponential label="Capacitor charging" from=0 to=5 tau=2 unit=V color=#16a34a

marker SWITCH at=2 label="switch closes"
```
````

Waveform blocks are deliberately explanatory. They align idealized signal shapes and events for teaching, but do not simulate the surrounding circuit.

## Roadmap

The roadmap is directional. Future syntax will be designed and validated before it is documented as part of the language.

### 1. Language Foundation

- [x] Markdown fenced blocks for electronic schematics.
- [x] A distinct electrical single-line domain.
- [x] Idealized educational waveform sheets.
- [x] Browser rendering and diagnostics.
- [x] SVG and source downloads.
- [ ] Extract a reusable parser, typed intermediate representation, and renderer API from the browser UI.
- [ ] Publish a versioned grammar and compatibility policy.
- [ ] Add formatter, linter, CLI, automated tests, and a conformance corpus.
- [ ] Define stable document, sheet, component, net, and constraint identifiers.

### 2. Electronic Schematics

- [x] KiCad-style symbol catalog and custom component definitions.
- [x] Explicit pins, nets, groups, labels, colors, and rotation.
- [x] Automatic placement and orthogonal routing.
- [ ] Improve multi-sheet hierarchy, buses, net classes, and reusable subcircuits.
- [ ] Expand electrical-rule checks and diagnostic locations.
- [ ] Add annotation, bill-of-materials data, and verified library mappings.
- [ ] Export a reproducible KiCad schematic and netlist.

### 3. Electrical Line And Panel Wiring

- [x] Protection, distribution, contactor, relay, motor, and load symbols.
- [x] Separate feeder, control, and feedback relationships.
- [ ] Add current transformers, protection functions, meters, generators, ATS systems, and multi-source distribution.
- [x] Define initial physical panel wiring with terminals, wire numbers, colors, sizes, and optional ferrules.
- [x] Produce sticker-style SVG wiring diagrams for control panels.
- [ ] Add cable cores, cross-references, enclosure zones, and device-location metadata.
- [ ] Add cable schedules, terminal plans, and wire lists.

### 4. PCB Design And KiCad Exchange

- [ ] Define footprint identity and symbol-to-footprint mapping.
- [ ] Define board outlines, mounting holes, keep-outs, layers, stack-ups, and design rules.
- [ ] Add parametric placement constraints such as alignment, grouping, spacing, and edge offsets.
- [ ] Add net classes, differential pairs, length constraints, copper zones, vias, and routing intent.
- [ ] Separate deterministic constraints from optional automatic placement and routing.
- [ ] Export KiCad projects that preserve references, nets, footprints, placement, and board geometry.
- [ ] Validate exported projects by reopening them in KiCad and comparing their semantic model.

### 5. Parametric 2D And 3D Design

- [ ] Define units, variables, expressions, and reusable parameters.
- [ ] Add constrained 2D sketches with dimensions and geometric relationships.
- [ ] Add solid operations such as extrude, revolve, sweep, loft, fillet, chamfer, shell, and boolean operations.
- [ ] Add reference planes, coordinate systems, bodies, parts, and assemblies.
- [ ] Preserve a feature history so changes rebuild predictably.
- [ ] Support materials, appearance, mass properties, and engineering metadata.
- [ ] Explore FreeCAD integration and export to interoperable formats such as STEP.

### 6. Human And LLM Workflows

- [x] Provide a Schematic Markdown skill for assisted generation.
- [ ] Publish machine-readable schemas and compact language references.
- [ ] Add source-level diagnostics with repair suggestions.
- [ ] Support semantic diffs, design review, and change explanations.
- [ ] Create evaluation suites for LLM-generated designs.
- [ ] Require explicit assumptions for safety-critical or under-specified designs.

## Architecture Direction

The language should evolve around a shared semantic model rather than one renderer per text format:

```text
Markdown source
      |
      v
Parser and validator
      |
      v
Typed design model
      |
      +--> SVG / browser preview
      +--> KiCad schematic and PCB
      +--> Wiring documents and schedules
      +--> Educational waveform SVG
      +--> FreeCAD / STEP and 3D preview
```

Each domain may have its own fenced block and vocabulary, but references, units, parameters, diagnostics, and file identity should be consistent across the project.

## Repository Layout

```text
index.html             Static editor and preview shell
app.js                 Parsers, validation, layout, routing, and SVG rendering
styles.css             Application and diagram styling
symbols.generated.js   Generated symbol catalog index
symbol-catalog/        Generated KiCad symbol-library modules
scripts/               Catalog generation and maintenance scripts
```

## Design Principles

1. Store engineering intent, not only drawing coordinates.
2. Keep references, pins, nets, dimensions, and constraints explicit.
3. Prefer deterministic output and meaningful diagnostics.
4. Keep text and rendered labels upright and readable.
5. Make generated files reviewable in version control.
6. Integrate with established CAD tools rather than trapping designs in a new format.
7. Treat electrical, mechanical, and manufacturing validation as separate from successful rendering.

## Contributing

The project is young, and several language boundaries are intentionally still open. Useful contributions include:

- Minimal source examples that expose layout or routing problems.
- Proposals for grammar, semantic models, and interoperability mappings.
- KiCad and FreeCAD round-trip test cases.
- Symbol, equipment, and validation coverage.
- Accessibility, browser embedding, and Obsidian integration improvements.

For a bug report, include the smallest source block that reproduces the issue, the expected behavior, the actual behavior, and an SVG or screenshot when visual layout is involved.

## Safety

Rendered diagrams and zero diagnostics do not prove that a design is electrically, mechanically, thermally, or legally safe. Mains circuits, protection systems, PCBs, and manufactured parts require review by qualified engineers and validation in the appropriate domain tools.
