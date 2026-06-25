# Parametric Markdown — Complete LLM Skill Reference

You are working with **Parametric Markdown** — a pure browser-side engineering diagram renderer (`parametric-markdown.js`).  
No build step, no npm, no external dependencies. Diagrams live in fenced code blocks inside Markdown.

---

## Diagram types at a glance

| Tag | Purpose |
|---|---|
| ` ```circuit ` | Electronic schematic (KiCad symbols, nets, groups) |
| ` ```line ` | Single-line / one-line power distribution diagram |
| ` ```wiring ` | Physical panel wiring diagram |
| ` ```waveform ` | Idealized educational signal waveforms |
| ` ```sketch ` | **2-D parametric CAD sketch** (new) |

---

## 1. Circuit Schematics — ` ```circuit `

### Components
```
REF: Library:Symbol value="..." color=#hex label="..."
```
Common symbols and their **pin names**:

| Symbol | Pins |
|---|---|
| `Device:R` | `1`, `2` |
| `Device:C` / `Device:C_Polarized` | `1`, `2` |
| `Device:L` | `1`, `2` |
| `Device:LED` / `Device:D_Schottky` | `A`, `K` |
| `Transistor_BJT:Q_NPN_BCE` | `B`, `C`, `E` |
| `Transistor_FET:Q_NMOS_GDS` | `G`, `D`, `S` |
| `Isolator:LTV-817` | `A`, `K`, `C`, `E` |

### Custom component
```
define NAME annotation=U label="Display" {
  pin 1 PINNAME left
  pin 2 PINNAME right
}
REF: NAME value="..."
```

### Connections
```
REF.pin --> REF.pin color=#hex
REF.pin --> global:NETNAME color=#hex
REF.pin --> local:NETNAME color=#hex
REF.pin --> NC
```

### Layout & Groups
```
layout direction=LR|TB gap=80
group GROUPNAME label="Caption" direction=LR|TB {
  REF1 REF2
}
```

### Rules
- Declare components **before** referencing them
- `layout` must appear **before** any `group`
- Use `local:` labels for same-sheet power rails; `global:` for cross-sheet
- Pick one `color=#hex` per net and reuse it throughout

---

## 2. Electrical Line Diagrams — ` ```line `

### Equipment
```
REF: TYPE label="..." rating="..." voltage="..." phases="..."
```
Equipment types: `source`, `isolator`, `fuse`, `breaker`, `breaker_3p`, `rcd`, `spd`,
`contactor`, `overload`, `transformer`, `power_supply`, `bus`, `terminal`,
`motor`, `load`, `earth`, `meter`, `relay`, `protection_relay`

### Connections
```
REF --> REF cable="3C + PE 4mm²"
REF --control--> REF label="TRIP"
REF --feedback--> REF label="AUX"
```

### Layout
```
title "Panel Title"
layout direction=TB gap=60 rankgap=52
```

---

## 3. Panel Wiring Diagrams — ` ```wiring `

### Devices
```
REF: TYPE label="..." terminals="1:NAME@left,2:NAME@right"
```
Device types: `terminal_strip`, `breaker`, `breaker_3p`, `contactor`, `overload`,
`pushbutton_no`, `pushbutton_nc`, `protection_relay`, `fuse`, `rcd`, `spd`,
`power_supply`, `motor`

### Wires
```
REF.terminal --> REF.terminal wire=101 color=BN size=2.5mm2
```
IEC 60757 colors: `BN` brown · `BK` black · `GY` grey · `BU` blue · `RD` red ·
`OG` orange · `YE` yellow · `GN` green · `WH` white · `GNYE` green/yellow (PE)

### Layout
```
title "Wiring Title"
layout direction=LR gap=86 rowgap=118 wrap=5
```

---

## 4. Waveform Diagrams — ` ```waveform `

### Signals
```
SIG: TYPE label="Name" unit=V color=#hex [attrs]
```
| Type | Key attributes |
|---|---|
| `sine` | `amplitude=1 cycles=2` |
| `square` | `low=0 high=5 duty=50 cycles=4` |
| `triangle` | `min=-1 max=1 cycles=3` |
| `sawtooth` | `min=0 max=5 cycles=3` |
| `pulse` | `low=0 high=5 at=2 width=3` |
| `dc` | `level=3.3` |
| `step` | `from=0 to=5 at=3` |
| `exponential` | `from=0 to=5 tau=2` |

### Time axis
```
time start=0 end=20 unit=ms divisions=10
marker T1 at=5 label="rising edge"
```

---

## 5. 2-D Parametric Sketch — ` ```sketch `

A CAD-style sketch with a **math coordinate system** (y-axis up, origin configurable).  
Coordinates are in **model units**; multiply by `scale` to get SVG pixels.

### Canvas
```sketch
canvas width=540 height=420 scale=3 grid=20 originX=270 originY=210
```
- `scale` — model units per pixel (default 3, so 1 unit = 3 px)
- `grid` — grid spacing in model units (0 to disable)
- `originX/Y` — SVG pixel position of the math origin

### Datum elements
```sketch
datum point O at=(0,0) label="O"
datum axis X direction=horizontal at=0 label="X"
datum axis Y direction=vertical   at=0 label="Y"
datum axis A direction=angle angle=45 label="45°"
```
Datums render as blue dashed lines/crosshairs — construction geometry only.

### Shapes
All shapes share optional style attributes: `fill=` `stroke=` `stroke_width=` `opacity=` `label=`

#### Circle
```sketch
circle C1 center=(0,0) radius=30
```

#### Rectangle / Square
```sketch
rect    R1 center=(0,0) width=80 height=50
rect    R2 corner=(-40,-25) width=80 height=50
square  S1 center=(0,0) size=60
```

#### Triangle
```sketch
triangle T1 at=(0,0) base=80 height=60
triangle T2 vertices=(-40,0)(40,0)(0,60)
```

#### Ellipse
```sketch
ellipse E1 center=(0,0) rx=50 ry=25 rotation=30
```

#### Arc
```sketch
arc A1 center=(0,0) radius=40 start=0 end=90
```
Angles in degrees, measured counter-clockwise from the positive X axis.

#### Line (construction / dimension reference)
```sketch
line L1 from=(-60,0) to=(60,0) stroke=#94a3b8 dashed=true
```

#### Polygon (arbitrary vertices)
```sketch
polygon P1 vertices=(-50,0)(0,80)(50,0) fill=#fef3c7 stroke=#d97706
```

### Polar curves
```sketch
polar ROSE eq="cos(4*t)" t=[0,pi] samples=600 stroke=#dc2626 label="Rose"
polar SPIRAL eq="t/10" t=[0,6*pi] samples=800 stroke=#7c3aed label="Spiral"
polar CARDIOID eq="1+cos(t)" t=[0,2*pi] samples=500 stroke=#059669
```
- `eq` — expression for `r(t)`. Available: `sin cos tan sqrt abs exp log pow floor ceil pi`
- `t` range in brackets `[start,end]`; `pi` is accepted as a literal
- Renders as a smooth SVG path from sampled `(r·cos(t), r·sin(t))` points

### Dimensions
```sketch
dim linear D1 from=(0,0) to=(60,0) offset=20 label="60 mm"
dim radius D2 ref=C1
dim angle  D3 center=(0,0) r=28 start=0 end=90 label="90°"
```
- `dim linear` — extension lines + arrowhead dimension
- `dim radius` — radius leader from center to edge (ref must be a `circle` id)
- `dim angle` — arc with label between two angle lines

### Complete example
```sketch
title "Slot Plate"
canvas width=540 height=400 scale=2.8 grid=10 originX=270 originY=200

datum point O at=(0,0) label="O"
datum axis X direction=horizontal at=0 label="X"
datum axis Y direction=vertical at=0 label="Y"

rect  PLATE center=(0,0) width=160 height=90 fill=#e0f2fe stroke=#0369a1 stroke_width=2 label="PLATE"
circle HOLE1 center=(-60,25) radius=10 fill=#fff stroke=#dc2626 stroke_width=1.8 label="H1"
circle HOLE2 center=(60,25)  radius=10 fill=#fff stroke=#dc2626 stroke_width=1.8 label="H2"
circle HOLE3 center=(-60,-25) radius=10 fill=#fff stroke=#dc2626 stroke_width=1.8
circle HOLE4 center=(60,-25)  radius=10 fill=#fff stroke=#dc2626 stroke_width=1.8

dim linear DW from=(-80,0) to=(80,0)  offset=-58 label="160 mm"
dim linear DH from=(0,-45) to=(0,45)  offset=98  label="90 mm"
dim radius DR ref=HOLE1 label="R10"
```

---

## 6. 3-D Parametric Sketch — ` ```sketch3d `

Interactive 3-D solid model rendered on an HTML `<canvas>`.  
**Mouse controls**: drag = orbit · Shift+drag = pan · scroll = zoom · ↺ button = reset view.

### Canvas and view
```sketch3d
title "My Part"
canvas width=800 height=360
view rotX=25 rotY=-35 zoom=1.4
```
- `rotX` / `rotY` — initial orbit angles in degrees
- `zoom` — relative zoom (1.0 = default fit)

### Datum elements
```sketch3d
datum plane XY          // semi-transparent XY ground plane
datum plane XZ          // semi-transparent XZ plane
datum plane YZ          // semi-transparent YZ plane
datum axis X            // red X arrow
datum axis Y            // green Y arrow
datum axis Z            // blue Z arrow
```

### Pad (material addition)
Extrudes a closed 2-D profile upward from a Z plane.
```sketch3d
pad ID profile=rect   center=(cx,cy) width=W height=H plane=z(Z0) depth=D [color=#hex] [direction=-Z]
pad ID profile=circle center=(cx,cy) radius=R          plane=z(Z0) depth=D [color=#hex] [direction=-Z]
pad ID profile=gear   center=(cx,cy) teeth=T module=M  plane=z(Z0) depth=D [color=#hex] [direction=-Z]
```
- `profile=gear` — spur gear with `T` teeth and module `M` (standard metric sizing)
  - Pitch radius = `T×M/2`, outer = pitch+M, root = pitch−1.25×M
  - For meshing gears: center distance = `(T1+T2)×M/2`
  - Generates `T×4`-point polygon (4 pts/tooth: root → tip → tip → root)
- `plane=z(N)` — the Z level where the sketch sits
- `depth` — extrusion distance (positive, always)
- `direction=-Z` — extrude downward instead of up (optional)

### Pocket (material removal)
Cuts a hole **into** the solid from a Z plane downward.
```sketch3d
pocket ID profile=rect   center=(cx,cy) width=W height=H plane=z(Z1) depth=D
pocket ID profile=circle center=(cx,cy) radius=R          plane=z(Z1) depth=D
```
- `plane=z(N)` — the face level from which the pocket starts
- `depth` — how deep to cut (always positive; pocket cuts downward)

### Complete example
```sketch3d
title "Base Plate with Boss"
canvas width=800 height=360
view rotX=22 rotY=-42 zoom=1.2

datum plane XY
datum axis X
datum axis Y
datum axis Z

pad   BASE  profile=rect   center=(0,0)   width=120 height=80 plane=z(0)  depth=20 color=#3b82f6
pad   BOSS  profile=circle center=(0,0)   radius=26           plane=z(20) depth=16 color=#22c55e
pocket HOLE profile=circle center=(42,28) radius=9            plane=z(20) depth=20
```

### Rules
- Each feature is **one line**; order matters — later features render on top
- `center=(x,y)` uses the same math coordinate system as `sketch` (Y-up)
- `color=` is optional; default pad = `#3b82f6` (blue), pocket walls = `#0f172a` (near-black)
- Maximum 24 polygon sides for circles (auto-capped for performance)
- Download SVG button is hidden for 3-D blocks (canvas-only output)

---

## General rules (all types)

1. Always declare components/shapes before referencing them
2. `layout` before `group` (circuit/line/wiring)
3. Color consistency: pick one hex/IEC code per net and reuse
4. No external dependencies — pure browser JS only
5. The `canvas` controls the sketch viewport; tune `scale` to fit the geometry
6. Use `datum` elements as construction references — they don't print
7. For LLMs: generate only one diagram type per fenced block; do not mix types
