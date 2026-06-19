(function () {
  "use strict";

  const PROJECT_CREATOR = "Rakesh Patil";
  const STORAGE_KEY = "schematic-markdown-source-v9";
  const STANDALONE_SVG_STYLE = `
    text { font-family: Inter, Arial, sans-serif; }
    .symbol-label { font: 600 12px/1.2 Inter, Arial, sans-serif; fill: #172033; }
    .net-label text { font: 600 10px/1 Inter, Arial, sans-serif; letter-spacing: 0; }
    .net-label-scope { font-size: 8px; font-weight: 800; }
    .net-label-local polygon { stroke-dasharray: 3 2; }
    .power-net-label text { font: 700 9.5px/1 Inter, Arial, sans-serif; letter-spacing: 0; }
    .no-connect line { stroke: #dc2626; stroke-width: 2; stroke-linecap: round; }
    .fallback-symbol { fill: #f8fafc; stroke: currentColor; stroke-width: 1.5; }
    .group-region rect { fill: #f8fafc; fill-opacity: 0.58; stroke-width: 1.5; }
    .group-region-implicit rect { stroke-dasharray: 5 4; }
    .group-title { font: 700 12px/1 Inter, Arial, sans-serif; fill: #334155; }
    .group-direction { font: 800 9px/1 Inter, Arial, sans-serif; fill: #64748b; }
    .line-equipment-ref { font: 800 12px/1 Inter, Arial, sans-serif; fill: #172033; }
    .line-equipment-label { font: 600 11px/1 Inter, Arial, sans-serif; fill: #334155; }
    .line-equipment-detail { font: 600 9.5px/1 Inter, Arial, sans-serif; fill: #64748b; }
    .line-edge-label { font: 700 9px/1 Inter, Arial, sans-serif; fill: #475569; paint-order: stroke; stroke: #fff; stroke-width: 4px; stroke-linejoin: round; }
    .line-control-label { font: 800 8.5px/1 Inter, Arial, sans-serif; letter-spacing: 0; paint-order: stroke; stroke: #fff; stroke-width: 4px; stroke-linejoin: round; }
    .line-title { font: 800 15px/1 Inter, Arial, sans-serif; fill: #172033; }
    .wiring-title { font: 800 16px/1 Inter, Arial, sans-serif; fill: #172033; }
    .wiring-device-ref { font: 800 12px/1 Inter, Arial, sans-serif; fill: #172033; }
    .wiring-device-label { font: 600 10px/1 Inter, Arial, sans-serif; fill: #475569; }
    .wiring-device-type { font: 800 9px/1 Inter, Arial, sans-serif; fill: #94a3b8; }
    .wiring-terminal-label { font: 800 9px/1 Inter, Arial, sans-serif; fill: #172033; }
    .wiring-wire-label { font: 800 9px/1 Inter, Arial, sans-serif; fill: #172033; }
    .wiring-title-small { font: 700 9px/1 Inter, Arial, sans-serif; fill: #475569; }
    .waveform-title { font: 800 17px/1 Inter, Arial, sans-serif; fill: #172033; }
    .waveform-subtitle { font: 600 9.5px/1 Inter, Arial, sans-serif; fill: #64748b; }
    .waveform-ref { font: 800 11px/1 Inter, Arial, sans-serif; fill: #172033; }
    .waveform-label { font: 600 9.5px/1 Inter, Arial, sans-serif; fill: #475569; }
    .waveform-type { font: 800 8px/1 Inter, Arial, sans-serif; fill: #64748b; letter-spacing: 0; }
    .waveform-value { font: 700 8px/1 Inter, Arial, sans-serif; fill: #64748b; }
    .waveform-time { font: 700 8.5px/1 Inter, Arial, sans-serif; fill: #475569; }
    .waveform-marker { font: 800 8.5px/1 Inter, Arial, sans-serif; fill: #334155; }
  `;
  const CATALOG = window.KICAD_SYMBOL_CATALOG || { symbols: {}, libraries: {}, loadedLibraries: {}, symbolCount: 0, generatedAt: null };
  const knownSymbolCache = new Map();
  const libraryLoads = new Map();

  const DEFAULT_MARKDOWN = `# Conceptual 240 VAC to 12 V isolated flyback system

> Architecture demo only. Mains isolation, creepage, transformer design, protection,
> thermal limits, EMI compliance, and component ratings require qualified engineering.

## Sheet 1 - protected mains input and flyback primary

\`\`\`circuit
define AC_INPUT annotation=J label="240 VAC Input" {
  pin 1 LINE right
  pin 2 NEUTRAL right
}

define BRIDGE_RECT annotation=BR label="Bridge Rectifier" {
  pin 1 AC1 left
  pin 2 AC2 left
  pin 3 HV+ right
  pin 4 HV- bottom
}

define FLYBACK_XFMR annotation=T label="Flyback Transformer" {
  pin 1 PRI+ left
  pin 2 PRI- left
  pin 3 SEC+ right
  pin 4 SEC- right
}

define FLYBACK_PWM annotation=U label="Flyback PWM" {
  pin 1 GATE right
  pin 2 CS bottom
  pin 3 FB left
  pin 4 VCC top
  pin 5 GND bottom
  pin 6 HVSTART left
}

J1: AC_INPUT value="240 VAC" color=#b91c1c
F1: Device:Fuse value="Input fuse" color=#b91c1c
MOV1: Device:Varistor value="Surge clamp" color=#b91c1c
BR1: BRIDGE_RECT value="HV bridge" color=#9f1239
CBULK: Device:C_Polarized value="HV bulk" color=#9f1239
T1: FLYBACK_XFMR value="Isolated flyback" color=#7c3aed
QPRI: Transistor_FET:Q_NMOS_GDS value="Primary MOSFET" color=#b45309
U1: FLYBACK_PWM value="PWM controller" color=#4f46e5
RGATE: Device:R value="Gate resistor" color=#92400e
RCS: Device:R value="Current sense" color=#92400e
RSTART: Device:R value="HV startup" color=#92400e
CVCC: Device:C value="PWM VCC" color=#0369a1

layout direction=LR gap=90
group MAINS label="Mains protection" direction=LR {
  J1 F1 MOV1 BR1
}
group POWER_STAGE label="Flyback power stage" direction=LR {
  CBULK T1 QPRI RCS
}
group PWM_CONTROL label="PWM control" direction=TB {
  RSTART CVCC U1 RGATE
}

// Protected rectified mains bus.
J1.1 --> F1.1 color=#b91c1c
F1.2 --> BR1.1 color=#b91c1c
J1.2 --> BR1.2 color=#b91c1c
F1.2 --> MOV1.1 color=#b91c1c
J1.2 --> MOV1.2 color=#b91c1c
BR1.3 --> CBULK.1 color=#9f1239
BR1.3 --> T1.1 color=#9f1239
BR1.3 --> RSTART.1 color=#9f1239
BR1.4 --> global:PRIMARY_RETURN color=#475569
CBULK.2 --> global:PRIMARY_RETURN color=#475569

// Primary switch and controller.
T1.2 --> QPRI.D color=#d97706
U1.GATE --> RGATE.1 color=#d97706
RGATE.2 --> QPRI.G color=#d97706
QPRI.S --> RCS.1 color=#d97706
U1.CS --> RCS.1 color=#d97706
RCS.2 --> global:PRIMARY_RETURN color=#475569
RSTART.2 --> U1.VCC color=#dc2626
U1.VCC --> CVCC.1 color=#dc2626
CVCC.2 --> global:PRIMARY_RETURN color=#475569
U1.GND --> global:PRIMARY_RETURN color=#475569
U1.HVSTART --> BR1.3 color=#9f1239
T1.SEC+ --> global:FLYBACK_SEC_P color=#7c3aed
T1.SEC- --> global:0V_ISO color=#7c3aed
U1.FB --> global:FLYBACK_FB color=#0f766e
\`\`\`

## Sheet 2 - isolated secondary and voltage feedback

\`\`\`circuit
define SECONDARY_WINDING annotation=T label="Flyback Secondary" {
  pin 1 SEC+ right
  pin 2 SEC- right
}

define FEEDBACK_REF annotation=U label="Secondary Feedback" {
  pin 1 SENSE left
  pin 2 LED right
  pin 3 GND bottom
}

TSEC: SECONDARY_WINDING value="Isolated winding" color=#7c3aed
DSEC: Device:D_Schottky value="Secondary rectifier" color=#16a34a
COUT: Device:C_Polarized value="12 V output" color=#0369a1
RFB_TOP: Device:R value="Feedback upper" color=#92400e
RFB_BOT: Device:R value="Feedback lower" color=#92400e
UFB: FEEDBACK_REF value="Reference" color=#0f766e
ROPTO: Device:R value="Opto LED limit" color=#92400e
OPTO1: Isolator:LTV-817 value="Isolation feedback" color=#7c3aed

layout direction=LR gap=90
group RECTIFIER label="Secondary rectifier" direction=LR {
  TSEC DSEC COUT
}
group SENSE label="Voltage sensing" direction=TB {
  RFB_TOP UFB RFB_BOT
}
group ISOLATION label="Isolated feedback" direction=LR {
  ROPTO OPTO1
}

TSEC.SEC+ --> global:FLYBACK_SEC_P color=#7c3aed
DSEC.A --> global:FLYBACK_SEC_P color=#7c3aed
DSEC.K --> global:+12V_ISO color=#7c3aed
COUT.1 --> global:+12V_ISO color=#7c3aed
RFB_TOP.1 --> global:+12V_ISO color=#7c3aed
TSEC.SEC- --> global:0V_ISO color=#334155
COUT.2 --> global:0V_ISO color=#334155
RFB_TOP.2 --> UFB.SENSE color=#0f766e
UFB.SENSE --> RFB_BOT.1 color=#0f766e
RFB_BOT.2 --> global:0V_ISO color=#334155
UFB.LED --> ROPTO.1 color=#0f766e
ROPTO.2 --> OPTO1.1 color=#0f766e
OPTO1.2 --> global:0V_ISO color=#334155
UFB.GND --> global:0V_ISO color=#334155
OPTO1.4 --> global:FLYBACK_FB color=#0f766e
OPTO1.3 --> global:PRIMARY_RETURN color=#475569
\`\`\`

## Sheet 3 - MCU power and NTC measurement

\`\`\`circuit
define BUCK_3V3 annotation=U label="12 V to 3.3 V Buck" {
  pin 1 VIN left
  pin 2 VOUT right
  pin 3 EN top
  pin 4 GND bottom
}

define MCU_CONTROL annotation=U label="Audio and Sensor MCU" {
  pin 1 VDD top
  pin 2 GND bottom
  pin 3 ADC_NTC left
  pin 4 AUDIO_L right
  pin 5 AUDIO_R right
  pin 6 AMP_EN right
  pin 7 AUX_PWM bottom
}

U2: BUCK_3V3 value="3.3 V regulator" color=#16a34a
CIN: Device:C value="12 V bypass" color=#0369a1
C3V3: Device:C value="MCU bypass" color=#0369a1
U3: MCU_CONTROL value="Microcontroller" color=#4f46e5
NTC1: Device:Thermistor_NTC value="Temperature NTC" color=#dc2626
RNTC: Device:R value="NTC divider" color=#92400e
CNTC: Device:C value="ADC filter" color=#0369a1

layout direction=LR gap=90
group SUPPLY label="Low-voltage supply" direction=TB {
  CIN U2 C3V3
}
group CONTROL label="Microcontroller" direction=LR {
  U3
}
group TEMPERATURE label="NTC measurement" direction=TB {
  NTC1 RNTC CNTC
}

// Repeated rail labels replace long power and ground wires.
U2.VIN --> global:+12V_ISO color=#7c3aed
CIN.1 --> global:+12V_ISO color=#7c3aed
CIN.2 --> global:0V_ISO color=#334155
U2.GND --> global:0V_ISO color=#334155
U2.VOUT --> global:+3V3 color=#16a34a
U3.VDD --> global:+3V3 color=#16a34a
C3V3.1 --> global:+3V3 color=#16a34a
NTC1.1 --> global:+3V3 color=#16a34a
C3V3.2 --> global:0V_ISO color=#334155
U3.GND --> global:0V_ISO color=#334155
U2.VIN --> U2.EN color=#7c3aed

// NTC divider into the MCU ADC.
NTC1.2 --> local:NTC_SENSE color=#0891b2
U3.ADC_NTC --> local:NTC_SENSE color=#0891b2
RNTC.1 --> local:NTC_SENSE color=#0891b2
CNTC.1 --> local:NTC_SENSE color=#0891b2
RNTC.2 --> global:0V_ISO color=#334155
CNTC.2 --> global:0V_ISO color=#334155

// Cross-sheet control signals need no long drawing wires.
U3.AUDIO_L --> global:AUDIO_L color=#2563eb
U3.AUDIO_R --> global:AUDIO_R color=#0f766e
U3.AMP_EN --> global:AMP_EN color=#d97706
U3.AUX_PWM --> global:AUX_PWM color=#d97706

\`\`\`

## Sheet 4 - MOSFET auxiliary load driver

\`\`\`circuit
define AUX_LOAD annotation=K label="12 V Relay or Fan" {
  pin 1 +12V top
  pin 2 LOW_SIDE bottom
}

RG_LOAD: Device:R value="MOSFET gate" color=#92400e
RPD: Device:R value="Gate pull-down" color=#92400e
QLOAD: Transistor_FET:Q_NMOS_GDS value="Aux low-side MOSFET" color=#b45309
K1: AUX_LOAD value="Relay or fan" color=#0f766e
D1: Device:D_Schottky value="Load flyback clamp" color=#16a34a

layout direction=LR gap=90
group GATE_DRIVE label="MOSFET drive" direction=LR {
  RG_LOAD QLOAD RPD
}
group AUXILIARY_LOAD label="Protected load" direction=TB {
  K1 D1
}

RG_LOAD.1 --> global:AUX_PWM color=#d97706
RG_LOAD.2 --> QLOAD.G color=#d97706
QLOAD.G --> RPD.1 color=#d97706
RPD.2 --> global:0V_ISO color=#334155
K1.1 --> global:+12V_ISO color=#7c3aed
K1.2 --> QLOAD.D color=#d97706
QLOAD.S --> global:0V_ISO color=#334155
K1.2 --> D1.A color=#d97706
D1.K --> global:+12V_ISO color=#7c3aed
\`\`\`

## Sheet 5 - stereo audio, BJT mute, and speakers

\`\`\`circuit
define STEREO_AMP annotation=U label="Stereo Audio Amplifier" {
  pin 1 VCC top
  pin 2 GND bottom
  pin 3 IN_L left
  pin 4 IN_R left
  pin 5 OUT_L right
  pin 6 OUT_R right
  pin 7 MUTE bottom
}

RAUD_L: Device:R value="Left PWM filter" color=#92400e
CAUD_L: Device:C value="Left AC coupling" color=#0369a1
RAUD_R: Device:R value="Right PWM filter" color=#92400e
CAUD_R: Device:C value="Right AC coupling" color=#0369a1
U4: STEREO_AMP value="Class-D amplifier" color=#7c3aed
LS1: Device:Speaker value="Left speaker" color=#16a34a
LS2: Device:Speaker value="Right speaker" color=#16a34a
QN1: Transistor_BJT:Q_NPN_BCE value="Amplifier mute" color=#b45309
RB: Device:R value="BJT base" color=#92400e
RPU: Device:R value="Mute pull-up" color=#92400e

layout direction=LR gap=82
group LEFT_CHANNEL label="Left audio input" direction=LR {
  RAUD_L CAUD_L
}
group RIGHT_CHANNEL label="Right audio input" direction=LR {
  RAUD_R CAUD_R
}
group AMPLIFIER label="Amplifier and mute" direction=TB {
  U4 QN1 RB RPU
}
group OUTPUTS label="Speaker outputs" direction=TB {
  LS1 LS2
}

U4.VCC --> global:+12V_ISO color=#7c3aed
U4.GND --> global:0V_ISO color=#334155

RAUD_L.1 --> global:AUDIO_L color=#2563eb
RAUD_L.2 --> CAUD_L.1 color=#2563eb
CAUD_L.2 --> U4.IN_L color=#2563eb
RAUD_R.1 --> global:AUDIO_R color=#0f766e
RAUD_R.2 --> CAUD_R.1 color=#0f766e
CAUD_R.2 --> U4.IN_R color=#0f766e

U4.OUT_L --> LS1.1 color=#7c3aed
LS1.2 --> global:0V_ISO color=#334155
U4.OUT_R --> LS2.1 color=#7c3aed
LS2.2 --> global:0V_ISO color=#334155

RB.1 --> global:AMP_EN color=#d97706
RB.2 --> QN1.B color=#d97706
QN1.C --> U4.MUTE color=#d97706
QN1.E --> global:0V_ISO color=#334155
RPU.1 --> global:+3V3 color=#16a34a
RPU.2 --> U4.MUTE color=#d97706
\`\`\`

## Electrical line diagram - protected AC and 12 VDC distribution

\`\`\`line
title "Control panel power distribution"
layout direction=TB gap=64 rankgap=52

GRID: source label="Utility supply" voltage="240 VAC" phases="1P+N" color=#b91c1c
QF1: breaker label="Main MCB" rating="16 A" poles=2 curve=C color=#b91c1c
RCCB1: rcd label="Earth leakage protection" rating="25 A / 30 mA" poles=2 color=#b91c1c
ACBUS: bus label="Protected AC bus" voltage="240 VAC" color=#9f1239
QF2: breaker label="SMPS feeder" rating="6 A" poles=2 curve=C color=#9f1239
PS1: power_supply label="AC/DC SMPS" input="240 VAC" output="12 VDC / 5 A" color=#7c3aed
DCBUS: bus label="12 VDC distribution" voltage="12 VDC" color=#7c3aed
F1: fuse label="Controller branch" rating="1 A" color=#2563eb
F2: fuse label="Audio branch" rating="3 A" color=#0f766e
F3: fuse label="Auxiliary branch" rating="2 A" color=#d97706
CTRL: load label="MCU and sensors" voltage="12 VDC" color=#2563eb
AMP: load label="Audio amplifier" voltage="12 VDC" color=#0f766e
KM1: contactor label="Auxiliary contactor" coil="12 VDC" color=#d97706
OL1: overload label="Auxiliary overload" rating="2 A" color=#d97706
AUX: load label="Relay or fan" voltage="12 VDC" color=#d97706
PR1: protection_relay label="Protection relay" function="Fault trip" color=#c2410c

GRID --> QF1 cable="2C + PE"
QF1 --> RCCB1
RCCB1 --> ACBUS
ACBUS --> QF2
QF2 --> PS1
PS1 --> DCBUS
DCBUS --> F1
DCBUS --> F2
DCBUS --> F3
F1 --> CTRL
F2 --> AMP
F3 --> KM1
KM1 --> OL1
OL1 --> AUX
PR1 --control--> KM1 label="TRIP / ENABLE"
KM1 --feedback--> PR1 label="AUX STATUS"
\`\`\`

## Panel wiring sticker - DOL motor starter

\`\`\`wiring
title "DOL motor starter - panel wiring"
layout direction=LR gap=86 rowgap=118 wrap=5

X1: terminal_strip label="Incoming and control" terminals="1:L1@left,2:L2@left,3:L3@left,4:PE@left,5:+24V@right,6:0V@right"
QF1: breaker_3p label="Main breaker"
KM1: contactor label="Main contactor"
OL1: overload label="Motor overload"
X2: terminal_strip label="Motor field terminals" terminals="1:U@right,2:V@right,3:W@right,4:PE@right"
S0: pushbutton_nc label="STOP"
PR1: protection_relay label="Protection trip" terminals="95:TRIP_IN@left,96:TRIP_OUT@right,DI:KM_AUX@bottom"
S1: pushbutton_no label="START"

X1.1 --> QF1.1 wire=101 color=BN size=2.5mm2
X1.2 --> QF1.3 wire=102 color=BK size=2.5mm2
X1.3 --> QF1.5 wire=103 color=GY size=2.5mm2
QF1.2 --> KM1.L1 wire=111 color=BN size=2.5mm2
QF1.4 --> KM1.L2 wire=112 color=BK size=2.5mm2
QF1.6 --> KM1.L3 wire=113 color=GY size=2.5mm2
KM1.T1 --> OL1.1 wire=121 color=BN size=2.5mm2
KM1.T2 --> OL1.3 wire=122 color=BK size=2.5mm2
KM1.T3 --> OL1.5 wire=123 color=GY size=2.5mm2
OL1.2 --> X2.1 wire=131 color=BN size=2.5mm2
OL1.4 --> X2.2 wire=132 color=BK size=2.5mm2
OL1.6 --> X2.3 wire=133 color=GY size=2.5mm2
X1.4 --> X2.4 wire=PE1 color=GNYE size=2.5mm2

X1.5 --> S0.1 wire=401 color=RD size=0.75mm2
S0.2 --> PR1.95 wire=402 color=RD size=0.75mm2
PR1.96 --> S1.1 wire=403 color=RD size=0.75mm2
S1.2 --> KM1.A1 wire=404 color=RD size=0.75mm2
KM1.A2 --> X1.6 wire=405 color=BU size=0.75mm2
X1.5 --> KM1.13 wire=406 color=RD size=0.75mm2
KM1.14 --> PR1.DI wire=407 color=OG size=0.75mm2
\`\`\`

## Educational waveform sheet

\`\`\`waveform
title "Idealized signals for teaching"
time start=0 end=10 unit=ms divisions=10

AC: sine label="AC sine wave" amplitude=1 cycles=2 unit=V color=#2563eb
PWM: square label="PWM, 35% duty" low=0 high=5 duty=35 cycles=5 unit=V color=#dc2626
TRI: triangle label="Triangle wave" min=-1 max=1 cycles=2 unit=V color=#7c3aed
RAMP: sawtooth label="Sawtooth ramp" min=0 max=1 cycles=3 unit=V color=#0f766e
TRIG: pulse label="Single trigger pulse" low=0 high=5 at=2 width=2 unit=V color=#d97706
VC: exponential label="Capacitor charging" from=0 to=5 tau=2 unit=V color=#16a34a

marker SWITCH at=2 label="trigger"
marker SAMPLE at=7 label="sample"
\`\`\``;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isColor(value) {
    return /^#[0-9a-f]{3,8}$/i.test(value) || /^[a-z]+$/i.test(value);
  }

  function splitSymbolId(symbolId) {
    const colon = String(symbolId || "").indexOf(":");
    if (colon === -1) return { library: null, name: String(symbolId || "") };
    return {
      library: symbolId.slice(0, colon),
      name: symbolId.slice(colon + 1)
    };
  }

  function knownSymbolsForLibrary(libraryName) {
    if (!libraryName) return new Set();
    if (!knownSymbolCache.has(libraryName)) {
      knownSymbolCache.set(libraryName, new Set(CATALOG.libraries?.[libraryName]?.symbols || []));
    }
    return knownSymbolCache.get(libraryName);
  }

  function catalogKnowsSymbol(symbolId) {
    if (CATALOG.symbols?.[symbolId]) return true;
    const { library, name } = splitSymbolId(symbolId);
    return knownSymbolsForLibrary(library).has(name);
  }

  function loadedSymbolCount() {
    return Object.keys(CATALOG.symbols || {}).length;
  }

  function loadedLibraryCount() {
    return Object.values(CATALOG.loadedLibraries || {}).filter((value) => value === true).length;
  }

  function updateCatalogStatus(element) {
    if (!element) return;
    const totalLibraries = Object.keys(CATALOG.libraries || {}).length;
    if (!CATALOG.symbolCount) {
      element.textContent = "No generated KiCad catalog found. Placeholders will be used.";
      return;
    }
    element.textContent = `${loadedSymbolCount().toLocaleString()} of ${CATALOG.symbolCount.toLocaleString()} symbols loaded (${loadedLibraryCount()} of ${totalLibraries} libraries)`;
  }

  function loadLibrary(libraryName) {
    if (!libraryName || !CATALOG.libraries?.[libraryName]) return Promise.resolve(false);
    if (CATALOG.loadedLibraries?.[libraryName] === true) return Promise.resolve(true);
    if (CATALOG.loadedLibraries?.[libraryName] === "failed") return Promise.resolve(false);
    if (libraryLoads.has(libraryName)) return libraryLoads.get(libraryName);

    const promise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = CATALOG.libraries[libraryName].file;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        CATALOG.loadedLibraries = CATALOG.loadedLibraries || {};
        CATALOG.loadedLibraries[libraryName] = "failed";
        resolve(false);
      };
      document.head.appendChild(script);
    });
    libraryLoads.set(libraryName, promise);
    return promise;
  }

  function loadLibraries(libraryNames) {
    return Promise.all([...new Set(libraryNames)].map(loadLibrary));
  }

  function stripComment(line) {
    let quote = null;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      const next = line[i + 1];
      if (quote) {
        if (ch === "\\" && next) {
          i += 1;
        } else if (ch === quote) {
          quote = null;
        }
        continue;
      }
      if (ch === "\"" || ch === "'") {
        quote = ch;
        continue;
      }
      const hexColor = ch === "#" && /^[0-9a-f]{3,8}(?:\s|$)/i.test(line.slice(i + 1));
      if ((ch === "#" && !hexColor) || (ch === "/" && next === "/")) {
        return line.slice(0, i).trim();
      }
    }
    return line.trim();
  }

  function tokenize(input) {
    const tokens = [];
    let current = "";
    let quote = null;
    for (let i = 0; i < input.length; i += 1) {
      const ch = input[i];
      if (quote) {
        if (ch === "\\" && i + 1 < input.length) {
          current += input[i + 1];
          i += 1;
        } else if (ch === quote) {
          quote = null;
        } else {
          current += ch;
        }
        continue;
      }
      if (ch === "\"" || ch === "'") {
        quote = ch;
      } else if (/\s/.test(ch)) {
        if (current) {
          tokens.push(current);
          current = "";
        }
      } else {
        current += ch;
      }
    }
    if (current) tokens.push(current);
    return tokens;
  }

  function parseAttributes(text) {
    const attrs = {};
    for (const token of tokenize(text || "")) {
      const eq = token.indexOf("=");
      if (eq === -1) {
        attrs[token] = true;
      } else {
        const key = token.slice(0, eq).trim();
        const value = token.slice(eq + 1).trim();
        if (key) attrs[key] = value;
      }
    }
    return attrs;
  }

  function parseEndpoint(text) {
    const trimmed = text.trim();
    const labelMatch = trimmed.match(/^(global|local):([^\s]+)$/i);
    if (labelMatch) {
      return {
        kind: "label",
        scope: labelMatch[1].toLowerCase(),
        name: labelMatch[2],
        raw: trimmed
      };
    }
    if (/^NC$/i.test(trimmed)) return { kind: "nc", raw: trimmed };
    const lastDot = trimmed.lastIndexOf(".");
    if (lastDot <= 0) return { kind: "component", ref: trimmed, pin: null, raw: trimmed };
    return {
      kind: "component",
      ref: trimmed.slice(0, lastDot),
      pin: trimmed.slice(lastDot + 1),
      raw: trimmed
    };
  }

  function extractDiagramBlocks(markdown) {
    const blocks = [];
    const fenceRe = /^```(circuit|schematic|line|line-diagram|singleline|single-line|one-line|wiring|panel-wiring|waveform|waveforms)\s*$/gim;
    let match;
    while ((match = fenceRe.exec(markdown)) !== null) {
      const startIndex = match.index + match[0].length;
      const before = markdown.slice(0, match.index);
      const startLine = before.split(/\r\n|\r|\n/).length + 1;
      const closeRe = /^```\s*$/gim;
      closeRe.lastIndex = startIndex;
      const close = closeRe.exec(markdown);
      if (!close) {
        blocks.push({
          language: match[1],
          source: markdown.slice(startIndex).replace(/^\r?\n/, ""),
          startLine
        });
        break;
      }
      blocks.push({
        language: match[1],
        source: markdown.slice(startIndex, close.index).replace(/^\r?\n/, ""),
        startLine
      });
      fenceRe.lastIndex = close.index + close[0].length;
    }

    if (!blocks.length && markdown.trim()) {
      blocks.push({ language: "circuit", source: markdown, startLine: 1 });
    }
    return blocks;
  }

  function parseCircuit(source, options = {}) {
    const startLine = options.startLine || 1;
    const circuit = {
      aliases: new Map(),
      definitions: new Map(),
      components: [],
      connections: [],
      labels: [],
      noConnects: [],
      layout: null,
      groups: [],
      diagnostics: []
    };
    const seenComponents = new Set();
    const seenGroups = new Set();
    let activeDefinition = null;
    let activeGroup = null;

    source.split(/\r\n|\r|\n/).forEach((rawLine, index) => {
      const lineNumber = startLine + index;
      const line = stripComment(rawLine);
      if (!line) return;

      if (activeDefinition) {
        if (line === "}") {
          if (!activeDefinition.pins.length) {
            circuit.diagnostics.push(warning(activeDefinition.line, `Definition "${activeDefinition.name}" has no pins.`));
          }
          activeDefinition = null;
          return;
        }

        const pinTokens = tokenize(line);
        if (pinTokens[0] !== "pin" || pinTokens.length < 4) {
          circuit.diagnostics.push(error(lineNumber, "Expected: pin <number> <name> <left|right|top|bottom>"));
          return;
        }
        const side = pinTokens[pinTokens.length - 1].toLowerCase();
        const number = pinTokens[1];
        const name = pinTokens.slice(2, -1).join(" ");
        if (!["left", "right", "top", "bottom"].includes(side)) {
          circuit.diagnostics.push(error(lineNumber, `Unknown pin side "${side}".`));
          return;
        }
        if (activeDefinition.pins.some((pin) => pin.number === number)) {
          circuit.diagnostics.push(error(lineNumber, `Duplicate pin number "${number}" in "${activeDefinition.name}".`));
          return;
        }
        activeDefinition.pins.push({ number, name, side, line: lineNumber });
        return;
      }

      if (activeGroup) {
        if (line === "}") {
          if (!activeGroup.members.length) {
            circuit.diagnostics.push(warning(activeGroup.line, `Group "${activeGroup.name}" has no members.`));
          }
          activeGroup = null;
          return;
        }
        const members = tokenize(line)
          .flatMap((token) => token.split(","))
          .map((token) => token.trim())
          .filter(Boolean);
        if (!members.length || members.some((member) => !/^[A-Za-z_][\w.-]*$/.test(member))) {
          circuit.diagnostics.push(error(lineNumber, "Expected one or more component references inside the group."));
          return;
        }
        activeGroup.members.push(...members.map((ref) => ({ ref, line: lineNumber })));
        return;
      }

      const layoutMatch = line.match(/^layout\b(.*)$/i);
      if (layoutMatch) {
        if (circuit.layout) {
          circuit.diagnostics.push(error(lineNumber, "Only one layout declaration is allowed per circuit block."));
          return;
        }
        circuit.layout = { attrs: parseAttributes(layoutMatch[1]), line: lineNumber };
        return;
      }

      const groupMatch = line.match(/^group\s+([A-Za-z_][\w-]*)(.*?)\s*\{$/i);
      if (groupMatch) {
        const name = groupMatch[1];
        if (seenGroups.has(name)) {
          circuit.diagnostics.push(error(lineNumber, `Duplicate group "${name}".`));
          return;
        }
        seenGroups.add(name);
        activeGroup = {
          name,
          attrs: parseAttributes(groupMatch[2]),
          members: [],
          line: lineNumber
        };
        circuit.groups.push(activeGroup);
        return;
      }

      const defineMatch = line.match(/^define\s+([A-Za-z_][\w-]*)(.*?)\s*\{$/);
      if (defineMatch) {
        const name = defineMatch[1];
        if (circuit.definitions.has(name)) {
          circuit.diagnostics.push(error(lineNumber, `Duplicate component definition "${name}".`));
          return;
        }
        activeDefinition = {
          name,
          attrs: parseAttributes(defineMatch[2]),
          pins: [],
          line: lineNumber
        };
        circuit.definitions.set(name, activeDefinition);
        return;
      }

      const aliasMatch = line.match(/^alias\s+([A-Za-z_][\w-]*)\s*=\s*([^\s]+)(.*)$/);
      if (aliasMatch) {
        circuit.aliases.set(aliasMatch[1], {
          name: aliasMatch[1],
          target: aliasMatch[2],
          attrs: parseAttributes(aliasMatch[3]),
          line: lineNumber
        });
        return;
      }

      const connectionMatch = line.match(/^(.+?)\s*-->\s*(.+?)(?:\s+(.+))?$/);
      if (connectionMatch) {
        const from = parseEndpoint(connectionMatch[1]);
        const to = parseEndpoint(connectionMatch[2]);
        const attrs = parseAttributes(connectionMatch[3]);
        const componentEndpoint = from.kind === "component" ? from : to.kind === "component" ? to : null;
        const labelEndpoint = from.kind === "label" ? from : to.kind === "label" ? to : null;
        const noConnectEndpoint = from.kind === "nc" ? from : to.kind === "nc" ? to : null;

        if (labelEndpoint || noConnectEndpoint) {
          if (!componentEndpoint || (labelEndpoint && noConnectEndpoint) || from.kind === to.kind) {
            circuit.diagnostics.push(error(lineNumber, "A label or NC marker must connect to exactly one component pin."));
            return;
          }
          if (labelEndpoint) {
            circuit.labels.push({
              scope: labelEndpoint.scope,
              name: labelEndpoint.name,
              endpoint: componentEndpoint,
              attrs,
              line: lineNumber
            });
          } else {
            circuit.noConnects.push({ endpoint: componentEndpoint, attrs, line: lineNumber });
          }
          return;
        }

        circuit.connections.push({ from, to, attrs, line: lineNumber });
        return;
      }

      const componentMatch = line.match(/^([A-Za-z_][\w.-]*)\s*:\s*([^\s]+)(.*)$/);
      if (componentMatch) {
        const ref = componentMatch[1];
        if (seenComponents.has(ref)) {
          circuit.diagnostics.push(error(lineNumber, `Duplicate component reference "${ref}".`));
        }
        seenComponents.add(ref);
        circuit.components.push({
          ref,
          type: componentMatch[2],
          attrs: parseAttributes(componentMatch[3]),
          line: lineNumber
        });
        return;
      }

      circuit.diagnostics.push(error(lineNumber, `Could not parse: ${line}`));
    });

    if (activeDefinition) {
      circuit.diagnostics.push(error(activeDefinition.line, `Definition "${activeDefinition.name}" is missing its closing brace.`));
    }
    if (activeGroup) {
      circuit.diagnostics.push(error(activeGroup.line, `Group "${activeGroup.name}" is missing its closing brace.`));
    }

    return circuit;
  }

  function error(line, message) {
    return { severity: "error", line, message };
  }

  function warning(line, message) {
    return { severity: "warning", line, message };
  }

  const LINE_EQUIPMENT_ALIASES = {
    grid: "source",
    utility: "source",
    supply: "source",
    disconnect: "isolator",
    mcb: "breaker",
    mccb: "breaker",
    rcbo: "rcd",
    rccb: "rcd",
    psu: "power_supply",
    smps: "power_supply",
    busbar: "bus",
    ground: "earth",
    control_relay: "relay",
    auxiliary_relay: "relay",
    trip_relay: "relay",
    protective_relay: "protection_relay"
  };
  const LINE_EQUIPMENT_TYPES = new Set([
    "source", "isolator", "fuse", "breaker", "rcd", "spd", "contactor",
    "overload", "transformer", "power_supply", "bus", "terminal", "motor",
    "load", "earth", "meter", "relay", "protection_relay"
  ]);

  function normalizeLineEquipmentType(type) {
    const normalized = String(type || "").trim().toLowerCase().replace(/-/g, "_");
    return LINE_EQUIPMENT_ALIASES[normalized] || normalized;
  }

  function unquoteValue(value) {
    const text = String(value || "").trim();
    if (text.length >= 2 && ((text[0] === '"' && text.at(-1) === '"') || (text[0] === "'" && text.at(-1) === "'"))) {
      return text.slice(1, -1);
    }
    return text;
  }

  function parseLineDiagram(source, options = {}) {
    const startLine = options.startLine || 1;
    const diagram = {
      kind: "line",
      title: "Electrical line diagram",
      layout: null,
      equipment: [],
      connections: [],
      controlLinks: [],
      equipmentByRef: new Map(),
      diagnostics: []
    };
    const seenConnections = new Set();
    const seenControlLinks = new Set();

    source.split(/\r\n|\r|\n/).forEach((rawLine, index) => {
      const lineNumber = startLine + index;
      const line = stripComment(rawLine);
      if (!line) return;

      const titleMatch = line.match(/^title\s+(.+)$/i);
      if (titleMatch) {
        diagram.title = unquoteValue(titleMatch[1]);
        return;
      }

      const layoutMatch = line.match(/^layout\b(.*)$/i);
      if (layoutMatch) {
        if (diagram.layout) {
          diagram.diagnostics.push(error(lineNumber, "Only one layout declaration is allowed per line diagram."));
          return;
        }
        diagram.layout = { attrs: parseAttributes(layoutMatch[1]), line: lineNumber };
        return;
      }

      const controlLinkMatch = line.match(/^([A-Za-z_][\w.-]*)\s*--(control|feedback)-->\s*([A-Za-z_][\w.-]*)(.*)$/i);
      if (controlLinkMatch) {
        const from = controlLinkMatch[1];
        const kind = controlLinkMatch[2].toLowerCase();
        const to = controlLinkMatch[3];
        const attrs = parseAttributes(controlLinkMatch[4]);
        const key = `${kind}:${from}->${to}`;
        if (seenControlLinks.has(key)) {
          diagram.diagnostics.push(warning(lineNumber, `Duplicate ${kind} link "${from}->${to}".`));
        }
        seenControlLinks.add(key);
        diagram.controlLinks.push({ from, to, kind, attrs, line: lineNumber });
        return;
      }

      const connectionMatch = line.match(/^([A-Za-z_][\w.-]*)\s*-->\s*([A-Za-z_][\w.-]*)(.*)$/);
      if (connectionMatch) {
        const from = connectionMatch[1];
        const to = connectionMatch[2];
        const attrs = parseAttributes(connectionMatch[3]);
        const key = `${from}->${to}`;
        if (seenConnections.has(key)) {
          diagram.diagnostics.push(warning(lineNumber, `Duplicate feeder "${key}".`));
        }
        seenConnections.add(key);
        diagram.connections.push({ from, to, attrs, line: lineNumber });
        return;
      }

      const equipmentMatch = line.match(/^([A-Za-z_][\w.-]*)\s*:\s*([^\s]+)(.*)$/);
      if (equipmentMatch) {
        const ref = equipmentMatch[1];
        const rawType = equipmentMatch[2];
        const type = normalizeLineEquipmentType(rawType);
        const attrs = parseAttributes(equipmentMatch[3]);
        if (diagram.equipmentByRef.has(ref)) {
          diagram.diagnostics.push(error(lineNumber, `Duplicate equipment reference "${ref}".`));
          return;
        }
        if (!LINE_EQUIPMENT_TYPES.has(type)) {
          diagram.diagnostics.push(warning(lineNumber, `Unknown line equipment type "${rawType}"; a generic symbol will be rendered.`));
        }
        if (attrs.color && !isColor(attrs.color)) {
          diagram.diagnostics.push(error(lineNumber, `Equipment "${ref}" has invalid color "${attrs.color}".`));
        }
        const equipment = { ref, type, rawType, attrs, line: lineNumber, index: diagram.equipment.length };
        diagram.equipment.push(equipment);
        diagram.equipmentByRef.set(ref, equipment);
        return;
      }

      diagram.diagnostics.push(error(lineNumber, `Could not parse line-diagram statement: ${line}`));
    });

    validateLineDiagram(diagram);
    return diagram;
  }

  function validateLineDiagram(diagram) {
    const diagnostics = diagram.diagnostics;
    const direction = normalizeLayoutDirection(diagram.layout?.attrs.direction, "TB");
    if (!direction) diagnostics.push(error(diagram.layout?.line || 1, "Line layout direction must be LR or TB."));
    for (const attribute of ["gap", "rankgap"]) {
      if (!validPositiveNumber(diagram.layout?.attrs[attribute])) {
        diagnostics.push(error(diagram.layout.line, `Line layout ${attribute} must be a positive number.`));
      }
    }

    const indegree = new Map(diagram.equipment.map((item) => [item.ref, 0]));
    const adjacency = new Map(diagram.equipment.map((item) => [item.ref, []]));
    const connected = new Set();
    for (const connection of diagram.connections) {
      const from = diagram.equipmentByRef.get(connection.from);
      const to = diagram.equipmentByRef.get(connection.to);
      if (!from) diagnostics.push(error(connection.line, `Feeder references unknown equipment "${connection.from}".`));
      if (!to) diagnostics.push(error(connection.line, `Feeder references unknown equipment "${connection.to}".`));
      if (!from || !to) continue;
      if (from.ref === to.ref) {
        diagnostics.push(error(connection.line, `Equipment "${from.ref}" cannot feed itself.`));
        continue;
      }
      if (connection.attrs.color && !isColor(connection.attrs.color)) {
        diagnostics.push(error(connection.line, `Feeder "${from.ref}->${to.ref}" has invalid color "${connection.attrs.color}".`));
      }
      adjacency.get(from.ref).push(to.ref);
      indegree.set(to.ref, indegree.get(to.ref) + 1);
      connected.add(from.ref);
      connected.add(to.ref);
    }

    for (const link of diagram.controlLinks) {
      const from = diagram.equipmentByRef.get(link.from);
      const to = diagram.equipmentByRef.get(link.to);
      if (!from) diagnostics.push(error(link.line, `${link.kind === "feedback" ? "Feedback" : "Control"} link references unknown equipment "${link.from}".`));
      if (!to) diagnostics.push(error(link.line, `${link.kind === "feedback" ? "Feedback" : "Control"} link references unknown equipment "${link.to}".`));
      if (link.attrs.color && !isColor(link.attrs.color)) {
        diagnostics.push(error(link.line, `${link.kind === "feedback" ? "Feedback" : "Control"} link "${link.from}->${link.to}" has invalid color "${link.attrs.color}".`));
      }
      if (!from || !to) continue;
      if (from.ref === to.ref) {
        diagnostics.push(error(link.line, `Equipment "${from.ref}" cannot ${link.kind} itself.`));
        continue;
      }
      connected.add(from.ref);
      connected.add(to.ref);
    }

    for (const equipment of diagram.equipment) {
      if (!connected.has(equipment.ref)) {
        diagnostics.push(warning(equipment.line, `Equipment "${equipment.ref}" is not connected.`));
      }
      if (equipment.type === "source" && indegree.get(equipment.ref) > 0) {
        diagnostics.push(warning(equipment.line, `Source "${equipment.ref}" normally starts a line diagram and should not have an incoming feeder.`));
      }
    }

    const queue = diagram.equipment.filter((item) => indegree.get(item.ref) === 0).map((item) => item.ref);
    const remaining = new Map(indegree);
    let visited = 0;
    while (queue.length) {
      const ref = queue.shift();
      visited += 1;
      for (const next of adjacency.get(ref) || []) {
        remaining.set(next, remaining.get(next) - 1);
        if (remaining.get(next) === 0) queue.push(next);
      }
    }
    if (visited < diagram.equipment.length) {
      diagnostics.push(error(diagram.connections[0]?.line || 1, "Electrical line diagrams must not contain feeder cycles."));
    }
    return diagnostics;
  }

  const WIRING_DEVICE_ALIASES = {
    terminals: "terminal_strip",
    terminal_block: "terminal_strip",
    breaker: "breaker_3p",
    mcb_3p: "breaker_3p",
    mccb_3p: "breaker_3p",
    contactor_3p: "contactor",
    ol: "overload",
    pushbutton: "pushbutton_no",
    stop_button: "pushbutton_nc",
    start_button: "pushbutton_no",
    protective_relay: "protection_relay",
    pilot_lamp: "lamp"
  };
  const WIRING_DEVICE_TYPES = new Set([
    "terminal_strip", "breaker_3p", "contactor", "overload", "relay",
    "protection_relay", "pushbutton_no", "pushbutton_nc", "selector",
    "fuse", "power_supply", "motor", "lamp", "load", "earth"
  ]);
  const WIRING_COLOR_CODES = {
    BK: "#1f2937",
    BN: "#92400e",
    RD: "#dc2626",
    OG: "#ea580c",
    YE: "#ca8a04",
    GN: "#15803d",
    BU: "#2563eb",
    VT: "#7c3aed",
    GY: "#64748b",
    WH: "#cbd5e1",
    PK: "#db2777",
    TQ: "#0891b2",
    GNYE: "#16a34a"
  };

  function normalizeWiringDeviceType(type) {
    const normalized = String(type || "").trim().toLowerCase().replace(/-/g, "_");
    return WIRING_DEVICE_ALIASES[normalized] || normalized;
  }

  function wiringTerminal(id, label, side) {
    return { id: String(id), label: String(label || id), side };
  }

  function defaultWiringTerminals(type) {
    const maps = {
      terminal_strip: [wiringTerminal("1", "1", "left"), wiringTerminal("2", "2", "right")],
      breaker_3p: [
        wiringTerminal("1", "1/L1", "left"), wiringTerminal("3", "3/L2", "left"), wiringTerminal("5", "5/L3", "left"),
        wiringTerminal("2", "2/T1", "right"), wiringTerminal("4", "4/T2", "right"), wiringTerminal("6", "6/T3", "right")
      ],
      contactor: [
        wiringTerminal("L1", "L1", "left"), wiringTerminal("L2", "L2", "left"), wiringTerminal("L3", "L3", "left"),
        wiringTerminal("T1", "T1", "right"), wiringTerminal("T2", "T2", "right"), wiringTerminal("T3", "T3", "right"),
        wiringTerminal("A1", "A1", "top"), wiringTerminal("13", "13", "top"),
        wiringTerminal("A2", "A2", "bottom"), wiringTerminal("14", "14", "bottom")
      ],
      overload: [
        wiringTerminal("1", "1/L1", "left"), wiringTerminal("3", "3/L2", "left"), wiringTerminal("5", "5/L3", "left"),
        wiringTerminal("2", "2/T1", "right"), wiringTerminal("4", "4/T2", "right"), wiringTerminal("6", "6/T3", "right"),
        wiringTerminal("95", "95", "bottom"), wiringTerminal("96", "96", "bottom")
      ],
      relay: [
        wiringTerminal("A1", "A1", "left"), wiringTerminal("A2", "A2", "right"),
        wiringTerminal("11", "11", "top"), wiringTerminal("12", "12", "bottom"), wiringTerminal("14", "14", "bottom")
      ],
      protection_relay: [
        wiringTerminal("95", "95", "left"), wiringTerminal("96", "96", "right"),
        wiringTerminal("A1", "A1", "top"), wiringTerminal("A2", "A2", "bottom")
      ],
      pushbutton_no: [wiringTerminal("1", "1", "left"), wiringTerminal("2", "2", "right")],
      pushbutton_nc: [wiringTerminal("1", "1", "left"), wiringTerminal("2", "2", "right")],
      selector: [wiringTerminal("1", "1", "left"), wiringTerminal("2", "2", "right")],
      fuse: [wiringTerminal("1", "1", "left"), wiringTerminal("2", "2", "right")],
      power_supply: [
        wiringTerminal("L", "L", "left"), wiringTerminal("N", "N", "left"), wiringTerminal("PE", "PE", "bottom"),
        wiringTerminal("P", "+", "right"), wiringTerminal("M", "0V", "right")
      ],
      motor: [
        wiringTerminal("U", "U", "left"), wiringTerminal("V", "V", "left"), wiringTerminal("W", "W", "left"),
        wiringTerminal("PE", "PE", "bottom")
      ],
      lamp: [wiringTerminal("1", "1", "left"), wiringTerminal("2", "2", "right")],
      load: [wiringTerminal("L", "L", "left"), wiringTerminal("N", "N", "right")],
      earth: [wiringTerminal("PE", "PE", "left")]
    };
    return (maps[type] || [wiringTerminal("1", "1", "left"), wiringTerminal("2", "2", "right")])
      .map((terminal) => ({ ...terminal }));
  }

  function parseWiringTerminals(value, device, diagnostics) {
    if (!value) return defaultWiringTerminals(device.type);
    const terminals = [];
    const seen = new Set();
    for (const rawEntry of String(value).split(",")) {
      const entry = rawEntry.trim();
      if (!entry) continue;
      const match = entry.match(/^([^:@\s]+)(?::([^@]+))?@(left|right|top|bottom)$/i);
      if (!match) {
        diagnostics.push(error(device.line, `Device "${device.ref}" has invalid terminal "${entry}"; use id:label@side.`));
        continue;
      }
      const id = match[1];
      const key = id.toLowerCase();
      if (seen.has(key)) {
        diagnostics.push(error(device.line, `Device "${device.ref}" has duplicate terminal "${id}".`));
        continue;
      }
      seen.add(key);
      terminals.push(wiringTerminal(id, (match[2] || id).trim(), match[3].toLowerCase()));
    }
    if (!terminals.length) diagnostics.push(error(device.line, `Device "${device.ref}" must define at least one terminal.`));
    return terminals;
  }

  function parseWiringEndpoint(ref, terminal) {
    return { ref, terminal, raw: `${ref}.${terminal}` };
  }

  function wiringWireNumber(wire) {
    return wire.attrs.wire || wire.attrs.number || "";
  }

  function isWiringColor(value) {
    const normalized = String(value || "").toUpperCase();
    return Boolean(WIRING_COLOR_CODES[normalized]) || isColor(value);
  }

  function parseWiringDiagram(source, options = {}) {
    const startLine = options.startLine || 1;
    const diagram = {
      kind: "wiring",
      title: "Panel wiring diagram",
      layout: null,
      devices: [],
      wires: [],
      deviceByRef: new Map(),
      diagnostics: []
    };
    const seenWires = new Set();

    source.split(/\r\n|\r|\n/).forEach((rawLine, index) => {
      const lineNumber = startLine + index;
      const line = stripComment(rawLine);
      if (!line) return;

      const titleMatch = line.match(/^title\s+(.+)$/i);
      if (titleMatch) {
        diagram.title = unquoteValue(titleMatch[1]);
        return;
      }

      const layoutMatch = line.match(/^layout\b(.*)$/i);
      if (layoutMatch) {
        if (diagram.layout) {
          diagram.diagnostics.push(error(lineNumber, "Only one layout declaration is allowed per wiring diagram."));
          return;
        }
        diagram.layout = { attrs: parseAttributes(layoutMatch[1]), line: lineNumber };
        return;
      }

      const wireMatch = line.match(/^([A-Za-z_][\w-]*)\.([^\s]+)\s*-->\s*([A-Za-z_][\w-]*)\.([^\s]+)(.*)$/);
      if (wireMatch) {
        const from = parseWiringEndpoint(wireMatch[1], wireMatch[2]);
        const to = parseWiringEndpoint(wireMatch[3], wireMatch[4]);
        const attrs = parseAttributes(wireMatch[5]);
        const key = [from.raw.toLowerCase(), to.raw.toLowerCase()].sort().join("<->");
        if (seenWires.has(key)) diagram.diagnostics.push(warning(lineNumber, `Duplicate physical connection "${key}".`));
        seenWires.add(key);
        diagram.wires.push({ from, to, attrs, line: lineNumber, index: diagram.wires.length });
        return;
      }

      const deviceMatch = line.match(/^([A-Za-z_][\w-]*)\s*:\s*([^\s]+)(.*)$/);
      if (deviceMatch) {
        const ref = deviceMatch[1];
        const rawType = deviceMatch[2];
        const type = normalizeWiringDeviceType(rawType);
        const attrs = parseAttributes(deviceMatch[3]);
        if (diagram.deviceByRef.has(ref)) {
          diagram.diagnostics.push(error(lineNumber, `Duplicate wiring device reference "${ref}".`));
          return;
        }
        if (!WIRING_DEVICE_TYPES.has(type)) {
          diagram.diagnostics.push(warning(lineNumber, `Unknown wiring device type "${rawType}"; a generic enclosure will be rendered.`));
        }
        const device = { ref, type, rawType, attrs, line: lineNumber, index: diagram.devices.length };
        device.terminals = parseWiringTerminals(attrs.terminals, device, diagram.diagnostics);
        device.terminalById = new Map(device.terminals.map((terminal) => [terminal.id.toLowerCase(), terminal]));
        diagram.devices.push(device);
        diagram.deviceByRef.set(ref, device);
        return;
      }

      diagram.diagnostics.push(error(lineNumber, `Could not parse panel-wiring statement: ${line}`));
    });

    validateWiringDiagram(diagram);
    return diagram;
  }

  function validateWiringDiagram(diagram) {
    const diagnostics = diagram.diagnostics;
    const direction = normalizeLayoutDirection(diagram.layout?.attrs.direction, "LR");
    if (!direction) diagnostics.push(error(diagram.layout?.line || 1, "Wiring layout direction must be LR or TB."));
    for (const attribute of ["gap", "rowgap"]) {
      if (!validPositiveNumber(diagram.layout?.attrs[attribute])) {
        diagnostics.push(error(diagram.layout.line, `Wiring layout ${attribute} must be a positive number.`));
      }
    }
    if (diagram.layout?.attrs.wrap !== undefined) {
      const wrap = Number(diagram.layout.attrs.wrap);
      if (!Number.isInteger(wrap) || wrap <= 0) diagnostics.push(error(diagram.layout.line, "Wiring layout wrap must be a positive integer."));
    }

    const connected = new Set();
    for (const wire of diagram.wires) {
      const fromDevice = diagram.deviceByRef.get(wire.from.ref);
      const toDevice = diagram.deviceByRef.get(wire.to.ref);
      if (!fromDevice) diagnostics.push(error(wire.line, `Wire references unknown device "${wire.from.ref}".`));
      if (!toDevice) diagnostics.push(error(wire.line, `Wire references unknown device "${wire.to.ref}".`));
      const fromTerminal = fromDevice?.terminalById.get(wire.from.terminal.toLowerCase());
      const toTerminal = toDevice?.terminalById.get(wire.to.terminal.toLowerCase());
      if (fromDevice && !fromTerminal) diagnostics.push(error(wire.line, `Device "${fromDevice.ref}" has no terminal "${wire.from.terminal}".`));
      if (toDevice && !toTerminal) diagnostics.push(error(wire.line, `Device "${toDevice.ref}" has no terminal "${wire.to.terminal}".`));
      if (wire.from.raw.toLowerCase() === wire.to.raw.toLowerCase()) diagnostics.push(error(wire.line, `Wire cannot connect terminal "${wire.from.raw}" to itself.`));
      if (!wiringWireNumber(wire)) diagnostics.push(warning(wire.line, `Physical wire "${wire.from.raw}->${wire.to.raw}" has no wire number.`));
      if (wire.attrs.color && !isWiringColor(wire.attrs.color)) diagnostics.push(error(wire.line, `Wire "${wiringWireNumber(wire) || wire.index + 1}" has invalid color "${wire.attrs.color}".`));
      if (wire.attrs.size && !/^\d+(?:\.\d+)?(?:mm2|awg\d*)$/i.test(wire.attrs.size)) {
        diagnostics.push(error(wire.line, `Wire "${wiringWireNumber(wire) || wire.index + 1}" has invalid size "${wire.attrs.size}"; use values such as 0.75mm2 or AWG18.`));
      }
      if (fromDevice && toDevice && fromTerminal && toTerminal) {
        connected.add(fromDevice.ref);
        connected.add(toDevice.ref);
      }
    }
    for (const device of diagram.devices) {
      if (!connected.has(device.ref)) diagnostics.push(warning(device.line, `Wiring device "${device.ref}" is not connected.`));
    }
    return diagnostics;
  }

  const WAVEFORM_TYPE_ALIASES = {
    pwm: "square",
    clock: "square",
    ramp: "sawtooth",
    saw: "sawtooth",
    constant: "dc",
    exp: "exponential",
    charge: "exponential"
  };
  const WAVEFORM_TYPES = new Set([
    "sine", "square", "triangle", "sawtooth", "pulse", "dc", "step", "exponential"
  ]);
  const DEFAULT_WAVEFORM_COLORS = [
    "#2563eb", "#dc2626", "#7c3aed", "#0f766e", "#d97706", "#16a34a", "#db2777", "#475569"
  ];

  function normalizeWaveformType(value) {
    const normalized = String(value || "").trim().toLowerCase().replace(/[_\s-]+/g, "");
    return WAVEFORM_TYPE_ALIASES[normalized] || normalized;
  }

  function waveformNumber(attrs, key, fallback) {
    const value = attrs?.[key];
    if (value === undefined || value === null || value === "") return fallback;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  function parseWaveformDiagram(source, options = {}) {
    const startLine = options.startLine || 1;
    const diagram = {
      kind: "waveform",
      title: "Educational waveforms",
      time: { start: 0, end: 10, unit: "ms", divisions: 10, line: startLine },
      signals: [],
      markers: [],
      diagnostics: []
    };
    const seenSignals = new Set();
    const seenMarkers = new Set();
    let hasTime = false;

    source.split(/\r\n|\r|\n/).forEach((rawLine, index) => {
      const lineNumber = startLine + index;
      const line = stripComment(rawLine);
      if (!line) return;

      const titleMatch = line.match(/^title\s+(.+)$/i);
      if (titleMatch) {
        diagram.title = unquoteValue(titleMatch[1]);
        return;
      }

      const timeMatch = line.match(/^time\b(.*)$/i);
      if (timeMatch) {
        if (hasTime) {
          diagram.diagnostics.push(error(lineNumber, "Only one time declaration is allowed per waveform block."));
          return;
        }
        hasTime = true;
        const attrs = parseAttributes(timeMatch[1]);
        diagram.time = {
          start: waveformNumber(attrs, "start", 0),
          end: waveformNumber(attrs, "end", 10),
          unit: attrs.unit || "ms",
          divisions: waveformNumber(attrs, "divisions", 10),
          line: lineNumber
        };
        return;
      }

      const markerMatch = line.match(/^marker\s+([A-Za-z_][\w-]*)\b(.*)$/i);
      if (markerMatch) {
        const id = markerMatch[1];
        const attrs = parseAttributes(markerMatch[2]);
        if (seenMarkers.has(id.toLowerCase())) {
          diagram.diagnostics.push(error(lineNumber, `Duplicate waveform marker "${id}".`));
          return;
        }
        seenMarkers.add(id.toLowerCase());
        diagram.markers.push({ id, attrs, line: lineNumber, index: diagram.markers.length });
        return;
      }

      const signalMatch = line.match(/^([A-Za-z_][\w-]*)\s*:\s*([^\s]+)(.*)$/);
      if (signalMatch) {
        const ref = signalMatch[1];
        const type = normalizeWaveformType(signalMatch[2]);
        const attrs = parseAttributes(signalMatch[3]);
        if (seenSignals.has(ref.toLowerCase())) {
          diagram.diagnostics.push(error(lineNumber, `Duplicate waveform signal "${ref}".`));
          return;
        }
        seenSignals.add(ref.toLowerCase());
        diagram.signals.push({ ref, type, rawType: signalMatch[2], attrs, line: lineNumber, index: diagram.signals.length });
        return;
      }

      diagram.diagnostics.push(error(lineNumber, `Could not parse waveform statement: ${line}`));
    });

    validateWaveformDiagram(diagram);
    return diagram;
  }

  function validateWaveformDiagram(diagram) {
    const diagnostics = diagram.diagnostics;
    const time = diagram.time;
    if (!Number.isFinite(time.start) || !Number.isFinite(time.end) || time.end <= time.start) {
      diagnostics.push(error(time.line, "Waveform time end must be greater than start."));
    }
    if (!Number.isInteger(time.divisions) || time.divisions < 2 || time.divisions > 20) {
      diagnostics.push(error(time.line, "Waveform time divisions must be an integer from 2 to 20."));
    }
    if (!diagram.signals.length) diagnostics.push(warning(time.line, "Waveform block has no signals."));

    const numericAttributes = ["amplitude", "offset", "phase", "cycles", "low", "high", "min", "max", "value", "at", "width", "from", "to", "tau", "delay"];
    for (const signal of diagram.signals) {
      if (!WAVEFORM_TYPES.has(signal.type)) {
        diagnostics.push(error(signal.line, `Unknown waveform type "${signal.rawType}".`));
        continue;
      }
      for (const key of numericAttributes) {
        if (signal.attrs[key] !== undefined && !Number.isFinite(Number(signal.attrs[key]))) {
          diagnostics.push(error(signal.line, `Signal "${signal.ref}" has invalid ${key} value "${signal.attrs[key]}".`));
        }
      }
      if (signal.attrs.color && !isColor(signal.attrs.color)) {
        diagnostics.push(error(signal.line, `Signal "${signal.ref}" has invalid color "${signal.attrs.color}".`));
      }
      const cycles = waveformNumber(signal.attrs, "cycles", 1);
      if (cycles <= 0) diagnostics.push(error(signal.line, `Signal "${signal.ref}" cycles must be positive.`));
      const duty = waveformNumber(signal.attrs, "duty", 50);
      if (["square", "pulse"].includes(signal.type) && (duty <= 0 || duty >= 100)) {
        diagnostics.push(error(signal.line, `Signal "${signal.ref}" duty must be between 0 and 100.`));
      }
      if (signal.type === "pulse" && signal.attrs.width !== undefined && waveformNumber(signal.attrs, "width", 0) <= 0) {
        diagnostics.push(error(signal.line, `Pulse "${signal.ref}" width must be positive.`));
      }
      if (signal.type === "exponential" && waveformNumber(signal.attrs, "tau", 0) <= 0) {
        diagnostics.push(error(signal.line, `Exponential signal "${signal.ref}" requires a positive tau.`));
      }
      const low = waveformNumber(signal.attrs, "low", waveformNumber(signal.attrs, "min", 0));
      const high = waveformNumber(signal.attrs, "high", waveformNumber(signal.attrs, "max", 1));
      if (["square", "triangle", "sawtooth", "pulse", "step"].includes(signal.type) && high === low) {
        diagnostics.push(warning(signal.line, `Signal "${signal.ref}" has equal high and low values.`));
      }
    }

    for (const marker of diagram.markers) {
      const at = Number(marker.attrs.at);
      if (!Number.isFinite(at)) {
        diagnostics.push(error(marker.line, `Marker "${marker.id}" requires a numeric at value.`));
      } else if (at < time.start || at > time.end) {
        diagnostics.push(warning(marker.line, `Marker "${marker.id}" is outside the displayed time range.`));
      }
      if (marker.attrs.color && !isColor(marker.attrs.color)) {
        diagnostics.push(error(marker.line, `Marker "${marker.id}" has invalid color "${marker.attrs.color}".`));
      }
    }
    return diagnostics;
  }

  function resolveType(type, aliases) {
    const alias = aliases.get(type);
    return alias ? alias.target : type;
  }

  function normalizePinKey(value) {
    return String(value || "").trim().toLowerCase();
  }

  function buildPinLookup(symbol) {
    const lookup = new Map();
    for (const pin of symbol?.pins || []) {
      for (const key of [pin.number, pin.name]) {
        const normalized = normalizePinKey(key);
        if (normalized && !lookup.has(normalized)) lookup.set(normalized, pin);
      }
    }
    return lookup;
  }

  function spreadPosition(index, count, span) {
    return -span / 2 + ((index + 1) * span) / (count + 1);
  }

  function buildDefinedSymbol(definition, textCounterRotation = 0) {
    const pinsBySide = { left: [], right: [], top: [], bottom: [] };
    for (const pin of definition.pins) pinsBySide[pin.side].push(pin);

    const label = definition.attrs.label || definition.name;
    const verticalCount = Math.max(pinsBySide.left.length, pinsBySide.right.length, 1);
    const horizontalCount = Math.max(pinsBySide.top.length, pinsBySide.bottom.length, 1);
    const longestLeftName = Math.max(0, ...pinsBySide.left.map((pin) => pin.name.length));
    const longestRightName = Math.max(0, ...pinsBySide.right.map((pin) => pin.name.length));
    const bodyWidth = Math.max(
      18,
      horizontalCount * 4 + 5,
      label.length * 0.92 + 8,
      (longestLeftName + longestRightName) * 0.58 + 10
    );
    const bodyHeight = Math.max(13, verticalCount * 3 + 4);
    const halfWidth = bodyWidth / 2;
    const halfHeight = bodyHeight / 2;
    const pinLength = 3;
    const textTransform = (x, y, baseRotation = null) => {
      const rotations = [];
      if (textCounterRotation) rotations.push(`rotate(${-textCounterRotation} ${x} ${y})`);
      if (baseRotation !== null) rotations.push(`rotate(${baseRotation} ${x} ${y})`);
      return rotations.length ? ` transform="${rotations.join(" ")}"` : "";
    };
    const svg = [
      `<rect x="${-halfWidth}" y="${-halfHeight}" width="${bodyWidth}" height="${bodyHeight}" rx="0.7" fill="#ffffff" stroke="currentColor" stroke-width="0.22"></rect>`,
      `<text x="0" y="0" font-size="1.55" font-weight="600" text-anchor="middle" dominant-baseline="middle" fill="currentColor"${textTransform(0, 0)}>${escapeHtml(label)}</text>`
    ];
    const pins = [];

    for (const side of ["left", "right", "top", "bottom"]) {
      const sidePins = pinsBySide[side];
      sidePins.forEach((pin, index) => {
        let anchor;
        let edge;
        let nameX;
        let nameY;
        let numberX;
        let numberY;
        let nameAnchor = "middle";
        let numberAnchor = "middle";
        let nameRotation = null;

        if (side === "left" || side === "right") {
          const y = spreadPosition(index, sidePins.length, bodyHeight - 2.5);
          const direction = side === "left" ? -1 : 1;
          edge = { x: direction * halfWidth, y };
          anchor = { x: direction * (halfWidth + pinLength), y };
          nameX = edge.x - direction * 0.7;
          nameY = y;
          numberX = anchor.x + direction * 0.45;
          numberY = y - 0.55;
          nameAnchor = side === "left" ? "start" : "end";
          numberAnchor = side === "left" ? "end" : "start";
        } else {
          const x = spreadPosition(index, sidePins.length, bodyWidth - 3);
          const direction = side === "top" ? -1 : 1;
          edge = { x, y: direction * halfHeight };
          anchor = { x, y: direction * (halfHeight + pinLength) };
          nameX = x;
          nameY = edge.y - direction * 0.65;
          numberX = x + 0.55;
          numberY = anchor.y + direction * 0.4;
          nameAnchor = side === "top" ? "start" : "end";
          nameRotation = side === "top" ? 90 : -90;
        }

        pins.push({
          name: pin.name,
          number: pin.number,
          electricalType: "unspecified",
          graphicStyle: "line",
          side,
          x: anchor.x,
          y: anchor.y
        });
        svg.push(`<line x1="${anchor.x}" y1="${anchor.y}" x2="${edge.x}" y2="${edge.y}" stroke="currentColor" stroke-width="0.22" stroke-linecap="round"></line>`);
        svg.push(`<text x="${nameX}" y="${nameY}" font-size="0.95" text-anchor="${nameAnchor}" dominant-baseline="middle" fill="currentColor"${textTransform(nameX, nameY, nameRotation)}>${escapeHtml(pin.name)}</text>`);
        svg.push(`<text x="${numberX}" y="${numberY}" font-size="0.85" text-anchor="${numberAnchor}" fill="currentColor"${textTransform(numberX, numberY)}>${escapeHtml(pin.number)}</text>`);
      });
    }

    const padding = pinLength + 2.2;
    return {
      id: definition.name,
      library: "defined",
      name: definition.name,
      properties: {
        Reference: definition.attrs.annotation || "U",
        Value: label
      },
      viewBox: [
        -halfWidth - padding,
        -halfHeight - padding,
        bodyWidth + padding * 2,
        bodyHeight + padding * 2
      ],
      pins,
      svg: svg.join("")
    };
  }

  function normalizeRotation(value) {
    if (value === undefined || value === null || value === "") return 0;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    const normalized = ((numeric % 360) + 360) % 360;
    return [0, 90, 180, 270].includes(normalized) ? normalized : null;
  }

  function normalizeLayoutDirection(value, fallback = null) {
    if (value === undefined || value === null || value === "") return fallback;
    const normalized = String(value).trim().toUpperCase().replace(/[_\s-]+/g, "");
    if (["LR", "LEFTRIGHT", "HORIZONTAL"].includes(normalized)) return "LR";
    if (["TB", "TOPBOTTOM", "VERTICAL"].includes(normalized)) return "TB";
    return null;
  }

  function validPositiveNumber(value) {
    return value === undefined || value === null || value === ""
      || (Number.isFinite(Number(value)) && Number(value) > 0);
  }

  function rotateSide(side, rotation) {
    const sides = ["top", "right", "bottom", "left"];
    const index = sides.indexOf(side);
    if (index === -1) return side;
    return sides[(index + rotation / 90) % sides.length];
  }

  function rotatePoint(point, rotation) {
    const rotated = rotation === 90
      ? { ...point, x: -point.y, y: point.x }
      : rotation === 180
        ? { ...point, x: -point.x, y: -point.y }
        : rotation === 270
          ? { ...point, x: point.y, y: -point.x }
          : { ...point };
    if (point.side) rotated.side = rotateSide(point.side, rotation);
    return rotated;
  }

  function rotatedSymbolGeometry(symbol, rotation) {
    const viewBox = symbol?.viewBox || [-5, -5, 10, 10];
    const [minX, minY, width, height] = viewBox;
    const corners = [
      { x: minX, y: minY },
      { x: minX + width, y: minY },
      { x: minX, y: minY + height },
      { x: minX + width, y: minY + height }
    ].map((point) => rotatePoint(point, rotation));
    const rotatedMinX = Math.min(...corners.map((point) => point.x));
    const rotatedMinY = Math.min(...corners.map((point) => point.y));
    const rotatedMaxX = Math.max(...corners.map((point) => point.x));
    const rotatedMaxY = Math.max(...corners.map((point) => point.y));
    const pins = (symbol?.pins || []).map((pin) => rotatePoint(pin, rotation));
    return {
      viewBox: [rotatedMinX, rotatedMinY, rotatedMaxX - rotatedMinX, rotatedMaxY - rotatedMinY],
      pins
    };
  }

  function resolvedEndpointPin(component, endpoint) {
    if (!component?.symbol) return null;
    if (endpoint.pin) return component.pinLookup.get(normalizePinKey(endpoint.pin)) || null;
    return component.symbol.pins?.length === 1 ? component.symbol.pins[0] : null;
  }

  function componentPinKey(component, pin) {
    return `${component.ref}.${normalizePinKey(pin?.number || pin?.name)}`;
  }

  function validateCircuit(circuit) {
    if (circuit.validated) return circuit.diagnostics;
    const diagnostics = [...circuit.diagnostics];
    const byRef = new Map();
    const librariesToLoad = new Set();

    for (const component of circuit.components) {
      const symbolId = resolveType(component.type, circuit.aliases);
      const definition = circuit.definitions.get(symbolId) || null;
      const rotationValue = component.attrs.rotate ?? component.attrs.rotation;
      const rotation = normalizeRotation(rotationValue);
      component.symbolId = symbolId;
      component.definition = definition;
      component.rotation = rotation ?? 0;
      component.rotationExplicit = rotationValue !== undefined && rotationValue !== null && rotationValue !== "";
      component.symbol = definition
        ? (definition.symbol || (definition.symbol = buildDefinedSymbol(definition)))
        : (CATALOG.symbols?.[symbolId] || null);
      component.pinLookup = buildPinLookup(component.symbol);
      byRef.set(component.ref, component);

      if (rotation === null) {
        diagnostics.push(error(component.line, `Rotation must be 0, 90, 180, or 270 degrees for "${component.ref}".`));
      }
      const annotation = definition?.attrs.annotation;
      if (annotation && !component.ref.toUpperCase().startsWith(String(annotation).toUpperCase())) {
        diagnostics.push(warning(component.line, `Reference "${component.ref}" does not use annotation prefix "${annotation}" from "${definition.name}".`));
      }

      if (!component.symbol) {
        const { library } = splitSymbolId(symbolId);
        const loadedState = CATALOG.loadedLibraries?.[library];
        if (catalogKnowsSymbol(symbolId) && loadedState !== true && loadedState !== "failed") {
          librariesToLoad.add(library);
          diagnostics.push(warning(component.line, `Loading KiCad library "${library}" for symbol "${symbolId}".`));
        } else {
          diagnostics.push(warning(component.line, `Symbol "${symbolId}" was not found in the KiCad catalog. A placeholder will be rendered.`));
        }
      }
    }

    if (circuit.layout) {
      if (!normalizeLayoutDirection(circuit.layout.attrs.direction, "LR")) {
        diagnostics.push(error(circuit.layout.line, "Layout direction must be LR or TB."));
      }
      if (!validPositiveNumber(circuit.layout.attrs.gap)) {
        diagnostics.push(error(circuit.layout.line, "Layout gap must be a positive number."));
      }
      const wrap = circuit.layout.attrs.wrap;
      if (wrap !== undefined && (!Number.isInteger(Number(wrap)) || Number(wrap) < 1)) {
        diagnostics.push(error(circuit.layout.line, "Layout wrap must be a positive integer."));
      }
    }

    const groupedRefs = new Map();
    for (const group of circuit.groups) {
      if (!normalizeLayoutDirection(group.attrs.direction, "LR")) {
        diagnostics.push(error(group.line, `Group "${group.name}" direction must be LR or TB.`));
      }
      if (!validPositiveNumber(group.attrs.gap)) {
        diagnostics.push(error(group.line, `Group "${group.name}" gap must be a positive number.`));
      }
      if (group.attrs.color && !isColor(group.attrs.color)) {
        diagnostics.push(error(group.line, `Group "${group.name}" has invalid color "${group.attrs.color}".`));
      }
      for (const member of group.members) {
        const component = byRef.get(member.ref);
        if (!component) {
          diagnostics.push(error(member.line, `Group "${group.name}" references unknown component "${member.ref}".`));
          continue;
        }
        if (groupedRefs.has(member.ref)) {
          diagnostics.push(error(
            member.line,
            `Component "${member.ref}" is already in group "${groupedRefs.get(member.ref)}".`
          ));
          continue;
        }
        groupedRefs.set(member.ref, group.name);
        component.groupName = group.name;
      }
    }
    if (circuit.groups.length) {
      const ungrouped = circuit.components.filter((component) => !groupedRefs.has(component.ref));
      if (ungrouped.length) {
        diagnostics.push(warning(
          circuit.layout?.line || ungrouped[0].line,
          `Ungrouped components: ${ungrouped.map((component) => component.ref).join(", ")}.`
        ));
      }
    }

    const connectedPins = new Set();
    const noConnectPins = new Set();
    const validateEndpoint = (endpoint, line, purpose, targetSet) => {
      const component = byRef.get(endpoint.ref);
      if (!component) {
        diagnostics.push(error(line, `${purpose} references unknown component "${endpoint.ref}".`));
        return null;
      }
      if (!component.symbol) return null;
      const pin = resolvedEndpointPin(component, endpoint);
      if (!pin) {
        const detail = endpoint.pin
          ? `Symbol "${component.symbolId}" has no pin "${endpoint.pin}" for "${endpoint.ref}".`
          : `Component "${endpoint.ref}" requires a pin name or number.`;
        diagnostics.push(error(line, detail));
        return null;
      }
      const key = componentPinKey(component, pin);
      targetSet.add(key);
      return key;
    };

    for (const connection of circuit.connections) {
      for (const endpoint of [connection.from, connection.to]) {
        validateEndpoint(endpoint, connection.line, "Connection", connectedPins);
      }
    }
    for (const label of circuit.labels) {
      validateEndpoint(label.endpoint, label.line, `${label.scope === "global" ? "Global" : "Local"} label "${label.name}"`, connectedPins);
    }
    for (const marker of circuit.noConnects) {
      validateEndpoint(marker.endpoint, marker.line, "NC marker", noConnectPins);
    }

    for (const key of noConnectPins) {
      if (connectedPins.has(key)) {
        diagnostics.push(error(
          circuit.noConnects.find((marker) => {
            const component = byRef.get(marker.endpoint.ref);
            const pin = resolvedEndpointPin(component, marker.endpoint);
            return component && pin && componentPinKey(component, pin) === key;
          })?.line || 1,
          `Pin "${key}" is marked NC but is also connected.`
        ));
      }
    }

    const localLabels = new Map();
    for (const label of circuit.labels.filter((entry) => entry.scope === "local")) {
      if (!localLabels.has(label.name)) localLabels.set(label.name, []);
      localLabels.get(label.name).push(label);
    }
    for (const [name, occurrences] of localLabels) {
      if (occurrences.length < 2) {
        diagnostics.push(error(occurrences[0].line, `Local label "${name}" is open; it is used only once in this circuit block.`));
      }
    }

    for (const component of circuit.components) {
      if (!component.symbol) continue;
      const seenPins = new Set();
      for (const pin of component.symbol.pins || []) {
        const key = componentPinKey(component, pin);
        if (seenPins.has(key)) continue;
        seenPins.add(key);
        if (!connectedPins.has(key) && !noConnectPins.has(key)) {
          diagnostics.push(error(
            component.line,
            `Pin "${component.ref}.${pin.name || pin.number}" (${pin.number}) is not connected; wire it, label it, or mark it NC.`
          ));
        }
      }
    }

    circuit.componentByRef = byRef;
    circuit.librariesToLoad = librariesToLoad;
    circuit.diagnostics = diagnostics;
    circuit.validated = true;
    return diagnostics;
  }

  function validateGlobalLabels(circuits) {
    const labels = new Map();
    for (const circuit of circuits) {
      for (const label of circuit.labels.filter((entry) => entry.scope === "global")) {
        if (!labels.has(label.name)) labels.set(label.name, []);
        labels.get(label.name).push({ circuit, label });
      }
    }
    for (const [name, occurrences] of labels) {
      if (occurrences.length >= 2) continue;
      const { circuit, label } = occurrences[0];
      circuit.diagnostics.push(error(label.line, `Global label "${name}" is open; it is used only once in the document.`));
    }
  }

  function componentColor(component) {
    return component.attrs.color && isColor(component.attrs.color) ? component.attrs.color : "#172033";
  }

  function connectionColor(connection) {
    return connection.attrs.color && isColor(connection.attrs.color) ? connection.attrs.color : "#2563eb";
  }

  function preferredValue(component) {
    return component.attrs.value || component.attrs.label || component.definition?.attrs.label || component.ref;
  }

  function componentCaption(component) {
    if (String(component.attrs.caption || "").toLowerCase() === "none") return "";
    if (component.attrs.caption) return component.attrs.caption;
    if (isPowerComponent(component)) {
      return component.attrs.label || component.symbol?.properties?.Value || splitSymbolId(component.symbolId).name;
    }
    return `${component.ref} ${preferredValue(component)}`;
  }

  function estimateSymbolSize(component) {
    const symbol = component.symbol;
    const geometry = rotatedSymbolGeometry(symbol, component.rotation || 0);
    const viewBox = geometry.viewBox;
    const baseScale = isPowerComponent(component) ? 5 : 8;
    const maxWidth = 220;
    const maxHeight = 170;
    const scale = Math.min(baseScale, maxWidth / Math.max(1, viewBox[2]), maxHeight / Math.max(1, viewBox[3]));
    return {
      viewBox,
      scale,
      width: Math.max(1, viewBox[2]) * scale,
      height: Math.max(1, viewBox[3]) * scale,
      pinLookup: buildPinLookup({ pins: geometry.pins }),
      pins: geometry.pins,
      rotation: component.rotation || 0
    };
  }

  function isPowerComponent(component) {
    return String(component.symbolId || "").toLowerCase().startsWith("power:");
  }

  function isGroundComponent(component) {
    const identity = `${component.symbolId || ""} ${component.attrs.label || ""} ${component.ref}`.toLowerCase();
    return isPowerComponent(component) && identity.includes("gnd");
  }

  function inferPinSide(pin, viewBox) {
    if (pin?.side) return pin.side;
    if (!pin) return null;
    const [minX, minY, width, height] = viewBox;
    const distances = [
      ["left", Math.abs(pin.x - minX)],
      ["right", Math.abs(pin.x - (minX + width))],
      ["top", Math.abs(pin.y - minY)],
      ["bottom", Math.abs(pin.y - (minY + height))]
    ];
    distances.sort((a, b) => a[1] - b[1]);
    return distances[0][0];
  }

  function componentEndpointSide(component, endpoint, role) {
    if (!component?.render) return role === "out" ? "right" : "left";
    let pin = endpoint.pin
      ? component.render.pinLookup.get(normalizePinKey(endpoint.pin))
      : null;
    if (!pin && component.render.pins.length === 1) pin = component.render.pins[0];
    return inferPinSide(pin, component.render.viewBox) || (role === "out" ? "right" : "left");
  }

  function buildAdjacency(circuit) {
    const adjacency = new Map(circuit.components.map((component) => [component.ref, []]));
    for (const connection of circuit.connections) {
      if (!adjacency.has(connection.from.ref) || !adjacency.has(connection.to.ref)) continue;
      adjacency.get(connection.from.ref).push({
        ref: connection.to.ref,
        endpoint: connection.from,
        otherEndpoint: connection.to
      });
      adjacency.get(connection.to.ref).push({
        ref: connection.from.ref,
        endpoint: connection.to,
        otherEndpoint: connection.from
      });
    }
    return adjacency;
  }

  function finalizeLayoutBounds(components) {
    if (!components.length) return { width: 760, height: 420 };
    const margin = 38;
    const minX = Math.min(...components.map((component) => component.render.x));
    const minY = Math.min(...components.map((component) => component.render.y));
    const shiftX = minX < margin ? margin - minX : 0;
    const shiftY = minY < margin ? margin - minY : 0;
    for (const component of components) {
      component.render.x += shiftX;
      component.render.y += shiftY;
    }
    const width = Math.max(760, ...components.map((component) => component.render.x + component.render.width + margin));
    const height = Math.max(460, ...components.map((component) => component.render.y + component.render.height + 64));
    return { width, height };
  }

  function resolveComponentOverlaps(components, fixedRef, zones, padding = 18) {
    for (let pass = 0; pass < 80; pass += 1) {
      let moved = false;
      for (let i = 0; i < components.length; i += 1) {
        for (let j = i + 1; j < components.length; j += 1) {
          const a = components[i];
          const b = components[j];
          const overlapX = Math.min(a.render.x + a.render.width + padding, b.render.x + b.render.width + padding)
            - Math.max(a.render.x - padding, b.render.x - padding);
          const overlapY = Math.min(a.render.y + a.render.height + padding, b.render.y + b.render.height + padding)
            - Math.max(a.render.y - padding, b.render.y - padding);
          if (overlapX <= 0 || overlapY <= 0) continue;
          moved = true;
          const zoneA = zones?.get(a.ref);
          const zoneB = zones?.get(b.ref);
          const sameHorizontalZone = zoneA === zoneB && (zoneA === "left" || zoneA === "right");
          const sameVerticalZone = zoneA === zoneB && (zoneA === "top" || zoneA === "bottom");
          const axis = sameHorizontalZone ? "y" : sameVerticalZone ? "x" : overlapX < overlapY ? "x" : "y";
          const aCenter = axis === "x" ? a.render.x + a.render.width / 2 : a.render.y + a.render.height / 2;
          const bCenter = axis === "x" ? b.render.x + b.render.width / 2 : b.render.y + b.render.height / 2;
          const direction = aCenter <= bCenter ? -1 : 1;
          const amount = (axis === "x" ? overlapX : overlapY) + 2;
          let moveA = amount / 2;
          let moveB = amount / 2;
          if (a.ref === fixedRef || (!isPowerComponent(a) && isPowerComponent(b))) {
            moveA = 0;
            moveB = amount;
          } else if (b.ref === fixedRef || (isPowerComponent(a) && !isPowerComponent(b))) {
            moveA = amount;
            moveB = 0;
          }
          if (axis === "x") {
            a.render.x += direction * moveA;
            b.render.x -= direction * moveB;
          } else {
            a.render.y += direction * moveA;
            b.render.y -= direction * moveB;
          }
        }
      }
      if (!moved) break;
    }
  }

  function layoutLayeredCircuit(circuit) {
    const components = circuit.components;
    const levels = new Map(components.map((component) => [component.ref, 0]));
    for (let pass = 0; pass < components.length; pass += 1) {
      let changed = false;
      for (const connection of circuit.connections) {
        if (!levels.has(connection.from.ref) || !levels.has(connection.to.ref)) continue;
        const next = Math.min(6, levels.get(connection.from.ref) + 1);
        if (next > levels.get(connection.to.ref)) {
          levels.set(connection.to.ref, next);
          changed = true;
        }
      }
      if (!changed) break;
    }

    const columns = new Map();
    for (const component of components) {
      const level = levels.get(component.ref) || 0;
      component.render.level = level;
      if (!columns.has(level)) columns.set(level, []);
      columns.get(level).push(component);
    }
    const sortedLevels = [...columns.keys()].sort((a, b) => a - b);
    let x = 44;
    for (const level of sortedLevels) {
      const column = columns.get(level);
      const columnWidth = Math.max(...column.map((component) => component.render.width));
      let y = 54;
      for (const component of column) {
        component.render.x = x + (columnWidth - component.render.width) / 2;
        component.render.y = y;
        y += component.render.height + 72;
      }
      x += columnWidth + 130;
    }
    return finalizeLayoutBounds(components);
  }

  function layoutHubCircuit(circuit, hub, adjacency) {
    const componentByRef = circuit.componentByRef;
    const zones = new Map();
    const distances = new Map();
    const tracks = new Map();
    const roots = { left: [], right: [], top: [], bottom: [] };
    const rootMetric = new Map();

    for (const edge of adjacency.get(hub.ref) || []) {
      const neighbor = componentByRef.get(edge.ref);
      if (!neighbor || isPowerComponent(neighbor)) continue;
      const side = componentEndpointSide(hub, edge.endpoint, "out");
      const zone = ["left", "right", "top", "bottom"].includes(side) ? side : "left";
      if (!zones.has(neighbor.ref)) {
        zones.set(neighbor.ref, zone);
        distances.set(neighbor.ref, 1);
        roots[zone].push(neighbor.ref);
      }
      const pin = edge.endpoint.pin
        ? hub.render.pinLookup.get(normalizePinKey(edge.endpoint.pin))
        : null;
      const metric = zone === "left" || zone === "right" ? pin?.y ?? 0 : pin?.x ?? 0;
      rootMetric.set(neighbor.ref, Math.min(rootMetric.get(neighbor.ref) ?? metric, metric));
    }

    for (const zone of Object.keys(roots)) {
      roots[zone].sort((a, b) => (rootMetric.get(a) ?? 0) - (rootMetric.get(b) ?? 0));
      roots[zone].forEach((ref, index) => tracks.set(ref, index));
    }

    const queue = Object.values(roots).flat();
    for (let index = 0; index < queue.length; index += 1) {
      const ref = queue[index];
      for (const edge of adjacency.get(ref) || []) {
        const neighbor = componentByRef.get(edge.ref);
        if (!neighbor || neighbor.ref === hub.ref || isPowerComponent(neighbor) || zones.has(neighbor.ref)) continue;
        zones.set(neighbor.ref, zones.get(ref));
        distances.set(neighbor.ref, (distances.get(ref) || 1) + 1);
        tracks.set(neighbor.ref, tracks.get(ref) || 0);
        queue.push(neighbor.ref);
      }
    }

    for (const component of circuit.components) {
      if (component.ref === hub.ref || isPowerComponent(component) || zones.has(component.ref)) continue;
      const track = roots.right.length;
      roots.right.push(component.ref);
      zones.set(component.ref, "right");
      distances.set(component.ref, 1);
      tracks.set(component.ref, track);
    }

    const hubCenter = { x: 420, y: 310 };
    hub.render.x = hubCenter.x - hub.render.width / 2;
    hub.render.y = hubCenter.y - hub.render.height / 2;
    const densityScale = Math.min(2.2, 1 + Math.max(0, circuit.components.length - 12) * 0.075);
    const gapX = 190 * densityScale;
    const gapY = 175 * densityScale;
    const trackGap = 190 * densityScale;
    const occupied = new Map();

    for (const component of circuit.components) {
      if (component.ref === hub.ref || isPowerComponent(component)) continue;
      const zone = zones.get(component.ref);
      const distance = distances.get(component.ref) || 1;
      const track = tracks.get(component.ref) || 0;
      const trackCount = Math.max(1, roots[zone]?.length || 1);
      const key = `${zone}:${distance}:${track}`;
      const sibling = occupied.get(key) || 0;
      occupied.set(key, sibling + 1);

      let centerX = hubCenter.x;
      let centerY = hubCenter.y;
      if (zone === "left" || zone === "right") {
        centerX += (zone === "left" ? -1 : 1) * gapX * distance;
        centerY += (track - (trackCount - 1) / 2) * trackGap + sibling * 150;
      } else {
        centerY += (zone === "top" ? -1 : 1) * gapY * distance;
        centerX += (track - (trackCount - 1) / 2) * (trackGap + 25) + sibling * 150;
        if (trackCount === 1 && rootMetric.has(component.ref)) {
          centerX += rootMetric.get(component.ref) * hub.render.scale * 1.8;
        }
      }
      component.render.x = centerX - component.render.width / 2;
      component.render.y = centerY - component.render.height / 2;
    }

    const alignedChildren = new Set();
    const chainEdges = circuit.connections.map((connection) => {
      const from = componentByRef.get(connection.from.ref);
      const to = componentByRef.get(connection.to.ref);
      if (!from || !to || from.ref === hub.ref || to.ref === hub.ref || isPowerComponent(from) || isPowerComponent(to)) return null;
      const fromDistance = distances.get(from.ref) || 1;
      const toDistance = distances.get(to.ref) || 1;
      if (fromDistance === toDistance) return null;
      return fromDistance < toDistance
        ? { parent: from, parentEndpoint: connection.from, child: to, childEndpoint: connection.to, distance: toDistance }
        : { parent: to, parentEndpoint: connection.to, child: from, childEndpoint: connection.from, distance: fromDistance };
    }).filter(Boolean).sort((a, b) => a.distance - b.distance);
    for (const edge of chainEdges) {
      if (alignedChildren.has(edge.child.ref)) continue;
      const parentPoint = endpointPoint(edge.parent, edge.parentEndpoint, "out");
      const childPoint = endpointPoint(edge.child, edge.childEndpoint, "in");
      const parentHorizontal = parentPoint.side === "left" || parentPoint.side === "right";
      const childHorizontal = childPoint.side === "left" || childPoint.side === "right";
      const parentVertical = parentPoint.side === "top" || parentPoint.side === "bottom";
      const childVertical = childPoint.side === "top" || childPoint.side === "bottom";
      if (parentHorizontal && childHorizontal) {
        edge.child.render.y += parentPoint.y - childPoint.y;
        alignedChildren.add(edge.child.ref);
      } else if (parentVertical && childVertical) {
        edge.child.render.x += parentPoint.x - childPoint.x;
        alignedChildren.add(edge.child.ref);
      }
    }
    resolveComponentOverlaps(
      circuit.components.filter((component) => !isPowerComponent(component)),
      hub.ref,
      zones,
      20
    );

    const placePowerNearConnection = (component, ground) => {
      const neighbors = (adjacency.get(component.ref) || [])
        .map((edge) => ({ edge, component: componentByRef.get(edge.ref) }))
        .filter((entry) => entry.component && !isPowerComponent(entry.component));
      const anchors = neighbors.map((entry) => {
        const point = endpointPoint(entry.component, entry.edge.otherEndpoint, ground ? "out" : "in");
        const obstacle = routingObstacle(entry.component);
        if (point.side === "left") point.x = obstacle.left - 16;
        if (point.side === "right") point.x = obstacle.right + 16;
        return point;
      });
      const centerX = anchors.length
        ? anchors.reduce((sum, point) => sum + point.x, 0) / anchors.length
        : hubCenter.x;
      component.render.x = centerX - component.render.width / 2;
      if (neighbors.length) {
        component.render.y = ground
          ? Math.max(...neighbors.map((entry) => entry.component.render.y + entry.component.render.height)) + 42
          : Math.min(...neighbors.map((entry) => entry.component.render.y)) - component.render.height - 42;
      } else {
        component.render.y = ground ? hubCenter.y + 300 : 28;
      }
      const gap = 8;
      for (let pass = 0; pass < 3; pass += 1) {
        const blocker = circuit.components.find((other) => other.ref !== component.ref
          && !isPowerComponent(other)
          && component.render.x + component.render.width + gap > other.render.x
          && component.render.x - gap < other.render.x + other.render.width
          && component.render.y + component.render.height + gap > other.render.y
          && component.render.y - gap < other.render.y + other.render.height);
        if (!blocker) break;
        const leftX = blocker.render.x - gap - component.render.width;
        const rightX = blocker.render.x + blocker.render.width + gap;
        component.render.x = Math.abs(leftX - component.render.x) <= Math.abs(rightX - component.render.x)
          ? leftX
          : rightX;
      }
    };
    circuit.components
      .filter((component) => isPowerComponent(component) && !isGroundComponent(component))
      .forEach((component) => placePowerNearConnection(component, false));
    circuit.components
      .filter(isGroundComponent)
      .forEach((component) => placePowerNearConnection(component, true));
    resolveComponentOverlaps(circuit.components, hub.ref, zones, 12);
    resolveComponentOverlaps(circuit.components, hub.ref, zones, 0);

    return finalizeLayoutBounds(circuit.components);
  }

  function chooseAutomaticRotations(circuit) {
    let changed = false;
    const hub = circuit.components
      .filter((candidate) => !isPowerComponent(candidate) && (candidate.render?.pins?.length || 0) >= 4)
      .sort((a, b) => (b.render.pins?.length || 0) - (a.render.pins?.length || 0))[0] || null;
    for (const component of circuit.components) {
      if (component.rotationExplicit || isPowerComponent(component) || !component.symbol) continue;
      if ((component.symbol.pins?.length || 0) < 2 || component.symbol.pins.length > 2) continue;
      const center = {
        x: component.render.x + component.render.width / 2,
        y: component.render.y + component.render.height / 2
      };
      const connections = circuit.connections.flatMap((connection) => {
        if (connection.from.ref === component.ref) {
          return [{ endpoint: connection.from, neighbor: circuit.componentByRef.get(connection.to.ref) }];
        }
        if (connection.to.ref === component.ref) {
          return [{ endpoint: connection.to, neighbor: circuit.componentByRef.get(connection.from.ref) }];
        }
        return [];
      }).filter((entry) => entry.neighbor?.render);
      const group = circuit.groups.find((candidate) => candidate.name === component.groupName);
      const groupDirection = group
        ? normalizeLayoutDirection(group.attrs.direction, "LR")
        : null;
      const groupAxis = groupDirection === "TB" ? "vertical"
        : groupDirection === "LR" ? "horizontal"
          : null;
      if (!connections.length && !groupAxis) continue;
      const identity = `${component.symbolId || ""} ${component.type || ""}`.toLowerCase();
      const hasPowerNeighbor = connections.some((entry) => isPowerComponent(entry.neighbor));
      let desiredAxis = groupAxis;
      if (!desiredAxis && identity.includes("switch:")) {
        desiredAxis = hasPowerNeighbor ? "vertical" : null;
      } else if (!desiredAxis && /device:c(?:_|$)|capacitor/.test(identity)) {
        desiredAxis = hasPowerNeighbor ? "vertical" : null;
      } else if (!desiredAxis && hub && hub.ref !== component.ref) {
        const componentCenter = center;
        const hubCenter = {
          x: hub.render.x + hub.render.width / 2,
          y: hub.render.y + hub.render.height / 2
        };
        desiredAxis = Math.abs(componentCenter.x - hubCenter.x) >= Math.abs(componentCenter.y - hubCenter.y) * 0.65
          ? "horizontal"
          : "vertical";
      }

      let bestRotation = component.rotation || 0;
      let bestScore = Number.POSITIVE_INFINITY;
      const originalRotation = component.rotation;
      const originalRender = component.render;
      for (const rotation of [0, 90, 180, 270]) {
        component.rotation = rotation;
        const candidate = estimateSymbolSize(component);
        component.render = {
          ...candidate,
          x: center.x - candidate.width / 2,
          y: center.y - candidate.height / 2
        };
        let score = rotation * 0.0001;
        const neighborCenters = [];
        for (const entry of connections) {
          const point = endpointPoint(component, entry.endpoint, "out");
          const neighborCenter = {
            x: entry.neighbor.render.x + entry.neighbor.render.width / 2,
            y: entry.neighbor.render.y + entry.neighbor.render.height / 2
          };
          neighborCenters.push(neighborCenter);
          const dx = neighborCenter.x - point.x;
          const dy = neighborCenter.y - point.y;
          const horizontal = point.side === "left" || point.side === "right";
          const forward = point.side === "left" ? -dx
            : point.side === "right" ? dx
              : point.side === "top" ? -dy
                : dy;
          const cross = horizontal ? Math.abs(dy) : Math.abs(dx);
          const along = horizontal ? Math.abs(dx) : Math.abs(dy);
          score += cross * 0.35;
          if (forward < 0) score += 180 + Math.abs(forward) * 0.7;
          if (cross > along) score += 55 + (cross - along) * 0.25;
        }
        if (neighborCenters.length >= 2) {
          const spreadX = Math.max(...neighborCenters.map((point) => point.x)) - Math.min(...neighborCenters.map((point) => point.x));
          const spreadY = Math.max(...neighborCenters.map((point) => point.y)) - Math.min(...neighborCenters.map((point) => point.y));
          const pinSides = candidate.pins.map((pin) => inferPinSide(pin, candidate.viewBox));
          const horizontalPins = pinSides.every((side) => side === "left" || side === "right");
          const verticalPins = pinSides.every((side) => side === "top" || side === "bottom");
          if (desiredAxis === "horizontal" && !horizontalPins) score += 600;
          if (desiredAxis === "vertical" && !verticalPins) score += 600;
          if (spreadX > spreadY * 1.15 && !horizontalPins) score += 120;
          if (spreadY > spreadX * 1.15 && !verticalPins) score += 120;
        } else {
          const pinSides = candidate.pins.map((pin) => inferPinSide(pin, candidate.viewBox));
          const horizontalPins = pinSides.every((side) => side === "left" || side === "right");
          const verticalPins = pinSides.every((side) => side === "top" || side === "bottom");
          if (desiredAxis === "horizontal" && !horizontalPins) score += 600;
          if (desiredAxis === "vertical" && !verticalPins) score += 600;
        }
        if (score < bestScore) {
          bestScore = score;
          bestRotation = rotation;
        }
      }
      component.rotation = originalRotation;
      component.render = originalRender;
      if (bestRotation !== component.rotation) {
        component.rotation = bestRotation;
        changed = true;
      }
    }
    return changed;
  }

  function boundedLayoutNumber(value, fallback, minimum, maximum) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.max(minimum, Math.min(maximum, numeric));
  }

  function layoutGroupedCircuit(circuit) {
    const grouped = new Set();
    const specifications = circuit.groups.map((group) => {
      const components = [];
      for (const member of group.members) {
        const component = circuit.componentByRef.get(member.ref);
        if (!component || grouped.has(component.ref)) continue;
        grouped.add(component.ref);
        components.push(component);
      }
      return { group, components, implicit: false };
    }).filter((entry) => entry.components.length);

    const ungrouped = circuit.components.filter((component) => !grouped.has(component.ref));
    if (ungrouped.length) {
      specifications.push({
        group: {
          name: "UNGROUPED",
          attrs: { label: "Ungrouped", direction: "LR" },
          line: circuit.layout?.line || ungrouped[0].line
        },
        components: ungrouped,
        implicit: true
      });
    }

    const groupLayouts = specifications.map((entry) => {
      const direction = normalizeLayoutDirection(entry.group.attrs.direction, "LR");
      const gap = boundedLayoutNumber(entry.group.attrs.gap, 82, 30, 240);
      const padding = { left: 46, right: 46, top: 62, bottom: 56 };
      const maxWidth = Math.max(220, ...entry.components.map((component) => component.render.width));
      const maxHeight = Math.max(120, ...entry.components.map((component) => component.render.height));
      let cursor = 0;
      for (const component of entry.components) {
        if (direction === "TB") {
          component.render.x = padding.left + (maxWidth - component.render.width) / 2;
          component.render.y = padding.top + cursor;
          cursor += component.render.height + gap;
        } else {
          component.render.x = padding.left + cursor;
          component.render.y = padding.top + (maxHeight - component.render.height) / 2;
          cursor += component.render.width + gap;
        }
      }
      const contentWidth = direction === "TB"
        ? maxWidth
        : Math.max(0, cursor - gap);
      const contentHeight = direction === "TB"
        ? Math.max(0, cursor - gap)
        : maxHeight;
      return {
        ...entry,
        direction,
        width: padding.left + contentWidth + padding.right,
        height: padding.top + contentHeight + padding.bottom
      };
    });

    const outerDirection = normalizeLayoutDirection(circuit.layout?.attrs.direction, "LR");
    const outerGap = boundedLayoutNumber(circuit.layout?.attrs.gap, 96, 40, 320);
    const wrap = Math.max(1, Math.min(
      groupLayouts.length,
      Math.floor(boundedLayoutNumber(circuit.layout?.attrs.wrap, groupLayouts.length, 1, groupLayouts.length))
    ));
    const margin = 44;
    let cursorX = margin;
    let cursorY = margin;
    let lineExtent = 0;
    circuit.groupBounds = [];

    groupLayouts.forEach((entry, index) => {
      if (index > 0 && index % wrap === 0) {
        if (outerDirection === "TB") {
          cursorX += lineExtent + outerGap;
          cursorY = margin;
        } else {
          cursorY += lineExtent + outerGap;
          cursorX = margin;
        }
        lineExtent = 0;
      }
      const x = cursorX;
      const y = cursorY;
      for (const component of entry.components) {
        component.render.x += x;
        component.render.y += y;
      }
      circuit.groupBounds.push({
        name: entry.group.name,
        label: entry.group.attrs.label || entry.group.name,
        color: entry.group.attrs.color || "#64748b",
        direction: entry.direction,
        implicit: entry.implicit,
        left: x,
        top: y,
        right: x + entry.width,
        bottom: y + entry.height,
        width: entry.width,
        height: entry.height
      });
      if (outerDirection === "TB") {
        cursorY += entry.height + outerGap;
        lineExtent = Math.max(lineExtent, entry.width);
      } else {
        cursorX += entry.width + outerGap;
        lineExtent = Math.max(lineExtent, entry.height);
      }
    });

    return {
      width: Math.max(760, margin + Math.max(...circuit.groupBounds.map((bounds) => bounds.right))),
      height: Math.max(460, margin + Math.max(...circuit.groupBounds.map((bounds) => bounds.bottom)))
    };
  }

  function runCircuitLayout(circuit) {
    for (const component of circuit.components) component.render = estimateSymbolSize(component);
    if (circuit.groups.length) return layoutGroupedCircuit(circuit);
    circuit.groupBounds = [];
    const adjacency = buildAdjacency(circuit);
    const candidates = circuit.components
      .filter((component) => !isPowerComponent(component) && (component.render.pins?.length || 0) >= 4)
      .map((component) => ({
        component,
        score: (adjacency.get(component.ref)?.length || 0) * 10 + component.render.pins.length + (component.definition ? 50 : 0)
      }))
      .sort((a, b) => b.score - a.score);
    return candidates.length
      ? layoutHubCircuit(circuit, candidates[0].component, adjacency)
      : layoutLayeredCircuit(circuit);
  }

  function layoutCircuit(circuit) {
    let size = runCircuitLayout(circuit);
    for (let pass = 0; pass < 2; pass += 1) {
      if (!chooseAutomaticRotations(circuit)) break;
      size = runCircuitLayout(circuit);
    }
    return size;
  }

  function fallbackPinPoint(component, endpoint, side) {
    const render = component.render;
    const pinSide = side === "out" ? "right" : "left";
    const x = pinSide === "right" ? render.x + render.width : render.x;
    return { x, y: render.y + render.height / 2, side: pinSide };
  }

  function endpointPoint(component, endpoint, side) {
    if (!component) return { x: 0, y: 0 };
    if (!component.symbol) return fallbackPinPoint(component, endpoint, side);
    let pin = endpoint.pin
      ? component.render.pinLookup.get(normalizePinKey(endpoint.pin))
      : null;
    if (!pin && component.render.pins.length === 1) pin = component.render.pins[0];
    if (!pin) return fallbackPinPoint(component, endpoint, side);
    const [minX, minY] = component.render.viewBox;
    return {
      x: component.render.x + (pin.x - minX) * component.render.scale,
      y: component.render.y + (pin.y - minY) * component.render.scale,
      side: inferPinSide(pin, component.render.viewBox)
    };
  }

  function offsetFromPin(point, distance) {
    if (point.side === "left") return { x: point.x - distance, y: point.y };
    if (point.side === "right") return { x: point.x + distance, y: point.y };
    if (point.side === "top") return { x: point.x, y: point.y - distance };
    if (point.side === "bottom") return { x: point.x, y: point.y + distance };
    return { x: point.x, y: point.y };
  }

  const ROUTING_GRID = 10;
  const ROUTING_CLEARANCE = 9;

  function routingObstacle(component) {
    const render = component.render;
    return {
      left: render.x - ROUTING_CLEARANCE,
      right: render.x + render.width + ROUTING_CLEARANCE,
      top: render.y - ROUTING_CLEARANCE,
      bottom: render.y + render.height + ROUTING_CLEARANCE
    };
  }

  function pinStubPoint(point, component) {
    const obstacle = routingObstacle(component);
    const extra = 2;
    if (point.side === "left") return { x: obstacle.left - extra, y: point.y };
    if (point.side === "right") return { x: obstacle.right + extra, y: point.y };
    if (point.side === "top") return { x: point.x, y: obstacle.top - extra };
    if (point.side === "bottom") return { x: point.x, y: obstacle.bottom + extra };
    return offsetFromPin(point, 28);
  }

  function createRoutingContext(circuit, size) {
    return {
      width: size.width,
      height: size.height,
      obstacles: circuit.components.map(routingObstacle),
      usedCells: new Map(),
      usedEdges: new Map(),
      segments: [],
      failures: []
    };
  }

  function heapPush(heap, item) {
    heap.push(item);
    let index = heap.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (heap[parent].f <= item.f) break;
      heap[index] = heap[parent];
      index = parent;
    }
    heap[index] = item;
  }

  function heapPop(heap) {
    if (!heap.length) return null;
    const first = heap[0];
    const last = heap.pop();
    if (heap.length) {
      let index = 0;
      while (true) {
        const left = index * 2 + 1;
        const right = left + 1;
        if (left >= heap.length) break;
        const child = right < heap.length && heap[right].f < heap[left].f ? right : left;
        if (heap[child].f >= last.f) break;
        heap[index] = heap[child];
        index = child;
      }
      heap[index] = last;
    }
    return first;
  }

  function routingCellKey(x, y) {
    return `${x},${y}`;
  }

  function routingEdgeKey(x1, y1, x2, y2) {
    const first = routingCellKey(x1, y1);
    const second = routingCellKey(x2, y2);
    return first < second ? `${first}|${second}` : `${second}|${first}`;
  }

  function isRoutingCellBlocked(x, y, context) {
    const pointX = x * ROUTING_GRID;
    const pointY = y * ROUTING_GRID;
    return context.obstacles.some((obstacle) => (
      pointX >= obstacle.left && pointX <= obstacle.right
      && pointY >= obstacle.top && pointY <= obstacle.bottom
    ));
  }

  function pointEqual(a, b) {
    return Math.abs(a.x - b.x) < 0.01 && Math.abs(a.y - b.y) < 0.01;
  }

  function segmentFromPoints(a, b, netId = null) {
    if (pointEqual(a, b)) return null;
    if (Math.abs(a.y - b.y) < 0.01) {
      return {
        orientation: "horizontal",
        constant: a.y,
        start: Math.min(a.x, b.x),
        end: Math.max(a.x, b.x),
        netId
      };
    }
    if (Math.abs(a.x - b.x) < 0.01) {
      return {
        orientation: "vertical",
        constant: a.x,
        start: Math.min(a.y, b.y),
        end: Math.max(a.y, b.y),
        netId
      };
    }
    return null;
  }

  function segmentIntersectsObstacle(segment, obstacle) {
    if (segment.orientation === "horizontal") {
      return segment.constant > obstacle.top
        && segment.constant < obstacle.bottom
        && segment.end > obstacle.left
        && segment.start < obstacle.right;
    }
    return segment.constant > obstacle.left
      && segment.constant < obstacle.right
      && segment.end > obstacle.top
      && segment.start < obstacle.bottom;
  }

  function segmentInteraction(segment, existing) {
    if (segment.orientation === existing.orientation) {
      if (Math.abs(segment.constant - existing.constant) >= 0.01) return null;
      const overlap = Math.min(segment.end, existing.end) - Math.max(segment.start, existing.start);
      return overlap > 0.01 ? { type: "overlap", length: overlap } : null;
    }
    const horizontal = segment.orientation === "horizontal" ? segment : existing;
    const vertical = segment.orientation === "vertical" ? segment : existing;
    const crosses = vertical.constant > horizontal.start + 0.01
      && vertical.constant < horizontal.end - 0.01
      && horizontal.constant > vertical.start + 0.01
      && horizontal.constant < vertical.end - 0.01;
    return crosses ? { type: "crossing", length: 0 } : null;
  }

  function evaluateRoutingSegment(a, b, context, netId) {
    const segment = segmentFromPoints(a, b, netId);
    if (!segment) return { valid: pointEqual(a, b), crossings: 0, sharedLength: 0 };
    if (context.obstacles.some((obstacle) => segmentIntersectsObstacle(segment, obstacle))) {
      return { valid: false, crossings: 0, sharedLength: 0 };
    }
    let crossings = 0;
    let sharedLength = 0;
    for (const existing of context.segments) {
      const interaction = segmentInteraction(segment, existing);
      if (!interaction) continue;
      if (interaction.type === "overlap") {
        if (existing.netId !== netId) return { valid: false, crossings: 0, sharedLength: 0 };
        sharedLength += interaction.length;
      } else if (existing.netId !== netId) {
        crossings += 1;
      }
    }
    return { valid: true, crossings, sharedLength };
  }

  function registerRoutingSegments(points, context, netId) {
    for (let index = 1; index < points.length; index += 1) {
      const segment = segmentFromPoints(points[index - 1], points[index], netId);
      if (segment) context.segments.push(segment);
    }
  }

  function simplifyOrthogonalPoints(points) {
    const compact = [];
    for (const point of points) {
      const previous = compact[compact.length - 1];
      if (previous && previous.x === point.x && previous.y === point.y) continue;
      compact.push(point);
      while (compact.length >= 3) {
        const a = compact[compact.length - 3];
        const b = compact[compact.length - 2];
        const c = compact[compact.length - 1];
        if ((a.x === b.x && b.x === c.x) || (a.y === b.y && b.y === c.y)) {
          compact.splice(compact.length - 2, 1);
        } else {
          break;
        }
      }
    }
    return compact;
  }

  function routeWithFewBends(start, end, context, netId) {
    const xTracks = new Set([
      start.x,
      end.x,
      (start.x + end.x) / 2,
      Math.round((start.x + end.x) / (ROUTING_GRID * 2)) * ROUTING_GRID,
      ROUTING_GRID * 2,
      context.width - ROUTING_GRID * 2
    ]);
    const yTracks = new Set([
      start.y,
      end.y,
      (start.y + end.y) / 2,
      Math.round((start.y + end.y) / (ROUTING_GRID * 2)) * ROUTING_GRID,
      ROUTING_GRID * 2,
      context.height - ROUTING_GRID * 2
    ]);
    for (const obstacle of context.obstacles) {
      xTracks.add(obstacle.left);
      xTracks.add(obstacle.right);
      xTracks.add(obstacle.left - ROUTING_GRID);
      xTracks.add(obstacle.right + ROUTING_GRID);
      yTracks.add(obstacle.top);
      yTracks.add(obstacle.bottom);
      yTracks.add(obstacle.top - ROUTING_GRID);
      yTracks.add(obstacle.bottom + ROUTING_GRID);
    }
    for (const segment of context.segments) {
      if (segment.orientation === "vertical") {
        xTracks.add(segment.constant - ROUTING_GRID);
        xTracks.add(segment.constant + ROUTING_GRID);
      } else {
        yTracks.add(segment.constant - ROUTING_GRID);
        yTracks.add(segment.constant + ROUTING_GRID);
      }
    }

    const candidates = [];
    const seen = new Set();
    const addCandidate = (points) => {
      const compact = simplifyOrthogonalPoints(points);
      const key = compact.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join("|");
      if (seen.has(key)) return;
      seen.add(key);
      candidates.push(compact);
    };
    addCandidate([start, end]);
    addCandidate([start, { x: end.x, y: start.y }, end]);
    addCandidate([start, { x: start.x, y: end.y }, end]);
    for (const x of xTracks) {
      if (x <= ROUTING_GRID || x >= context.width - ROUTING_GRID) continue;
      addCandidate([start, { x, y: start.y }, { x, y: end.y }, end]);
    }
    for (const y of yTracks) {
      if (y <= ROUTING_GRID || y >= context.height - ROUTING_GRID) continue;
      addCandidate([start, { x: start.x, y }, { x: end.x, y }, end]);
    }

    let bestRoute = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const candidate of candidates) {
      let length = 0;
      let crossings = 0;
      let sharedLength = 0;
      let valid = true;
      for (let index = 1; index < candidate.length; index += 1) {
        const a = candidate[index - 1];
        const b = candidate[index];
        const segment = segmentFromPoints(a, b);
        if (!segment) {
          valid = false;
          break;
        }
        const result = evaluateRoutingSegment(a, b, context, netId);
        if (!result.valid) {
          valid = false;
          break;
        }
        length += segment.end - segment.start;
        crossings += result.crossings;
        sharedLength += result.sharedLength;
      }
      if (!valid) continue;
      const bends = Math.max(0, candidate.length - 2);
      const score = length + bends * 42 + crossings * 240 - Math.min(length, sharedLength) * 0.7;
      if (score < bestScore) {
        bestScore = score;
        bestRoute = candidate;
      }
    }
    return bestRoute;
  }

  function markRoutingUsage(cells, context, netId) {
    for (let index = 1; index < cells.length; index += 1) {
      const previous = cells[index - 1];
      const current = cells[index];
      const orientation = previous.x === current.x ? "vertical" : "horizontal";
      for (const cell of [previous, current]) {
        const key = routingCellKey(cell.x, cell.y);
        const usage = context.usedCells.get(key) || { horizontal: new Set(), vertical: new Set() };
        usage[orientation].add(netId);
        context.usedCells.set(key, usage);
      }
      context.usedEdges.set(routingEdgeKey(previous.x, previous.y, current.x, current.y), netId);
    }
  }

  function nearestRoutingEntry(point, context, netId, preferHorizontal = null) {
    const maxX = Math.floor(context.width / ROUTING_GRID);
    const maxY = Math.floor(context.height / ROUTING_GRID);
    const originX = Math.max(1, Math.min(maxX - 1, Math.round(point.x / ROUTING_GRID)));
    const originY = Math.max(1, Math.min(maxY - 1, Math.round(point.y / ROUTING_GRID)));
    for (let radius = 0; radius <= 12; radius += 1) {
      const candidates = [];
      for (let dx = -radius; dx <= radius; dx += 1) {
        for (let dy = -radius; dy <= radius; dy += 1) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
          const x = originX + dx;
          const y = originY + dy;
          if (x < 1 || y < 1 || x >= maxX || y >= maxY || isRoutingCellBlocked(x, y, context)) continue;
          const world = { x: x * ROUTING_GRID, y: y * ROUTING_GRID };
          const horizontalFirst = [point, { x: world.x, y: point.y }, world];
          const verticalFirst = [point, { x: point.x, y: world.y }, world];
          const options = preferHorizontal === true
            ? [horizontalFirst, verticalFirst]
            : preferHorizontal === false
              ? [verticalFirst, horizontalFirst]
              : [horizontalFirst, verticalFirst];
          for (const option of options) {
            const compact = simplifyOrthogonalPoints(option);
            const valid = compact.slice(1).every((current, index) => (
              evaluateRoutingSegment(compact[index], current, context, netId).valid
            ));
            if (valid) {
              candidates.push({ cell: { x, y }, connector: compact });
              break;
            }
          }
        }
      }
      if (candidates.length) {
        candidates.sort((a, b) => a.connector.length - b.connector.length);
        return candidates[0];
      }
    }
    return null;
  }

  function routeOrthogonally(startPoint, endPoint, context, netId, startHorizontal = null, endHorizontal = null) {
    const maxX = Math.floor(context.width / ROUTING_GRID);
    const maxY = Math.floor(context.height / ROUTING_GRID);
    const startEntry = nearestRoutingEntry(startPoint, context, netId, startHorizontal);
    const endEntry = nearestRoutingEntry(endPoint, context, netId, endHorizontal);
    if (!startEntry || !endEntry) return null;
    const start = startEntry.cell;
    const end = endEntry.cell;
    const directions = [
      { x: 1, y: 0, orientation: "horizontal" },
      { x: -1, y: 0, orientation: "horizontal" },
      { x: 0, y: 1, orientation: "vertical" },
      { x: 0, y: -1, orientation: "vertical" }
    ];
    const startKey = `${start.x},${start.y},4`;
    const open = [];
    const best = new Map([[startKey, 0]]);
    const previous = new Map();
    heapPush(open, {
      x: start.x,
      y: start.y,
      direction: 4,
      key: startKey,
      g: 0,
      f: Math.abs(start.x - end.x) + Math.abs(start.y - end.y)
    });

    let goal = null;
    let expansions = 0;
    while (open.length && expansions < 75000) {
      const current = heapPop(open);
      if (current.g !== best.get(current.key)) continue;
      if (current.x === end.x && current.y === end.y) {
        goal = current;
        break;
      }
      expansions += 1;
      for (let direction = 0; direction < directions.length; direction += 1) {
        const move = directions[direction];
        const x = current.x + move.x;
        const y = current.y + move.y;
        if (x < 1 || y < 1 || x >= maxX || y >= maxY) continue;
        const isEndpoint = (x === start.x && y === start.y) || (x === end.x && y === end.y);
        if (!isEndpoint && isRoutingCellBlocked(x, y, context)) continue;

        const usage = context.usedCells.get(routingCellKey(x, y));
        const opposite = usage?.[move.orientation === "horizontal" ? "vertical" : "horizontal"];
        const parallel = usage?.[move.orientation];
        const crossingUse = opposite ? [...opposite].filter((owner) => owner !== netId).length : 0;
        const parallelUse = parallel ? [...parallel].filter((owner) => owner !== netId).length : 0;
        const edgeOwner = context.usedEdges.get(routingEdgeKey(current.x, current.y, x, y));
        if (edgeOwner && edgeOwner !== netId) continue;
        const worldA = { x: current.x * ROUTING_GRID, y: current.y * ROUTING_GRID };
        const worldB = { x: x * ROUTING_GRID, y: y * ROUTING_GRID };
        const segmentResult = evaluateRoutingSegment(worldA, worldB, context, netId);
        if (!segmentResult.valid) continue;
        const bendCost = current.direction === 4 || current.direction === direction ? 0 : 4;
        const congestionCost = (crossingUse + segmentResult.crossings) * 24 + parallelUse * 2;
        const sharedDiscount = edgeOwner === netId ? 0.7 : 0;
        const g = current.g + 1 + bendCost + congestionCost - sharedDiscount;
        const key = `${x},${y},${direction}`;
        if (g >= (best.get(key) ?? Number.POSITIVE_INFINITY)) continue;
        best.set(key, g);
        previous.set(key, current.key);
        const heuristic = Math.abs(x - end.x) + Math.abs(y - end.y);
        heapPush(open, { x, y, direction, key, g, f: g + heuristic });
      }
    }

    if (!goal) return null;
    const cells = [];
    let key = goal.key;
    while (key) {
      const [x, y] = key.split(",").map(Number);
      cells.push({ x, y });
      key = previous.get(key);
    }
    cells.reverse();
    markRoutingUsage(cells, context, netId);
    const gridPoints = cells.map((cell) => ({
      x: cell.x * ROUTING_GRID,
      y: cell.y * ROUTING_GRID
    }));
    return simplifyOrthogonalPoints([
      ...startEntry.connector,
      ...gridPoints,
      ...[...endEntry.connector].reverse()
    ]);
  }

  function routeConnection(connection, circuit, routing, netId) {
    const from = circuit.componentByRef.get(connection.from.ref);
    const to = circuit.componentByRef.get(connection.to.ref);
    if (!from || !to) return null;
    const a = endpointPoint(from, connection.from, "out");
    const b = endpointPoint(to, connection.to, "in");
    const aStub = pinStubPoint(a, from);
    const bStub = pinStubPoint(b, to);
    const horizontalA = a.side === "left" || a.side === "right";
    const horizontalB = b.side === "left" || b.side === "right";
    const points = [a, aStub];

    const route = routeWithFewBends(aStub, bStub, routing, netId)
      || routeOrthogonally(aStub, bStub, routing, netId, horizontalA, horizontalB);
    if (route?.length) {
      const routeStart = route[0];
      const routeEnd = route[route.length - 1];
      if (!pointEqual(aStub, routeStart)) {
        if (horizontalA) points.push({ x: routeStart.x, y: aStub.y });
        else points.push({ x: aStub.x, y: routeStart.y });
      }
      points.push(...route);
      if (!pointEqual(bStub, routeEnd)) {
        if (horizontalB) points.push({ x: routeEnd.x, y: bStub.y });
        else points.push({ x: bStub.x, y: routeEnd.y });
      }
    } else {
      routing.failures.push(`${connection.from.raw}->${connection.to.raw}`);
      return null;
    }
    points.push(bStub, b);
    const compact = simplifyOrthogonalPoints(points);
    registerRoutingSegments(compact, routing, netId);
    return compact;
  }

  function endpointNetKey(endpoint) {
    const pin = endpoint.pin ? normalizePinKey(endpoint.pin) : "*";
    return `${endpoint.ref}.${pin}`;
  }

  function groupConnectionsIntoNets(connections) {
    const parent = connections.map((_, index) => index);
    const find = (index) => {
      let root = index;
      while (parent[root] !== root) root = parent[root];
      while (parent[index] !== index) {
        const next = parent[index];
        parent[index] = root;
        index = next;
      }
      return root;
    };
    const join = (a, b) => {
      const rootA = find(a);
      const rootB = find(b);
      if (rootA !== rootB) parent[rootB] = rootA;
    };
    const endpointOwners = new Map();
    connections.forEach((connection, index) => {
      for (const endpoint of [connection.from, connection.to]) {
        const key = endpointNetKey(endpoint);
        if (endpointOwners.has(key)) join(index, endpointOwners.get(key));
        else endpointOwners.set(key, index);
      }
    });
    const groups = new Map();
    connections.forEach((connection, index) => {
      const root = find(index);
      if (!groups.has(root)) groups.set(root, []);
      groups.get(root).push(connection);
    });
    return [...groups.values()].map((netConnections, index) => ({
      id: `net-${index}`,
      connections: netConnections
    }));
  }

  function mergeNetSegments(polylines, netId) {
    const groups = new Map();
    for (const points of polylines) {
      for (let index = 1; index < points.length; index += 1) {
        const segment = segmentFromPoints(points[index - 1], points[index], netId);
        if (!segment) continue;
        const key = `${segment.orientation}:${segment.constant.toFixed(2)}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(segment);
      }
    }

    const merged = [];
    for (const segments of groups.values()) {
      segments.sort((a, b) => a.start - b.start || a.end - b.end);
      let current = { ...segments[0] };
      for (let index = 1; index < segments.length; index += 1) {
        const segment = segments[index];
        if (segment.start <= current.end + 0.01) {
          current.end = Math.max(current.end, segment.end);
        } else {
          merged.push(current);
          current = { ...segment };
        }
      }
      merged.push(current);
    }
    return merged;
  }

  function segmentEndpoint(segment, atEnd) {
    if (segment.orientation === "horizontal") {
      return { x: atEnd ? segment.end : segment.start, y: segment.constant };
    }
    return { x: segment.constant, y: atEnd ? segment.end : segment.start };
  }

  function netJunctions(segments) {
    const candidates = new Map();
    const addCandidate = (point) => candidates.set(`${point.x.toFixed(2)},${point.y.toFixed(2)}`, point);
    for (const segment of segments) {
      addCandidate(segmentEndpoint(segment, false));
      addCandidate(segmentEndpoint(segment, true));
    }
    for (const horizontal of segments.filter((segment) => segment.orientation === "horizontal")) {
      for (const vertical of segments.filter((segment) => segment.orientation === "vertical")) {
        if (vertical.constant >= horizontal.start - 0.01
          && vertical.constant <= horizontal.end + 0.01
          && horizontal.constant >= vertical.start - 0.01
          && horizontal.constant <= vertical.end + 0.01) {
          addCandidate({ x: vertical.constant, y: horizontal.constant });
        }
      }
    }

    return [...candidates.values()].filter((point) => {
      const directions = new Set();
      for (const segment of segments) {
        if (segment.orientation === "horizontal" && Math.abs(point.y - segment.constant) < 0.01
          && point.x >= segment.start - 0.01 && point.x <= segment.end + 0.01) {
          if (point.x > segment.start + 0.01) directions.add("left");
          if (point.x < segment.end - 0.01) directions.add("right");
        }
        if (segment.orientation === "vertical" && Math.abs(point.x - segment.constant) < 0.01
          && point.y >= segment.start - 0.01 && point.y <= segment.end + 0.01) {
          if (point.y > segment.start + 0.01) directions.add("up");
          if (point.y < segment.end - 0.01) directions.add("down");
        }
      }
      return directions.size >= 3;
    });
  }

  function routeTerminalToTree(endpoint, circuit, routing, netId) {
    const component = circuit.componentByRef.get(endpoint.ref);
    if (!component) return null;
    const pin = endpointPoint(component, endpoint, "out");
    const stub = pinStubPoint(pin, component);
    const treeSegments = routing.segments.filter((segment) => segment.netId === netId);
    if (!treeSegments.length) return null;

    const attachments = new Map();
    const addAttachment = (point) => {
      const key = `${point.x.toFixed(2)},${point.y.toFixed(2)}`;
      attachments.set(key, point);
    };
    for (const segment of treeSegments) {
      addAttachment(segmentEndpoint(segment, false));
      addAttachment(segmentEndpoint(segment, true));
      if (segment.orientation === "horizontal") {
        addAttachment({ x: Math.max(segment.start, Math.min(segment.end, stub.x)), y: segment.constant });
        for (const obstacle of routing.obstacles) {
          for (const x of [obstacle.left, obstacle.right]) {
            if (x > segment.start && x < segment.end) addAttachment({ x, y: segment.constant });
          }
        }
      } else {
        addAttachment({ x: segment.constant, y: Math.max(segment.start, Math.min(segment.end, stub.y)) });
        for (const obstacle of routing.obstacles) {
          for (const y of [obstacle.top, obstacle.bottom]) {
            if (y > segment.start && y < segment.end) addAttachment({ x: segment.constant, y });
          }
        }
      }
    }

    let best = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const attachment of attachments.values()) {
      const route = routeWithFewBends(stub, attachment, routing, netId);
      if (!route) continue;
      let freshLength = 0;
      let crossings = 0;
      for (let index = 1; index < route.length; index += 1) {
        const segment = segmentFromPoints(route[index - 1], route[index]);
        if (!segment) continue;
        const result = evaluateRoutingSegment(route[index - 1], route[index], routing, netId);
        const length = segment.end - segment.start;
        freshLength += Math.max(0, length - Math.min(length, result.sharedLength));
        crossings += result.crossings;
      }
      const score = freshLength + Math.max(0, route.length - 2) * 42 + crossings * 240;
      if (score < bestScore) {
        bestScore = score;
        best = route;
      }
    }

    if (!best) {
      const nearest = [...attachments.values()].sort((a, b) => (
        Math.abs(a.x - stub.x) + Math.abs(a.y - stub.y)
        - Math.abs(b.x - stub.x) - Math.abs(b.y - stub.y)
      ))[0];
      if (nearest) {
        const horizontal = pin.side === "left" || pin.side === "right";
        best = routeOrthogonally(stub, nearest, routing, netId, horizontal, null);
      }
    }
    if (!best) return null;
    const points = simplifyOrthogonalPoints([pin, stub, ...best]);
    registerRoutingSegments(points, routing, netId);
    return points;
  }

  function renderNet(net, circuit, routing) {
    const polylines = [];
    const seed = net.connections[0];
    const seedRoute = routeConnection(seed, circuit, routing, net.id);
    if (seedRoute) polylines.push(seedRoute);
    const connected = new Set([endpointNetKey(seed.from), endpointNetKey(seed.to)]);
    const remaining = [];
    for (const connection of net.connections) {
      for (const endpoint of [connection.from, connection.to]) {
        const key = endpointNetKey(endpoint);
        if (!connected.has(key)) {
          connected.add(key);
          remaining.push(endpoint);
        }
      }
    }
    for (const endpoint of remaining) {
      const route = routeTerminalToTree(endpoint, circuit, routing, net.id);
      if (route) polylines.push(route);
      else routing.failures.push(`${endpoint.raw}->${net.id}`);
    }
    if (!polylines.length) return "";
    const segments = mergeNetSegments(polylines, net.id);
    const d = segments.map((segment) => {
      const start = segmentEndpoint(segment, false);
      const end = segmentEndpoint(segment, true);
      return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} L ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
    }).join(" ");
    const color = escapeHtml(connectionColor(net.connections[0]));
    const junctions = netJunctions(segments).map((point) => (
      `<circle class="junction-dot" cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="3" fill="${color}"></circle>`
    )).join("");
    return `<path class="wire-underlay" d="${d}" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path><path class="wire" data-net="${net.id}" d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>${junctions}`;
  }

  function padCircuitForLabels(circuit, size) {
    if (!circuit.labels.length) return size;
    const horizontal = 190;
    const vertical = 140;
    for (const component of circuit.components) {
      component.render.x += horizontal;
      component.render.y += vertical;
    }
    for (const bounds of circuit.groupBounds || []) {
      bounds.left += horizontal;
      bounds.right += horizontal;
      bounds.top += vertical;
      bounds.bottom += vertical;
    }
    return {
      width: size.width + horizontal * 2,
      height: size.height + vertical * 2
    };
  }

  function netLabelGeometry(label, circuit) {
    const component = circuit.componentByRef.get(label.endpoint.ref);
    if (!component?.render) return null;
    const point = endpointPoint(component, label.endpoint, "out");
    const powerKind = powerNetKind(label);
    const width = powerKind
      ? Math.max(38, label.name.length * 5.8 + 10)
      : Math.max(44, label.name.length * 5.9 + 22);
    const height = powerKind === "return" ? 34 : powerKind === "supply" ? 28 : 18;
    return positionNetLabel({ label, point, width, height, powerKind }, 16, 0);
  }

  function powerNetKind(label) {
    if (label.scope !== "global") return null;
    const name = String(label.name || "").trim().toUpperCase();
    if (/(^|_)(0V|GND|AGND|DGND|PGND)(_|$)/.test(name) || /RETURN$/.test(name)) return "return";
    if (/^[+-]\d+(?:V|V\d)/.test(name) || /^(VCC|VDD|VBUS|VIN|VOUT|VREF)(_|$)/.test(name)) return "supply";
    return null;
  }

  function positionNetLabel(geometry, distance, offset, placementSide = geometry.point.side, leaderDistance = 9) {
    const { point, width, height, powerKind } = geometry;
    const outwardDistance = powerKind
      ? distance + (placementSide === "left" || placementSide === "right" ? width / 2 : height / 2)
      : distance;
    let anchor = offsetFromPin({ ...point, side: placementSide }, outwardDistance);
    if (placementSide === "left" || placementSide === "right") anchor.y += offset;
    else anchor.x += offset;
    let box;
    if (powerKind) {
      box = {
        left: anchor.x - width / 2,
        top: anchor.y - height / 2,
        right: anchor.x + width / 2,
        bottom: anchor.y + height / 2
      };
      anchor = powerKind === "supply"
        ? { x: anchor.x, y: box.bottom - 2 }
        : { x: anchor.x, y: box.top + 2 };
    } else if (placementSide === "left") {
      box = { left: anchor.x - width, top: anchor.y - height / 2, right: anchor.x, bottom: anchor.y + height / 2 };
    } else if (placementSide === "top") {
      box = { left: anchor.x - width / 2, top: anchor.y - height, right: anchor.x + width / 2, bottom: anchor.y };
    } else if (placementSide === "bottom") {
      box = { left: anchor.x - width / 2, top: anchor.y, right: anchor.x + width / 2, bottom: anchor.y + height };
    } else {
      box = { left: anchor.x, top: anchor.y - height / 2, right: anchor.x + width, bottom: anchor.y + height / 2 };
    }
    return { ...geometry, anchor, box, placementSide, leaderDistance };
  }

  function netLabelLeaderPoints(geometry) {
    const { point, anchor } = geometry;
    const elbow = offsetFromPin(point, geometry.leaderDistance || 9);
    const bend = point.side === "left" || point.side === "right"
      ? { x: elbow.x, y: anchor.y }
      : { x: anchor.x, y: elbow.y };
    return [point, elbow, bend, anchor];
  }

  function netLabelLeaderSegments(geometry) {
    const points = netLabelLeaderPoints(geometry);
    return points.slice(1)
      .map((end, index) => segmentFromPoints(points[index], end))
      .filter(Boolean);
  }

  function boxIntersectsSegments(box, segments, padding = 3) {
    return segments.some((segment) => {
      if (segment.orientation === "horizontal") {
        return segment.constant > box.top - padding
          && segment.constant < box.bottom + padding
          && segment.end > box.left - padding
          && segment.start < box.right + padding;
      }
      return segment.constant > box.left - padding
        && segment.constant < box.right + padding
        && segment.end > box.top - padding
        && segment.start < box.bottom + padding;
    });
  }

  function segmentsTooClose(first, second, padding = 4) {
    if (first.orientation === second.orientation) {
      return Math.abs(first.constant - second.constant) < padding
        && first.end > second.start - padding
        && first.start < second.end + padding;
    }
    const horizontal = first.orientation === "horizontal" ? first : second;
    const vertical = first.orientation === "vertical" ? first : second;
    return vertical.constant > horizontal.start - padding
      && vertical.constant < horizontal.end + padding
      && horizontal.constant > vertical.start - padding
      && horizontal.constant < vertical.end + padding;
  }

  function segmentSetsTooClose(first, second, padding = 4) {
    return first.some((a) => second.some((b) => segmentsTooClose(a, b, padding)));
  }

  function placeNetLabels(circuit, routing) {
    const pending = circuit.labels
      .map((label) => netLabelGeometry(label, circuit))
      .filter(Boolean);
    const placed = [];
    const groupHeaders = (circuit.groupBounds || []).map((bounds) => ({
      left: bounds.left,
      top: bounds.top,
      right: bounds.right,
      bottom: bounds.top + 42
    }));
    const offsets = [0, -26, 26, -52, 52, -78, 78, -104, 104, -130, 130, -160, 160, -192, 192];
    const distances = [16, 28, 42, 58, 76, 94, 116];
    const leaderDistances = [9, 3, 15, 21, 29, 39, 51, 65, 81];
    for (const geometry of pending) {
      let chosen = null;
      let fallback = geometry;
      let fallbackScore = Number.POSITIVE_INFINITY;
      const sides = [geometry.point.side, ...["top", "right", "bottom", "left"].filter((side) => side !== geometry.point.side)];
      for (const side of sides) {
        for (const distance of distances) {
          for (const offset of offsets) {
            for (const leaderDistance of leaderDistances) {
              const candidate = positionNetLabel(geometry, distance, offset, side, leaderDistance);
              const candidateLeader = netLabelLeaderSegments(candidate);
              const inBounds = candidate.box.left >= 4
                && candidate.box.top >= 4
                && candidate.box.right <= routing.width - 4
                && candidate.box.bottom <= routing.height - 4;
              const blocksComponent = routing.obstacles.some((obstacle) => {
                const ownsPoint = candidate.point.x >= obstacle.left
                  && candidate.point.x <= obstacle.right
                  && candidate.point.y >= obstacle.top
                  && candidate.point.y <= obstacle.bottom;
                return boxesOverlap(candidate.box, obstacle, 3)
                  || (!ownsPoint && boxIntersectsSegments(obstacle, candidateLeader, 2));
              });
              const blocksHeader = groupHeaders.some((header) => (
                boxesOverlap(candidate.box, header, 2)
                || boxIntersectsSegments(header, candidateLeader, 2)
              ));
              const blocksLabelBox = placed.some((other) => boxesOverlap(candidate.box, other.box, 6));
              const blocksLabelLeader = placed.some((other) => {
                const otherLeader = netLabelLeaderSegments(other);
                return boxIntersectsSegments(other.box, candidateLeader, 8)
                  || boxIntersectsSegments(candidate.box, otherLeader, 8)
                  || segmentSetsTooClose(candidateLeader, otherLeader, 4);
              });
              const blocksWire = captionIntersectsWire(candidate.box, routing.segments);
              const score = (inBounds ? 0 : 10000)
                + (blocksComponent ? 4000 : 0)
                + (blocksHeader ? 3000 : 0)
                + (blocksLabelBox ? 2500 : 0)
                + (blocksWire ? 1800 : 0)
                + (blocksLabelLeader ? 900 : 0)
                + distance + Math.abs(offset) * 0.1 + leaderDistance * 0.05;
              if (score < fallbackScore) {
                fallback = candidate;
                fallbackScore = score;
              }
              if (inBounds && !blocksComponent && !blocksHeader && !blocksLabelBox && !blocksLabelLeader && !blocksWire) {
                chosen = candidate;
                break;
              }
            }
            if (chosen) break;
          }
          if (chosen) break;
        }
        if (chosen) break;
      }
      placed.push(chosen || fallback);
    }
    return placed;
  }

  function renderNetLabel(geometry) {
    const { label, point, anchor, box, powerKind } = geometry;
    const global = label.scope === "global";
    const color = label.attrs.color && isColor(label.attrs.color)
      ? label.attrs.color
      : powerKind === "supply" ? "#15803d"
        : powerKind === "return" ? "#475569"
          : global ? "#6d28d9" : "#087f8c";
    const leader = netLabelLeaderPoints(geometry).map((leaderPoint, index) => {
      return `${index ? "L" : "M"} ${leaderPoint.x.toFixed(2)} ${leaderPoint.y.toFixed(2)}`;
    }).join(" ");
    const data = `data-label-scope="${label.scope}" data-label-kind="${powerKind || "signal"}" data-label-name="${escapeHtml(label.name)}" data-box-left="${box.left.toFixed(2)}" data-box-top="${box.top.toFixed(2)}" data-box-right="${box.right.toFixed(2)}" data-box-bottom="${box.bottom.toFixed(2)}"`;
    if (powerKind) {
      const centerX = (box.left + box.right) / 2;
      if (powerKind === "supply") {
        const tipY = box.top + 13;
        return `<g class="net-label power-net-label power-net-supply" ${data} style="color:${escapeHtml(color)}">
          <path d="${leader}" fill="none" stroke="currentColor" stroke-width="1.7"></path>
          <path d="M ${centerX.toFixed(2)} ${(box.bottom - 2).toFixed(2)} L ${centerX.toFixed(2)} ${tipY.toFixed(2)} M ${(centerX - 5).toFixed(2)} ${(tipY + 5).toFixed(2)} L ${centerX.toFixed(2)} ${tipY.toFixed(2)} L ${(centerX + 5).toFixed(2)} ${(tipY + 5).toFixed(2)}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
          <text x="${centerX.toFixed(2)}" y="${(box.top + 9).toFixed(2)}" text-anchor="middle" fill="currentColor">${escapeHtml(label.name)}</text>
        </g>`;
      }
      const groundY = box.top + 10;
      return `<g class="net-label power-net-label power-net-return" ${data} style="color:${escapeHtml(color)}">
        <path d="${leader}" fill="none" stroke="currentColor" stroke-width="1.7"></path>
        <path d="M ${centerX.toFixed(2)} ${(box.top + 2).toFixed(2)} L ${centerX.toFixed(2)} ${groundY.toFixed(2)} M ${(centerX - 6).toFixed(2)} ${groundY.toFixed(2)} L ${(centerX + 6).toFixed(2)} ${groundY.toFixed(2)} M ${(centerX - 4).toFixed(2)} ${(groundY + 4).toFixed(2)} L ${(centerX + 4).toFixed(2)} ${(groundY + 4).toFixed(2)} M ${(centerX - 2).toFixed(2)} ${(groundY + 8).toFixed(2)} L ${(centerX + 2).toFixed(2)} ${(groundY + 8).toFixed(2)}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>
        <text x="${centerX.toFixed(2)}" y="${(box.bottom - 2).toFixed(2)}" text-anchor="middle" fill="currentColor">${escapeHtml(label.name)}</text>
      </g>`;
    }
    const orientation = geometry.placementSide || point.side;
    const notch = 5;
    let points;
    if (orientation === "left") {
      points = `${box.right},${anchor.y} ${box.right - notch},${box.top} ${box.left},${box.top} ${box.left},${box.bottom} ${box.right - notch},${box.bottom}`;
    } else if (orientation === "top") {
      points = `${anchor.x},${box.bottom} ${box.left},${box.bottom - notch} ${box.left},${box.top} ${box.right},${box.top} ${box.right},${box.bottom - notch}`;
    } else if (orientation === "bottom") {
      points = `${anchor.x},${box.top} ${box.left},${box.top + notch} ${box.left},${box.bottom} ${box.right},${box.bottom} ${box.right},${box.top + notch}`;
    } else {
      points = `${box.left},${anchor.y} ${box.left + notch},${box.top} ${box.right},${box.top} ${box.right},${box.bottom} ${box.left + notch},${box.bottom}`;
    }
    const textX = (box.left + box.right) / 2 + (orientation === "left" ? -1 : orientation === "right" ? 1 : 0);
    const textY = (box.top + box.bottom) / 2 + 3.5;
    return `<g class="net-label net-label-${label.scope}" ${data} style="color:${escapeHtml(color)}">
      <path d="${leader}" fill="none" stroke="currentColor" stroke-width="1.7"></path>
      <polygon points="${points}" fill="${global ? "#f5f3ff" : "#ecfeff"}" stroke="currentColor" stroke-width="1.3"></polygon>
      <text x="${textX.toFixed(2)}" y="${textY.toFixed(2)}" text-anchor="middle" fill="currentColor"><tspan class="net-label-scope">${global ? "G" : "L"}</tspan><tspan dx="3">${escapeHtml(label.name)}</tspan></text>
    </g>`;
  }

  function renderNoConnectMarker(marker, circuit) {
    const component = circuit.componentByRef.get(marker.endpoint.ref);
    if (!component?.render) return "";
    const point = endpointPoint(component, marker.endpoint, "out");
    const size = 5;
    return `<g class="no-connect" data-no-connect="${escapeHtml(marker.endpoint.raw)}">
      <line x1="${point.x - size}" y1="${point.y - size}" x2="${point.x + size}" y2="${point.y + size}"></line>
      <line x1="${point.x - size}" y1="${point.y + size}" x2="${point.x + size}" y2="${point.y - size}"></line>
    </g>`;
  }

  function boxesOverlap(a, b, padding = 0) {
    return a.right + padding > b.left
      && a.left - padding < b.right
      && a.bottom + padding > b.top
      && a.top - padding < b.bottom;
  }

  function captionIntersectsWire(box, segments) {
    return boxIntersectsSegments(box, segments, 3);
  }

  function placeComponentCaptions(circuit, routing, size) {
    const placed = [];
    const components = [...circuit.components].sort((a, b) => (
      (b.render.pins?.length || 0) - (a.render.pins?.length || 0)
    ));
    for (const component of components) {
      const caption = componentCaption(component);
      component.render.captionBox = null;
      if (!caption || !component.symbol) continue;
      const render = component.render;
      const width = Math.max(28, caption.length * 7.2 + 8);
      const height = 16;
      const gap = 12;
      const centerX = render.x + render.width / 2;
      const centerY = render.y + render.height / 2;
      const makeBox = (left, top) => ({ left, top, right: left + width, bottom: top + height });
      const candidates = [
        makeBox(centerX - width / 2, render.y + render.height + gap),
        makeBox(render.x + render.width + gap, centerY - height / 2),
        makeBox(render.x - gap - width, centerY - height / 2),
        makeBox(centerX - width / 2, render.y - gap - height),
        makeBox(render.x + render.width + gap, render.y + render.height + gap),
        makeBox(render.x - gap - width, render.y + render.height + gap),
        makeBox(render.x + render.width + gap, render.y - gap - height),
        makeBox(render.x - gap - width, render.y - gap - height)
      ];
      for (const distance of [28, 48, 68, 88, 108, 128, 148, 168, 188, 208]) {
        candidates.push(makeBox(centerX - width / 2 + distance, render.y + render.height + gap));
        candidates.push(makeBox(centerX - width / 2 - distance, render.y + render.height + gap));
        candidates.push(makeBox(render.x + render.width + gap, centerY - height / 2 + distance));
        candidates.push(makeBox(render.x - gap - width, centerY - height / 2 + distance));
      }

      const isFree = (box) => box.left >= 4
        && box.top >= 4
        && box.right <= size.width - 4
        && box.bottom <= size.height - 4
        && !captionIntersectsWire(box, routing.segments)
        && !boxIntersectsSegments(box, routing.labelLeaders || [], 7)
        && !routing.obstacles.some((obstacle) => boxesOverlap(box, obstacle, 3))
        && !(routing.labelBoxes || []).some((labelBox) => boxesOverlap(box, labelBox, 5))
        && !placed.some((placedBox) => boxesOverlap(box, placedBox, 5));
      let chosen = candidates.find(isFree) || null;
      if (!chosen) {
        for (let radius = 24; radius <= 180 && !chosen; radius += 12) {
          for (let dx = -radius; dx <= radius && !chosen; dx += 12) {
            for (const dy of [-radius, radius]) {
              const box = makeBox(centerX + dx - width / 2, centerY + dy - height / 2);
              if (isFree(box)) {
                chosen = box;
                break;
              }
            }
          }
          for (let dy = -radius + 12; dy < radius && !chosen; dy += 12) {
            for (const dx of [-radius, radius]) {
              const box = makeBox(centerX + dx - width / 2, centerY + dy - height / 2);
              if (isFree(box)) {
                chosen = box;
                break;
              }
            }
          }
        }
      }
      if (!chosen) chosen = candidates[0];
      render.captionBox = chosen;
      placed.push(chosen);
    }
  }

  function renderFallbackSymbol(component) {
    const render = component.render;
    return `<g class="component" data-ref="${escapeHtml(component.ref)}" data-rotation="${render.rotation}" data-rotation-mode="${component.rotationExplicit ? "explicit" : "auto"}" style="color:${escapeHtml(componentColor(component))}">
      <rect class="fallback-symbol" x="${render.x}" y="${render.y}" width="${render.width}" height="${render.height}" rx="5"></rect>
      <text class="symbol-label" x="${render.x + render.width / 2}" y="${render.y + render.height / 2 - 6}" text-anchor="middle">${escapeHtml(component.ref)}</text>
      <text class="symbol-label" x="${render.x + render.width / 2}" y="${render.y + render.height / 2 + 12}" text-anchor="middle">${escapeHtml(component.symbolId)}</text>
    </g>`;
  }

  function renderComponent(component) {
    const render = component.render;
    if (!component.symbol) return renderFallbackSymbol(component);
    const [minX, minY, viewWidth, viewHeight] = render.viewBox;
    const caption = componentCaption(component);
    const captionBox = render.captionBox;
    const baseSymbolSvg = component.definition
      ? buildDefinedSymbol(component.definition, render.rotation).svg
      : component.symbol.svg;
    const symbolSvg = render.rotation
      ? `<g transform="rotate(${render.rotation})">${baseSymbolSvg}</g>`
      : baseSymbolSvg;
    return `<g class="component" data-ref="${escapeHtml(component.ref)}" data-rotation="${render.rotation}" data-rotation-mode="${component.rotationExplicit ? "explicit" : "auto"}" style="color:${escapeHtml(componentColor(component))}">
      <svg class="symbol-shell" x="${render.x.toFixed(2)}" y="${render.y.toFixed(2)}" width="${render.width.toFixed(2)}" height="${render.height.toFixed(2)}" viewBox="${minX} ${minY} ${viewWidth} ${viewHeight}" preserveAspectRatio="xMidYMid meet">
        ${symbolSvg}
      </svg>
      ${caption && captionBox ? `<text class="symbol-label" data-label-for="${escapeHtml(component.ref)}" data-box-left="${captionBox.left.toFixed(2)}" data-box-top="${captionBox.top.toFixed(2)}" data-box-right="${captionBox.right.toFixed(2)}" data-box-bottom="${captionBox.bottom.toFixed(2)}" x="${((captionBox.left + captionBox.right) / 2).toFixed(2)}" y="${(captionBox.top + 12).toFixed(2)}" text-anchor="middle">${escapeHtml(caption)}</text>` : ""}
    </g>`;
  }

  function renderGroupRegions(circuit) {
    return (circuit.groupBounds || []).map((bounds) => {
      const color = escapeHtml(bounds.color);
      const className = bounds.implicit ? "group-region group-region-implicit" : "group-region";
      const left = bounds.left.toFixed(2);
      const top = bounds.top.toFixed(2);
      const width = bounds.width.toFixed(2);
      const height = bounds.height.toFixed(2);
      return `<g class="${className}" data-group="${escapeHtml(bounds.name)}" data-direction="${bounds.direction}">
        <rect x="${left}" y="${top}" width="${width}" height="${height}" rx="4" stroke="${color}"></rect>
        <line x1="${(bounds.left + 14).toFixed(2)}" y1="${(bounds.top + 38).toFixed(2)}" x2="${(bounds.right - 14).toFixed(2)}" y2="${(bounds.top + 38).toFixed(2)}" stroke="${color}" stroke-opacity="0.38"></line>
        <text class="group-title" x="${(bounds.left + 16).toFixed(2)}" y="${(bounds.top + 25).toFixed(2)}">${escapeHtml(bounds.label)}</text>
        <text class="group-direction" x="${(bounds.right - 16).toFixed(2)}" y="${(bounds.top + 24).toFixed(2)}" text-anchor="end">${bounds.direction}</text>
      </g>`;
    }).join("\n");
  }

  function renderCircuitSvg(circuit, options = {}) {
    validateCircuit(circuit);
    const size = padCircuitForLabels(circuit, layoutCircuit(circuit));
    const routing = createRoutingContext(circuit, size);
    const nets = groupConnectionsIntoNets(circuit.connections);
    const wires = nets
      .map((net) => renderNet(net, circuit, routing))
      .join("\n");
    const labelGeometries = placeNetLabels(circuit, routing);
    routing.labelBoxes = labelGeometries.map((geometry) => geometry.box);
    routing.labelLeaders = labelGeometries.flatMap(netLabelLeaderSegments);
    placeComponentCaptions(circuit, routing, size);
    const components = circuit.components.map(renderComponent).join("\n");
    const groups = renderGroupRegions(circuit);
    const labels = labelGeometries.map(renderNetLabel).join("\n");
    const noConnects = circuit.noConnects.map((marker) => renderNoConnectMarker(marker, circuit)).join("\n");
    const title = options.title ? `<title>${escapeHtml(options.title)}</title>` : "";
    return `<svg class="diagram-svg circuit-svg" data-diagram-kind="circuit" data-net-count="${nets.length}" data-routing-failures="${escapeHtml(routing.failures.join(","))}" xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(size.width)}" height="${Math.ceil(size.height)}" viewBox="0 0 ${Math.ceil(size.width)} ${Math.ceil(size.height)}" role="img">
      ${title}
      <style>${STANDALONE_SVG_STYLE}</style>
      <rect x="0" y="0" width="${Math.ceil(size.width)}" height="${Math.ceil(size.height)}" fill="#ffffff"></rect>
      ${groups}
      ${wires}
      ${components}
      ${labels}
      ${noConnects}
    </svg>`;
  }

  function lineEquipmentColor(equipment) {
    if (equipment.attrs.color && isColor(equipment.attrs.color)) return equipment.attrs.color;
    if (["source", "isolator", "breaker", "rcd", "fuse", "spd"].includes(equipment.type)) return "#b91c1c";
    if (["transformer", "power_supply", "bus"].includes(equipment.type)) return "#6d28d9";
    if (["motor", "load", "contactor", "overload"].includes(equipment.type)) return "#0f766e";
    if (["relay", "protection_relay"].includes(equipment.type)) return "#c2410c";
    return "#334155";
  }

  function clippedLineText(value, maximum = 28) {
    const text = String(value || "");
    return text.length <= maximum ? text : `${text.slice(0, Math.max(1, maximum - 3))}...`;
  }

  function lineEquipmentDetail(equipment) {
    const attrs = equipment.attrs;
    const details = [];
    if (attrs.voltage) details.push(attrs.voltage);
    if (attrs.rating) details.push(attrs.rating);
    if (attrs.output) details.push(attrs.output);
    if (attrs.poles) details.push(`${attrs.poles}P`);
    if (attrs.phases) details.push(attrs.phases);
    if (attrs.curve) details.push(`curve ${attrs.curve}`);
    if (attrs.coil) details.push(`coil ${attrs.coil}`);
    if (attrs.function) details.push(attrs.function);
    return clippedLineText(details.join(" | "), 34);
  }

  function layoutLineDiagram(diagram) {
    const direction = normalizeLayoutDirection(diagram.layout?.attrs.direction, "TB") || "TB";
    const gap = boundedLayoutNumber(diagram.layout?.attrs.gap, 64, 28, 180);
    const rankGap = boundedLayoutNumber(diagram.layout?.attrs.rankgap, 52, 30, 180);
    const adjacency = new Map(diagram.equipment.map((item) => [item.ref, []]));
    const indegree = new Map(diagram.equipment.map((item) => [item.ref, 0]));
    const feederEquipment = new Set();
    for (const connection of diagram.connections) {
      if (!adjacency.has(connection.from) || !indegree.has(connection.to)) continue;
      adjacency.get(connection.from).push(connection.to);
      indegree.set(connection.to, indegree.get(connection.to) + 1);
      feederEquipment.add(connection.from);
      feederEquipment.add(connection.to);
    }

    const ranks = new Map();
    const queue = diagram.equipment.filter((item) => indegree.get(item.ref) === 0 && feederEquipment.has(item.ref));
    queue.forEach((item) => ranks.set(item.ref, 0));
    const remaining = new Map(indegree);
    while (queue.length) {
      const current = queue.shift();
      const rank = ranks.get(current.ref) || 0;
      for (const nextRef of adjacency.get(current.ref) || []) {
        ranks.set(nextRef, Math.max(ranks.get(nextRef) || 0, rank + 1));
        remaining.set(nextRef, remaining.get(nextRef) - 1);
        if (remaining.get(nextRef) === 0) queue.push(diagram.equipmentByRef.get(nextRef));
      }
    }
    for (let pass = 0; pass < diagram.controlLinks.length; pass += 1) {
      let changed = false;
      for (const link of diagram.controlLinks) {
        const fromRank = ranks.get(link.from);
        const toRank = ranks.get(link.to);
        if (fromRank !== undefined && toRank === undefined) {
          ranks.set(link.to, fromRank);
          changed = true;
        } else if (fromRank === undefined && toRank !== undefined) {
          ranks.set(link.from, toRank);
          changed = true;
        }
      }
      if (!changed) break;
    }
    const fallbackRank = Math.max(0, ...ranks.values()) + 1;
    for (const equipment of diagram.equipment) {
      if (!ranks.has(equipment.ref)) ranks.set(equipment.ref, fallbackRank);
    }

    const layers = [];
    for (const equipment of diagram.equipment) {
      const rank = ranks.get(equipment.ref);
      if (!layers[rank]) layers[rank] = [];
      layers[rank].push(equipment);
    }
    const populatedLayers = layers.filter(Boolean);
    const margin = { left: 64, right: 64, top: 64, bottom: 54 };
    const nodeWidth = direction === "TB" ? 230 : 190;
    const nodeHeight = direction === "TB" ? 92 : 122;
    const maximumAcross = Math.max(1, ...populatedLayers.map((layer) => layer.length));
    const acrossNodeExtent = direction === "TB" ? nodeWidth : nodeHeight;
    const acrossExtent = maximumAcross * acrossNodeExtent + Math.max(0, maximumAcross - 1) * gap;
    const rankExtent = populatedLayers.length * (direction === "TB" ? nodeHeight : nodeWidth)
      + Math.max(0, populatedLayers.length - 1) * rankGap;
    const width = direction === "TB"
      ? Math.max(760, margin.left + acrossExtent + margin.right)
      : Math.max(760, margin.left + rankExtent + margin.right);
    const height = direction === "TB"
      ? Math.max(520, margin.top + rankExtent + margin.bottom)
      : Math.max(520, margin.top + acrossExtent + margin.bottom);

    populatedLayers.forEach((layer, rank) => {
      const layerExtent = layer.length * (direction === "TB" ? nodeWidth : nodeHeight)
        + Math.max(0, layer.length - 1) * gap;
      const start = (direction === "TB" ? width : height) / 2 - layerExtent / 2;
      layer.forEach((equipment, index) => {
        const x = direction === "TB"
          ? start + index * (nodeWidth + gap)
          : margin.left + rank * (nodeWidth + rankGap);
        const y = direction === "TB"
          ? margin.top + rank * (nodeHeight + rankGap)
          : start + index * (nodeHeight + gap);
        const cx = direction === "TB" ? x + 48 : x + nodeWidth / 2;
        const cy = direction === "TB" ? y + 44 : y + 38;
        equipment.render = { x, y, width: nodeWidth, height: nodeHeight, cx, cy, rank };
      });
    });

    return { width, height, direction, gap, rankGap };
  }

  function lineEquipmentAnchors(equipment, direction) {
    const { cx, cy } = equipment.render;
    return direction === "TB"
      ? { input: { x: cx, y: cy - 36 }, output: { x: cx, y: cy + 36 } }
      : { input: { x: cx - 36, y: cy }, output: { x: cx + 36, y: cy } };
  }

  function lineEquipmentGlyph(equipment, direction) {
    const type = equipment.type;
    const common = `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
    const uprightMark = direction === "LR" ? ` transform="rotate(90)"` : "";
    if (type === "source") {
      return `<path d="M 0 -36 V -25 M 0 25 V 36" ${common}></path><circle cx="0" cy="0" r="25" fill="#fff" stroke="currentColor" stroke-width="2"></circle><path d="M -15 1 C -9 -10 -3 -10 2 1 C 7 12 12 12 16 1"${uprightMark} ${common}></path>`;
    }
    if (type === "isolator") {
      return `<path d="M 0 -36 V -12 M 0 12 V 36 M -2 -11 L 16 8" ${common}></path><circle cx="0" cy="-12" r="2.5" fill="#fff" stroke="currentColor" stroke-width="2"></circle><circle cx="0" cy="12" r="2.5" fill="#fff" stroke="currentColor" stroke-width="2"></circle>`;
    }
    if (type === "breaker") {
      return `<path d="M 0 -36 V -15 M 0 15 V 36 M 0 -14 L 14 12 M -6 -20 H 6 M -6 20 H 6" ${common}></path><circle cx="0" cy="-14" r="2.5" fill="#fff" stroke="currentColor" stroke-width="2"></circle><circle cx="0" cy="14" r="2.5" fill="#fff" stroke="currentColor" stroke-width="2"></circle>`;
    }
    if (type === "fuse") {
      return `<path d="M 0 -36 V -17 M 0 17 V 36" ${common}></path><rect x="-10" y="-17" width="20" height="34" rx="2" fill="#fff" stroke="currentColor" stroke-width="2"></rect><path d="M 0 -12 V 12" ${common}></path>`;
    }
    if (type === "rcd") {
      return `<path d="M 0 -36 V -25 M 0 25 V 36 M 0 -20 V 20" ${common}></path><rect x="-24" y="-25" width="48" height="50" rx="3" fill="#fff" stroke="currentColor" stroke-width="2"></rect><ellipse cx="0" cy="2" rx="9" ry="6" ${common}></ellipse><path d="M 12 -13 L 18 -3 L 8 -3 Z" ${common}></path>`;
    }
    if (type === "spd") {
      return `<path d="M 0 -36 V -23 M 0 23 V 36" ${common}></path><rect x="-22" y="-23" width="44" height="46" rx="3" fill="#fff" stroke="currentColor" stroke-width="2"></rect><path d="M 6 -17 L -7 2 H 1 L -6 17 L 12 -5 H 3 Z" ${common}></path>`;
    }
    if (type === "contactor") {
      return `<path d="M 0 -36 V -13 M 0 13 V 36 M -1 -12 L 14 9" ${common}></path><circle cx="0" cy="-13" r="2.5" fill="#fff" stroke="currentColor" stroke-width="2"></circle><circle cx="0" cy="13" r="2.5" fill="#fff" stroke="currentColor" stroke-width="2"></circle><path d="M -22 -8 C -30 -4 -30 4 -22 8 M -17 -8 C -9 -4 -9 4 -17 8" ${common}></path>`;
    }
    if (type === "relay") {
      return `<path d="M 0 -36 V -25 M 0 25 V 36" ${common}></path><rect x="-25" y="-25" width="50" height="50" rx="3" fill="#fff" stroke="currentColor" stroke-width="2"></rect><path d="M -16 10 C -23 6 -23 -6 -16 -10 M -10 10 C -3 6 -3 -6 -10 -10 M 4 -11 V 8 M 4 8 L 17 -6" ${common}></path><text x="10" y="17" font-size="8" font-weight="800" text-anchor="middle" fill="currentColor"${uprightMark}>K</text>`;
    }
    if (type === "protection_relay") {
      return `<path d="M 0 -36 V -26 M 0 26 V 36" ${common}></path><rect x="-27" y="-26" width="54" height="52" rx="3" fill="#fff" stroke="currentColor" stroke-width="2"></rect><path d="M -19 12 L -12 -7 L -5 7 L 2 -14 L 10 8 L 18 -5" ${common}></path><text x="0" y="20" font-size="8" font-weight="800" text-anchor="middle" fill="currentColor"${uprightMark}>PR</text>`;
    }
    if (type === "overload") {
      return `<path d="M 0 -36 V -22 M 0 22 V 36" ${common}></path><rect x="-22" y="-22" width="44" height="44" rx="3" fill="#fff" stroke="currentColor" stroke-width="2"></rect><path d="M -12 -7 C -7 -16 -2 -16 3 -7 C 8 2 13 2 16 -7 M -12 9 C -7 0 -2 0 3 9 C 8 18 13 18 16 9" ${common}></path>`;
    }
    if (type === "transformer") {
      return `<path d="M 0 -36 V -24 M 0 24 V 36" ${common}></path><circle cx="0" cy="-9" r="15" fill="#fff" stroke="currentColor" stroke-width="2"></circle><circle cx="0" cy="9" r="15" fill="#fff" stroke="currentColor" stroke-width="2"></circle>`;
    }
    if (type === "power_supply") {
      return `<path d="M 0 -36 V -24 M 0 24 V 36" ${common}></path><rect x="-25" y="-24" width="50" height="48" rx="3" fill="#fff" stroke="currentColor" stroke-width="2"></rect><path d="M -24 24 L 24 -24 M -17 -10 C -12 -17 -7 -17 -2 -10 C 3 -3 8 -3 13 -10 M 3 10 H 16 M 5 15 H 14" ${common}></path>`;
    }
    if (type === "bus") {
      return `<path d="M 0 -36 V 0 M 0 0 V 36" ${common}></path><path d="M -38 0 H 38" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"></path>`;
    }
    if (type === "terminal") {
      return `<path d="M 0 -36 V -9 M 0 9 V 36" ${common}></path><circle cx="0" cy="0" r="9" fill="#fff" stroke="currentColor" stroke-width="2"></circle>`;
    }
    if (type === "motor") {
      return `<path d="M 0 -36 V -25 M 0 25 V 36" ${common}></path><circle cx="0" cy="0" r="25" fill="#fff" stroke="currentColor" stroke-width="2"></circle><path d="M -11 10 V -10 L 0 3 L 11 -10 V 10"${uprightMark} ${common}></path>`;
    }
    if (type === "earth") {
      return `<path d="M 0 -36 V 4 M -14 4 H 14 M -9 10 H 9 M -4 16 H 4" ${common}></path>`;
    }
    if (type === "meter") {
      return `<path d="M 0 -36 V -25 M 0 25 V 36" ${common}></path><circle cx="0" cy="0" r="25" fill="#fff" stroke="currentColor" stroke-width="2"></circle><path d="M -12 9 L 11 -10 M -10 -12 A 17 17 0 0 1 12 -12" ${common}></path>`;
    }
    if (type === "load") {
      return `<path d="M 0 -36 V -23 M 0 23 V 36" ${common}></path><rect x="-24" y="-23" width="48" height="46" rx="3" fill="#fff" stroke="currentColor" stroke-width="2"></rect><path d="M -13 13 L -7 -13 L 0 13 L 7 -13 L 13 13" ${common}></path>`;
    }
    return `<path d="M 0 -36 V -23 M 0 23 V 36" ${common}></path><rect x="-24" y="-23" width="48" height="46" rx="3" fill="#fff" stroke="currentColor" stroke-width="2"></rect><path d="M -12 0 H 12" ${common}></path>`;
  }

  function renderLineEquipment(equipment, direction) {
    const render = equipment.render;
    const color = escapeHtml(lineEquipmentColor(equipment));
    const rotation = direction === "LR" ? ` transform="rotate(-90 ${render.cx} ${render.cy})"` : "";
    const label = clippedLineText(equipment.attrs.label || equipment.rawType.replace(/_/g, " "), direction === "TB" ? 25 : 28);
    const detail = lineEquipmentDetail(equipment);
    const text = direction === "TB"
      ? `<text class="line-equipment-ref" x="${(render.x + 94).toFixed(2)}" y="${(render.cy - 13).toFixed(2)}">${escapeHtml(equipment.ref)}</text>
        <text class="line-equipment-label" x="${(render.x + 94).toFixed(2)}" y="${(render.cy + 5).toFixed(2)}">${escapeHtml(label)}</text>
        ${detail ? `<text class="line-equipment-detail" x="${(render.x + 94).toFixed(2)}" y="${(render.cy + 22).toFixed(2)}">${escapeHtml(detail)}</text>` : ""}`
      : `<text class="line-equipment-ref" x="${render.cx.toFixed(2)}" y="${(render.y + 86).toFixed(2)}" text-anchor="middle">${escapeHtml(equipment.ref)}</text>
        <text class="line-equipment-label" x="${render.cx.toFixed(2)}" y="${(render.y + 103).toFixed(2)}" text-anchor="middle">${escapeHtml(label)}</text>
        ${detail ? `<text class="line-equipment-detail" x="${render.cx.toFixed(2)}" y="${(render.y + 118).toFixed(2)}" text-anchor="middle">${escapeHtml(detail)}</text>` : ""}`;
    return `<g class="line-equipment" data-ref="${escapeHtml(equipment.ref)}" data-type="${escapeHtml(equipment.type)}" data-box-left="${render.x.toFixed(2)}" data-box-top="${render.y.toFixed(2)}" data-box-right="${(render.x + render.width).toFixed(2)}" data-box-bottom="${(render.y + render.height).toFixed(2)}" style="color:${color}">
      <g${rotation} transform-origin="${render.cx.toFixed(2)}px ${render.cy.toFixed(2)}px" transform-box="fill-box">
        <g transform="translate(${render.cx.toFixed(2)} ${render.cy.toFixed(2)})">${lineEquipmentGlyph(equipment, direction)}</g>
      </g>
      ${text}
    </g>`;
  }

  function lineConnectionColor(connection, diagram) {
    if (connection.attrs.color && isColor(connection.attrs.color)) return connection.attrs.color;
    const source = diagram.equipmentByRef.get(connection.from);
    return source ? lineEquipmentColor(source) : "#334155";
  }

  function lineConnectionLabel(connection) {
    return connection.attrs.cable || connection.attrs.label || connection.attrs.conductors || "";
  }

  function renderLineConnections(diagram, layout) {
    const outgoing = new Map(diagram.equipment.map((item) => [item.ref, []]));
    for (const connection of diagram.connections) {
      if (outgoing.has(connection.from) && diagram.equipmentByRef.has(connection.to)) outgoing.get(connection.from).push(connection);
    }
    const rendered = [];
    for (const equipment of diagram.equipment) {
      const connections = outgoing.get(equipment.ref) || [];
      if (!connections.length) continue;
      const sourceAnchor = lineEquipmentAnchors(equipment, layout.direction).output;
      const targets = connections.map((connection) => ({
        connection,
        anchor: lineEquipmentAnchors(diagram.equipmentByRef.get(connection.to), layout.direction).input
      }));
      if (targets.length > 1) {
        const trunkColor = escapeHtml(lineEquipmentColor(equipment));
        if (layout.direction === "TB") {
          const split = (sourceAnchor.y + Math.min(...targets.map((target) => target.anchor.y))) / 2;
          const minX = Math.min(sourceAnchor.x, ...targets.map((target) => target.anchor.x));
          const maxX = Math.max(sourceAnchor.x, ...targets.map((target) => target.anchor.x));
          rendered.push(`<path class="line-feeder line-branch" data-from="${escapeHtml(equipment.ref)}" d="M ${sourceAnchor.x.toFixed(2)} ${sourceAnchor.y.toFixed(2)} V ${split.toFixed(2)} M ${minX.toFixed(2)} ${split.toFixed(2)} H ${maxX.toFixed(2)}" fill="none" stroke="${trunkColor}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="${sourceAnchor.x.toFixed(2)}" cy="${split.toFixed(2)}" r="3" fill="${trunkColor}"></circle>`);
          for (const target of targets) {
            const color = escapeHtml(lineConnectionColor(target.connection, diagram));
            rendered.push(`<path class="line-feeder" data-from="${escapeHtml(target.connection.from)}" data-to="${escapeHtml(target.connection.to)}" d="M ${target.anchor.x.toFixed(2)} ${split.toFixed(2)} V ${target.anchor.y.toFixed(2)}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round"></path>`);
          }
        } else {
          const split = (sourceAnchor.x + Math.min(...targets.map((target) => target.anchor.x))) / 2;
          const minY = Math.min(sourceAnchor.y, ...targets.map((target) => target.anchor.y));
          const maxY = Math.max(sourceAnchor.y, ...targets.map((target) => target.anchor.y));
          rendered.push(`<path class="line-feeder line-branch" data-from="${escapeHtml(equipment.ref)}" d="M ${sourceAnchor.x.toFixed(2)} ${sourceAnchor.y.toFixed(2)} H ${split.toFixed(2)} M ${split.toFixed(2)} ${minY.toFixed(2)} V ${maxY.toFixed(2)}" fill="none" stroke="${trunkColor}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="${split.toFixed(2)}" cy="${sourceAnchor.y.toFixed(2)}" r="3" fill="${trunkColor}"></circle>`);
          for (const target of targets) {
            const color = escapeHtml(lineConnectionColor(target.connection, diagram));
            rendered.push(`<path class="line-feeder" data-from="${escapeHtml(target.connection.from)}" data-to="${escapeHtml(target.connection.to)}" d="M ${split.toFixed(2)} ${target.anchor.y.toFixed(2)} H ${target.anchor.x.toFixed(2)}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round"></path>`);
          }
        }
        continue;
      }

      const target = targets[0];
      const connection = target.connection;
      const color = escapeHtml(lineConnectionColor(connection, diagram));
      let path;
      let labelX;
      let labelY;
      let labelAnchor;
      if (layout.direction === "TB") {
        const middle = (sourceAnchor.y + target.anchor.y) / 2;
        path = `M ${sourceAnchor.x.toFixed(2)} ${sourceAnchor.y.toFixed(2)} V ${middle.toFixed(2)} H ${target.anchor.x.toFixed(2)} V ${target.anchor.y.toFixed(2)}`;
        labelX = sourceAnchor.x - 8;
        labelY = middle - 5;
        labelAnchor = "end";
      } else {
        const middle = (sourceAnchor.x + target.anchor.x) / 2;
        path = `M ${sourceAnchor.x.toFixed(2)} ${sourceAnchor.y.toFixed(2)} H ${middle.toFixed(2)} V ${target.anchor.y.toFixed(2)} H ${target.anchor.x.toFixed(2)}`;
        labelX = middle;
        labelY = Math.min(sourceAnchor.y, target.anchor.y) - 8;
        labelAnchor = "middle";
      }
      const label = lineConnectionLabel(connection);
      rendered.push(`<path class="line-feeder" data-from="${escapeHtml(connection.from)}" data-to="${escapeHtml(connection.to)}" d="${path}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path>${label ? `<text class="line-edge-label" x="${labelX.toFixed(2)}" y="${labelY.toFixed(2)}" text-anchor="${labelAnchor}">${escapeHtml(label)}</text>` : ""}`);
    }
    return rendered.join("\n");
  }

  function lineControlLinkColor(link) {
    if (link.attrs.color && isColor(link.attrs.color)) return link.attrs.color;
    return link.kind === "feedback" ? "#0891b2" : "#d97706";
  }

  function lineControlLinkLabel(link) {
    return link.attrs.label || link.attrs.signal || link.attrs.contact || (link.kind === "feedback" ? "FEEDBACK" : "CONTROL");
  }

  function lineControlRoute(link, diagram, layout) {
    const from = diagram.equipmentByRef.get(link.from);
    const to = diagram.equipmentByRef.get(link.to);
    if (!from?.render || !to?.render) return null;
    const a = from.render;
    const b = to.render;
    const sameRank = a.rank === b.rank;
    const laneSign = link.kind === "feedback" ? 1 : -1;
    let points;
    let label;

    if (sameRank && layout.direction === "TB") {
      const rightward = a.cx < b.cx;
      const offsetY = link.kind === "feedback" ? 34 : -26;
      const start = { x: a.cx + (rightward ? 30 : -30), y: a.cy + offsetY };
      const end = { x: b.cx + (rightward ? -30 : 30), y: b.cy + offsetY };
      points = [start, end];
      label = {
        x: (start.x + end.x) / 2,
        y: start.y + (link.kind === "feedback" ? 11 : -6),
        anchor: "middle"
      };
    } else if (sameRank && layout.direction === "LR") {
      const downward = a.cy < b.cy;
      const offsetX = laneSign * 34;
      const start = { x: a.cx + offsetX, y: a.cy + (downward ? 30 : -30) };
      const end = { x: b.cx + offsetX, y: b.cy + (downward ? -30 : 30) };
      points = [start, end];
      label = {
        x: start.x + (laneSign < 0 ? -8 : 8),
        y: (start.y + end.y) / 2 - 4,
        anchor: laneSign < 0 ? "end" : "start"
      };
    } else {
      const dx = b.cx - a.cx;
      const dy = b.cy - a.cy;
      if (Math.abs(dx) >= Math.abs(dy)) {
        const rightward = dx >= 0;
        const start = { x: a.cx + (rightward ? 30 : -30), y: a.cy + laneSign * 20 };
        const end = { x: b.cx + (rightward ? -30 : 30), y: b.cy + laneSign * 20 };
        const middle = (start.x + end.x) / 2;
        points = [start, { x: middle, y: start.y }, { x: middle, y: end.y }, end];
        label = { x: middle, y: Math.min(start.y, end.y) - 7, anchor: "middle" };
      } else {
        const downward = dy >= 0;
        const start = { x: a.cx + laneSign * 20, y: a.cy + (downward ? 30 : -30) };
        const end = { x: b.cx + laneSign * 20, y: b.cy + (downward ? -30 : 30) };
        const middle = (start.y + end.y) / 2;
        points = [start, { x: start.x, y: middle }, { x: end.x, y: middle }, end];
        label = { x: (start.x + end.x) / 2, y: middle - 7, anchor: "middle" };
      }
    }
    return { points: simplifyOrthogonalPoints(points), label };
  }

  function lineControlArrow(points, color) {
    if (points.length < 2) return "";
    const tip = points.at(-1);
    const previous = points.at(-2);
    const dx = tip.x - previous.x;
    const dy = tip.y - previous.y;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    const baseX = tip.x - ux * 8;
    const baseY = tip.y - uy * 8;
    const px = -uy * 4;
    const py = ux * 4;
    return `<polygon points="${tip.x.toFixed(2)},${tip.y.toFixed(2)} ${(baseX + px).toFixed(2)},${(baseY + py).toFixed(2)} ${(baseX - px).toFixed(2)},${(baseY - py).toFixed(2)}" fill="${escapeHtml(color)}"></polygon>`;
  }

  function renderLineControlLinks(diagram, layout) {
    return diagram.controlLinks.map((link) => {
      const route = lineControlRoute(link, diagram, layout);
      if (!route?.points.length) return "";
      const color = lineControlLinkColor(link);
      const dash = link.kind === "feedback" ? "3 4" : "8 5";
      const path = route.points.map((point, index) => `${index ? "L" : "M"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
      const label = clippedLineText(lineControlLinkLabel(link), 24);
      return `<g class="line-control-link line-control-${link.kind}" data-link-kind="${link.kind}" data-from="${escapeHtml(link.from)}" data-to="${escapeHtml(link.to)}">
        <path d="${path}" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="${dash}" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="${path}" fill="none" stroke="${escapeHtml(color)}" stroke-width="2" stroke-dasharray="${dash}" stroke-linecap="round" stroke-linejoin="round"></path>
        ${lineControlArrow(route.points, color)}
        <text class="line-control-label" x="${route.label.x.toFixed(2)}" y="${route.label.y.toFixed(2)}" text-anchor="${route.label.anchor}" fill="${escapeHtml(color)}">${escapeHtml(label)}</text>
      </g>`;
    }).join("\n");
  }

  function renderLineDiagramSvg(diagram, options = {}) {
    const layout = layoutLineDiagram(diagram);
    const connections = renderLineConnections(diagram, layout);
    const controlLinks = renderLineControlLinks(diagram, layout);
    const equipment = diagram.equipment.map((item) => renderLineEquipment(item, layout.direction)).join("\n");
    const title = options.title ? `<title>${escapeHtml(options.title)}</title>` : "";
    return `<svg class="diagram-svg line-diagram-svg" data-diagram-kind="line" data-equipment-count="${diagram.equipment.length}" data-feeder-count="${diagram.connections.length}" data-control-count="${diagram.controlLinks.length}" data-routing-failures="" xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(layout.width)}" height="${Math.ceil(layout.height)}" viewBox="0 0 ${Math.ceil(layout.width)} ${Math.ceil(layout.height)}" role="img">
      ${title}
      <style>${STANDALONE_SVG_STYLE}</style>
      <rect x="0" y="0" width="${Math.ceil(layout.width)}" height="${Math.ceil(layout.height)}" fill="#ffffff"></rect>
      <text class="line-title" x="28" y="31">${escapeHtml(diagram.title)}</text>
      ${connections}
      ${controlLinks}
      ${equipment}
    </svg>`;
  }

  function layoutWiringDiagram(diagram) {
    const direction = normalizeLayoutDirection(diagram.layout?.attrs.direction, "LR") || "LR";
    const gap = boundedLayoutNumber(diagram.layout?.attrs.gap, 86, 36, 220);
    const rowGap = boundedLayoutNumber(diagram.layout?.attrs.rowgap, 118, 60, 260);
    const wrap = Math.max(1, Math.min(
      Math.max(1, diagram.devices.length),
      Math.floor(boundedLayoutNumber(diagram.layout?.attrs.wrap, 5, 1, Math.max(1, diagram.devices.length)))
    ));
    const maximumSideTerminals = Math.max(3, ...diagram.devices.map((device) => Math.max(
      device.terminals.filter((terminal) => terminal.side === "left").length,
      device.terminals.filter((terminal) => terminal.side === "right").length
    )));
    const maximumHorizontalTerminals = Math.max(2, ...diagram.devices.map((device) => Math.max(
      device.terminals.filter((terminal) => terminal.side === "top").length,
      device.terminals.filter((terminal) => terminal.side === "bottom").length
    )));
    const nodeWidth = Math.max(184, maximumHorizontalTerminals * 48 + 42);
    const nodeHeight = Math.max(136, maximumSideTerminals * 24 + 70);
    const itemCount = Math.max(1, diagram.devices.length);
    const columns = direction === "LR" ? Math.min(wrap, itemCount) : Math.ceil(itemCount / wrap);
    const rows = direction === "LR" ? Math.ceil(itemCount / wrap) : Math.min(wrap, itemCount);
    const margin = { left: 54, right: 54, top: 98, bottom: 104 };
    const width = Math.max(980, margin.left + columns * nodeWidth + Math.max(0, columns - 1) * gap + margin.right);
    const height = Math.max(620, margin.top + rows * nodeHeight + Math.max(0, rows - 1) * rowGap + margin.bottom);

    diagram.devices.forEach((device, index) => {
      const column = direction === "LR" ? index % wrap : Math.floor(index / wrap);
      const row = direction === "LR" ? Math.floor(index / wrap) : index % wrap;
      const x = margin.left + column * (nodeWidth + gap);
      const y = margin.top + row * (nodeHeight + rowGap);
      device.render = { x, y, width: nodeWidth, height: nodeHeight, cx: x + nodeWidth / 2, cy: y + nodeHeight / 2 };
      const sideGroups = { left: [], right: [], top: [], bottom: [] };
      for (const terminal of device.terminals) sideGroups[terminal.side].push(terminal);
      for (const side of ["left", "right"]) {
        const terminals = sideGroups[side];
        terminals.forEach((terminal, terminalIndex) => {
          const available = nodeHeight - 62;
          const terminalY = y + 48 + (terminalIndex + 1) * available / (terminals.length + 1);
          terminal.render = { x: side === "left" ? x : x + nodeWidth, y: terminalY, side };
        });
      }
      for (const side of ["top", "bottom"]) {
        const terminals = sideGroups[side];
        terminals.forEach((terminal, terminalIndex) => {
          const terminalX = x + 24 + (terminalIndex + 1) * (nodeWidth - 48) / (terminals.length + 1);
          terminal.render = { x: terminalX, y: side === "top" ? y : y + nodeHeight, side };
        });
      }
    });
    return { width, height, direction, gap, rowGap, wrap, margin, nodeWidth, nodeHeight };
  }

  function wiringTerminalPoint(diagram, endpoint, laneOffset = 0) {
    const device = diagram.deviceByRef.get(endpoint.ref);
    const terminal = device?.terminalById.get(endpoint.terminal.toLowerCase());
    if (!terminal?.render) return null;
    const point = { ...terminal.render };
    if (point.side === "left" || point.side === "right") point.y += laneOffset;
    else point.x += laneOffset;
    return point;
  }

  function wiringRoutingObstacle(device) {
    const render = device.render;
    const clearance = 15;
    return {
      left: render.x - clearance,
      right: render.x + render.width + clearance,
      top: render.y - clearance,
      bottom: render.y + render.height + clearance
    };
  }

  function wiringTerminalStub(point, device) {
    const obstacle = wiringRoutingObstacle(device);
    if (point.side === "left") return { x: obstacle.left - 2, y: point.y };
    if (point.side === "right") return { x: obstacle.right + 2, y: point.y };
    if (point.side === "top") return { x: point.x, y: obstacle.top - 2 };
    return { x: point.x, y: obstacle.bottom + 2 };
  }

  function createWiringRoutingContext(diagram, layout) {
    const endpointWires = new Map();
    for (const wire of diagram.wires) {
      for (const side of ["from", "to"]) {
        const endpoint = wire[side];
        const endpointKey = `${endpoint.ref.toLowerCase()}.${endpoint.terminal.toLowerCase()}`;
        const entries = endpointWires.get(endpointKey) || [];
        entries.push({ wireIndex: wire.index, side });
        endpointWires.set(endpointKey, entries);
      }
    }
    const endpointLanes = new Map();
    for (const entries of endpointWires.values()) {
      entries.forEach((entry, index) => {
        const centeredIndex = index - (entries.length - 1) / 2;
        endpointLanes.set(`${entry.wireIndex}:${entry.side}`, centeredIndex * 8);
      });
    }
    const reservedAreas = [
      { left: 18, right: layout.width - 18, top: 18, bottom: 66 },
      { left: 18, right: layout.width - 18, top: layout.height - 76, bottom: layout.height - 18 }
    ];
    return {
      width: layout.width,
      height: layout.height,
      obstacles: [...diagram.devices.map(wiringRoutingObstacle), ...reservedAreas],
      usedCells: new Map(),
      usedEdges: new Map(),
      segments: [],
      failures: [],
      labelBoxes: [],
      endpointLanes
    };
  }

  function routeWiringWire(wire, diagram, routing) {
    const fromDevice = diagram.deviceByRef.get(wire.from.ref);
    const toDevice = diagram.deviceByRef.get(wire.to.ref);
    const startLane = routing.endpointLanes.get(`${wire.index}:from`) || 0;
    const endLane = routing.endpointLanes.get(`${wire.index}:to`) || 0;
    const start = wiringTerminalPoint(diagram, wire.from, startLane);
    const end = wiringTerminalPoint(diagram, wire.to, endLane);
    if (!fromDevice || !toDevice || !start || !end) return null;
    const startStub = wiringTerminalStub(start, fromDevice);
    const endStub = wiringTerminalStub(end, toDevice);
    const netId = `physical-wire-${wire.index}`;
    const startHorizontal = start.side === "left" || start.side === "right";
    const endHorizontal = end.side === "left" || end.side === "right";
    const route = routeWithFewBends(startStub, endStub, routing, netId)
      || routeOrthogonally(startStub, endStub, routing, netId, startHorizontal, endHorizontal);
    if (!route?.length) {
      routing.failures.push(`${wire.from.raw}->${wire.to.raw}`);
      return simplifyOrthogonalPoints([start, startStub, endStub, end]);
    }
    const points = [start, startStub];
    const routeStart = route[0];
    if (!pointEqual(startStub, routeStart)) {
      points.push(startHorizontal ? { x: routeStart.x, y: startStub.y } : { x: startStub.x, y: routeStart.y });
    }
    points.push(...route);
    const routeEnd = route.at(-1);
    if (!pointEqual(routeEnd, endStub)) {
      points.push(endHorizontal ? { x: routeEnd.x, y: endStub.y } : { x: endStub.x, y: routeEnd.y });
    }
    points.push(endStub, end);
    const simplified = simplifyOrthogonalPoints(points);
    registerRoutingSegments(simplified, routing, netId);
    return simplified;
  }

  function wiringWireColor(wire) {
    const value = wire.attrs.color || "BK";
    return WIRING_COLOR_CODES[String(value).toUpperCase()] || value;
  }

  function wiringWireLabelGeometry(points, labelWidth, routing) {
    const candidates = [];
    for (let index = 1; index < points.length; index += 1) {
      const segment = segmentFromPoints(points[index - 1], points[index]);
      if (!segment) continue;
      candidates.push({ segment, length: segment.end - segment.start });
    }
    const geometries = [];
    for (const { segment } of candidates.sort((a, b) => b.length - a.length)) {
      for (const fraction of [0.5, 0.32, 0.68]) {
        if (segment.orientation === "horizontal") {
          const x = segment.start + (segment.end - segment.start) * fraction;
          for (const offset of [-7, 15, -23, 31, -39, 47]) {
            const y = segment.constant + offset;
            geometries.push({
              x,
              y,
              anchor: "middle",
              box: { left: x - labelWidth / 2, top: y - 11, right: x + labelWidth / 2, bottom: y + 3 }
            });
          }
        } else {
          const y = segment.start + (segment.end - segment.start) * fraction + 3;
          for (const offset of [7, -7, 23, -23, 39, -39]) {
            const x = segment.constant + offset;
            const anchor = offset > 0 ? "start" : "end";
            const left = offset > 0 ? x - 3 : x + 3 - labelWidth;
            geometries.push({
              x,
              y,
              anchor,
              box: { left, top: y - 11, right: left + labelWidth, bottom: y + 3 }
            });
          }
        }
      }
    }
    const isFree = (geometry) => geometry.box.left >= 22
      && geometry.box.top >= 22
      && geometry.box.right <= routing.width - 22
      && geometry.box.bottom <= routing.height - 22
      && !routing.obstacles.some((obstacle) => boxesOverlap(geometry.box, obstacle, 2))
      && !routing.labelBoxes.some((box) => boxesOverlap(geometry.box, box, 4))
      && !boxIntersectsSegments(geometry.box, routing.segments, 1);
    const choice = geometries.find(isFree) || geometries[0] || {
      x: points[0]?.x || 0,
      y: (points[0]?.y || 0) - 6,
      anchor: "middle",
      box: {
        left: (points[0]?.x || 0) - labelWidth / 2,
        top: (points[0]?.y || 0) - 17,
        right: (points[0]?.x || 0) + labelWidth / 2,
        bottom: (points[0]?.y || 0) - 3
      }
    };
    routing.labelBoxes.push(choice.box);
    return choice;
  }

  function renderWiringWire(wire, diagram, routing, routedPoints = null) {
    const points = routedPoints || routeWiringWire(wire, diagram, routing);
    if (!points?.length) return "";
    const path = points.map((point, index) => `${index ? "L" : "M"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
    const color = wiringWireColor(wire);
    const colorCode = wire.attrs.color || "BK";
    const wireNumber = wiringWireNumber(wire) || `W${wire.index + 1}`;
    const label = clippedLineText(wireNumber, 18);
    const labelWidth = Math.max(28, label.length * 6 + 10);
    const labelGeometry = wiringWireLabelGeometry(points, labelWidth, routing);
    const labelLeft = labelGeometry.box.left;
    const labelTop = labelGeometry.box.top;
    const greenYellow = String(colorCode).toUpperCase() === "GNYE";
    const detail = [wireNumber, colorCode, wire.attrs.size, wire.attrs.ferrule].filter(Boolean).join(" | ");
    return `<g class="wiring-wire" data-wire="${escapeHtml(wireNumber)}" data-from="${escapeHtml(wire.from.raw)}" data-to="${escapeHtml(wire.to.raw)}">
      <title>${escapeHtml(`${wire.from.raw} to ${wire.to.raw}${detail ? ` | ${detail}` : ""}`)}</title>
      <path d="${path}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></path>
      ${greenYellow ? `<path d="${path}" fill="none" stroke="#eab308" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>` : ""}
      <path d="${path}" fill="none" stroke="${escapeHtml(color)}" stroke-width="2.4" stroke-dasharray="${greenYellow ? "9 5" : "none"}" stroke-linecap="round" stroke-linejoin="round"></path>
      <rect x="${labelLeft.toFixed(2)}" y="${labelTop.toFixed(2)}" width="${labelWidth.toFixed(2)}" height="14" rx="2" fill="#fff" stroke="#cbd5e1" stroke-width="0.8"></rect>
      <text class="wiring-wire-label" x="${labelGeometry.x.toFixed(2)}" y="${labelGeometry.y.toFixed(2)}" text-anchor="${labelGeometry.anchor}">${escapeHtml(label)}</text>
    </g>`;
  }

  function renderWiringTerminal(terminal, device) {
    const point = terminal.render;
    if (!point) return "";
    let textX = point.x;
    let textY = point.y + 3;
    let anchor = "middle";
    if (point.side === "left") {
      textX += 12;
      anchor = "start";
    } else if (point.side === "right") {
      textX -= 12;
      anchor = "end";
    } else if (point.side === "top") {
      textY = device.render.y + 58;
    } else {
      textY = device.render.y + device.render.height - 9;
    }
    return `<g class="wiring-terminal" data-device="${escapeHtml(device.ref)}" data-terminal="${escapeHtml(terminal.id)}">
      <circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="4.2" fill="#fff" stroke="#172033" stroke-width="1.5"></circle>
      <text class="wiring-terminal-label" x="${textX.toFixed(2)}" y="${textY.toFixed(2)}" text-anchor="${anchor}">${escapeHtml(terminal.label)}</text>
    </g>`;
  }

  function renderWiringDevice(device) {
    const render = device.render;
    const label = clippedLineText(device.attrs.label || device.rawType.replace(/_/g, " "), 28);
    const typeLabel = clippedLineText(device.type.replace(/_/g, " ").toUpperCase(), 24);
    const terminals = device.terminals.map((terminal) => renderWiringTerminal(terminal, device)).join("\n");
    return `<g class="wiring-device" data-ref="${escapeHtml(device.ref)}" data-type="${escapeHtml(device.type)}" data-box-left="${render.x.toFixed(2)}" data-box-top="${render.y.toFixed(2)}" data-box-right="${(render.x + render.width).toFixed(2)}" data-box-bottom="${(render.y + render.height).toFixed(2)}">
      <rect x="${render.x.toFixed(2)}" y="${render.y.toFixed(2)}" width="${render.width.toFixed(2)}" height="${render.height.toFixed(2)}" rx="4" fill="#f8fafc" stroke="#334155" stroke-width="1.6"></rect>
      <line x1="${(render.x + 10).toFixed(2)}" y1="${(render.y + 45).toFixed(2)}" x2="${(render.x + render.width - 10).toFixed(2)}" y2="${(render.y + 45).toFixed(2)}" stroke="#cbd5e1" stroke-width="1"></line>
      <text class="wiring-device-ref" x="${render.cx.toFixed(2)}" y="${(render.y + 19).toFixed(2)}" text-anchor="middle">${escapeHtml(device.ref)}</text>
      <text class="wiring-device-label" x="${render.cx.toFixed(2)}" y="${(render.y + 36).toFixed(2)}" text-anchor="middle">${escapeHtml(label)}</text>
      <text class="wiring-device-type" x="${render.cx.toFixed(2)}" y="${(render.cy + 7).toFixed(2)}" text-anchor="middle">${escapeHtml(typeLabel)}</text>
      ${terminals}
    </g>`;
  }

  function renderWiringTitleBlock(diagram, layout) {
    const footerTop = layout.height - 76;
    const right = layout.width - 18;
    return `<g class="wiring-page-frame">
      <rect x="18" y="18" width="${(layout.width - 36).toFixed(2)}" height="${(layout.height - 36).toFixed(2)}" fill="none" stroke="#172033" stroke-width="1.8"></rect>
      <text class="wiring-title" x="32" y="44">${escapeHtml(diagram.title)}</text>
      <line x1="18" y1="${footerTop.toFixed(2)}" x2="${right.toFixed(2)}" y2="${footerTop.toFixed(2)}" stroke="#172033" stroke-width="1.4"></line>
      <line x1="${(layout.width * 0.58).toFixed(2)}" y1="${footerTop.toFixed(2)}" x2="${(layout.width * 0.58).toFixed(2)}" y2="${(layout.height - 18).toFixed(2)}" stroke="#172033" stroke-width="1"></line>
      <line x1="${(layout.width * 0.82).toFixed(2)}" y1="${footerTop.toFixed(2)}" x2="${(layout.width * 0.82).toFixed(2)}" y2="${(layout.height - 18).toFixed(2)}" stroke="#172033" stroke-width="1"></line>
      <text class="wiring-device-ref" x="32" y="${(footerTop + 22).toFixed(2)}">PANEL WIRING</text>
      <text class="wiring-title-small" x="32" y="${(footerTop + 42).toFixed(2)}">Terminal-to-terminal assembly drawing</text>
      <text class="wiring-device-ref" x="${(layout.width * 0.6).toFixed(2)}" y="${(footerTop + 22).toFixed(2)}">${diagram.devices.length} DEVICES / ${diagram.wires.length} WIRES</text>
      <text class="wiring-title-small" x="${(layout.width * 0.6).toFixed(2)}" y="${(footerTop + 42).toFixed(2)}">Wire labels: number | color | size in source</text>
      <text class="wiring-device-ref" x="${(layout.width * 0.84).toFixed(2)}" y="${(footerTop + 22).toFixed(2)}">SHEET 1</text>
      <text class="wiring-title-small" x="${(layout.width * 0.84).toFixed(2)}" y="${(footerTop + 42).toFixed(2)}">VERIFY BEFORE WIRING</text>
    </g>`;
  }

  function renderWiringDiagramSvg(diagram, options = {}) {
    const layout = layoutWiringDiagram(diagram);
    const routing = createWiringRoutingContext(diagram, layout);
    const routedWires = diagram.wires.map((wire) => ({
      wire,
      points: routeWiringWire(wire, diagram, routing)
    }));
    const wires = routedWires.map(({ wire, points }) => (
      renderWiringWire(wire, diagram, routing, points)
    )).join("\n");
    const devices = diagram.devices.map(renderWiringDevice).join("\n");
    const frame = renderWiringTitleBlock(diagram, layout);
    const title = options.title ? `<title>${escapeHtml(options.title)}</title>` : "";
    return `<svg class="diagram-svg wiring-diagram-svg" data-diagram-kind="wiring" data-device-count="${diagram.devices.length}" data-wire-count="${diagram.wires.length}" data-routing-failures="${escapeHtml(routing.failures.join(","))}" xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(layout.width)}" height="${Math.ceil(layout.height)}" viewBox="0 0 ${Math.ceil(layout.width)} ${Math.ceil(layout.height)}" role="img">
      ${title}
      <style>${STANDALONE_SVG_STYLE}</style>
      <rect x="0" y="0" width="${Math.ceil(layout.width)}" height="${Math.ceil(layout.height)}" fill="#ffffff"></rect>
      ${frame}
      ${wires}
      ${devices}
    </svg>`;
  }

  function waveformSignalValue(signal, normalizedTime, time) {
    const attrs = signal.attrs;
    const cycles = waveformNumber(attrs, "cycles", 1);
    const phase = waveformNumber(attrs, "phase", 0) / 360;
    const cyclePosition = ((normalizedTime * cycles + phase) % 1 + 1) % 1;
    const low = waveformNumber(attrs, "low", waveformNumber(attrs, "min", 0));
    const high = waveformNumber(attrs, "high", waveformNumber(attrs, "max", 1));
    const actualTime = time.start + normalizedTime * (time.end - time.start);

    if (signal.type === "sine") {
      const amplitude = waveformNumber(attrs, "amplitude", 1);
      const offset = waveformNumber(attrs, "offset", 0);
      return offset + amplitude * Math.sin(2 * Math.PI * (normalizedTime * cycles + phase));
    }
    if (signal.type === "square") {
      return cyclePosition < waveformNumber(attrs, "duty", 50) / 100 ? high : low;
    }
    if (signal.type === "triangle") {
      const triangle = 1 - Math.abs(2 * cyclePosition - 1);
      return low + (high - low) * triangle;
    }
    if (signal.type === "sawtooth") return low + (high - low) * cyclePosition;
    if (signal.type === "pulse") {
      if (attrs.at !== undefined || attrs.width !== undefined) {
        const at = waveformNumber(attrs, "at", time.start + (time.end - time.start) * 0.25);
        const width = waveformNumber(attrs, "width", (time.end - time.start) * 0.2);
        return actualTime >= at && actualTime < at + width ? high : low;
      }
      return cyclePosition < waveformNumber(attrs, "duty", 25) / 100 ? high : low;
    }
    if (signal.type === "dc") return waveformNumber(attrs, "value", waveformNumber(attrs, "level", 1));
    if (signal.type === "step") {
      const at = waveformNumber(attrs, "at", time.start + (time.end - time.start) / 2);
      return actualTime < at ? low : high;
    }
    if (signal.type === "exponential") {
      const from = waveformNumber(attrs, "from", 0);
      const to = waveformNumber(attrs, "to", 1);
      const tau = Math.max(1e-9, waveformNumber(attrs, "tau", (time.end - time.start) / 5));
      const delay = waveformNumber(attrs, "delay", 0);
      const elapsed = Math.max(0, actualTime - time.start - delay);
      return from + (to - from) * (1 - Math.exp(-elapsed / tau));
    }
    return 0;
  }

  function waveformSignalBounds(signal) {
    const attrs = signal.attrs;
    if (signal.type === "sine") {
      const amplitude = Math.abs(waveformNumber(attrs, "amplitude", 1));
      const offset = waveformNumber(attrs, "offset", 0);
      return { min: offset - amplitude, max: offset + amplitude };
    }
    if (["square", "triangle", "sawtooth", "pulse", "step"].includes(signal.type)) {
      const first = waveformNumber(attrs, "low", waveformNumber(attrs, "min", 0));
      const second = waveformNumber(attrs, "high", waveformNumber(attrs, "max", 1));
      return { min: Math.min(first, second), max: Math.max(first, second) };
    }
    if (signal.type === "exponential") {
      const first = waveformNumber(attrs, "from", 0);
      const second = waveformNumber(attrs, "to", 1);
      return { min: Math.min(first, second), max: Math.max(first, second) };
    }
    const value = waveformNumber(attrs, "value", waveformNumber(attrs, "level", 1));
    return { min: value, max: value };
  }

  function waveformFormatValue(value) {
    if (!Number.isFinite(value)) return "-";
    if (Math.abs(value) >= 100 || Number.isInteger(value)) return String(Math.round(value * 100) / 100);
    return String(Math.round(value * 1000) / 1000);
  }

  function waveformTrace(signal, diagram, geometry) {
    const bounds = waveformSignalBounds(signal);
    const flat = Math.abs(bounds.max - bounds.min) < 1e-9;
    const renderMin = flat ? bounds.min - 1 : bounds.min;
    const renderMax = flat ? bounds.max + 1 : bounds.max;
    const samples = 360;
    const points = [];
    const discontinuous = ["square", "sawtooth", "pulse", "step"].includes(signal.type);
    let previous = null;
    for (let index = 0; index <= samples; index += 1) {
      const normalizedTime = index / samples;
      const value = waveformSignalValue(signal, normalizedTime, diagram.time);
      const x = geometry.left + normalizedTime * geometry.width;
      const y = geometry.top + 15 + (renderMax - value) / (renderMax - renderMin) * (geometry.height - 30);
      if (discontinuous && previous && Math.abs(value - previous.value) > Math.abs(renderMax - renderMin) * 0.4) {
        points.push({ x, y: previous.y, value: previous.value });
      }
      points.push({ x, y, value });
      previous = { x, y, value };
    }
    const path = points.map((point, index) => `${index ? "L" : "M"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
    return { path, bounds, flat };
  }

  function renderWaveformSignal(signal, diagram, geometry) {
    const trace = waveformTrace(signal, diagram, geometry);
    const color = signal.attrs.color || DEFAULT_WAVEFORM_COLORS[signal.index % DEFAULT_WAVEFORM_COLORS.length];
    const label = clippedLineText(signal.attrs.label || signal.ref, 28);
    const unit = signal.attrs.unit || "";
    const topValue = `${waveformFormatValue(trace.bounds.max)}${unit}`;
    const bottomValue = trace.flat ? "" : `${waveformFormatValue(trace.bounds.min)}${unit}`;
    const middleY = geometry.top + geometry.height / 2;
    return `<g class="waveform-signal" data-signal="${escapeHtml(signal.ref)}" data-type="${escapeHtml(signal.type)}">
      <line x1="${geometry.left.toFixed(2)}" y1="${(geometry.top + 15).toFixed(2)}" x2="${(geometry.left + geometry.width).toFixed(2)}" y2="${(geometry.top + 15).toFixed(2)}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3 4"></line>
      <line x1="${geometry.left.toFixed(2)}" y1="${middleY.toFixed(2)}" x2="${(geometry.left + geometry.width).toFixed(2)}" y2="${middleY.toFixed(2)}" stroke="#cbd5e1" stroke-width="1"></line>
      <line x1="${geometry.left.toFixed(2)}" y1="${(geometry.top + geometry.height - 15).toFixed(2)}" x2="${(geometry.left + geometry.width).toFixed(2)}" y2="${(geometry.top + geometry.height - 15).toFixed(2)}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3 4"></line>
      <text class="waveform-ref" x="30" y="${(geometry.top + 27).toFixed(2)}">${escapeHtml(signal.ref)}</text>
      <text class="waveform-label" x="30" y="${(geometry.top + 46).toFixed(2)}">${escapeHtml(label)}</text>
      <text class="waveform-type" x="30" y="${(geometry.top + 68).toFixed(2)}">${escapeHtml(signal.type.toUpperCase())}</text>
      <text class="waveform-value" x="${(geometry.left - 10).toFixed(2)}" y="${(geometry.top + 18).toFixed(2)}" text-anchor="end">${escapeHtml(topValue)}</text>
      ${bottomValue ? `<text class="waveform-value" x="${(geometry.left - 10).toFixed(2)}" y="${(geometry.top + geometry.height - 12).toFixed(2)}" text-anchor="end">${escapeHtml(bottomValue)}</text>` : ""}
      <path d="${trace.path}" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path>
      <path class="waveform-trace" d="${trace.path}" fill="none" stroke="${escapeHtml(color)}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path>
    </g>`;
  }

  function renderWaveformDiagramSvg(diagram, options = {}) {
    const width = 1100;
    const plotLeft = 180;
    const plotRight = 1040;
    const plotWidth = plotRight - plotLeft;
    const laneHeight = 92;
    const laneGap = 8;
    const plotTop = 78;
    const laneCount = Math.max(1, diagram.signals.length);
    const plotBottom = plotTop + laneCount * laneHeight + Math.max(0, laneCount - 1) * laneGap;
    const height = plotBottom + 62;
    const time = diagram.time;
    const duration = Math.max(1e-9, time.end - time.start);
    const title = options.title ? `<title>${escapeHtml(options.title)}</title>` : "";
    const divisions = Math.max(2, Math.min(20, Number.isInteger(time.divisions) ? time.divisions : 10));
    const grid = Array.from({ length: divisions + 1 }, (_, index) => {
      const fraction = index / divisions;
      const x = plotLeft + fraction * plotWidth;
      const value = time.start + fraction * duration;
      return `<line x1="${x.toFixed(2)}" y1="${plotTop}" x2="${x.toFixed(2)}" y2="${plotBottom}" stroke="#e2e8f0" stroke-width="1"></line>
        <text class="waveform-time" x="${x.toFixed(2)}" y="${(plotBottom + 26).toFixed(2)}" text-anchor="middle">${escapeHtml(waveformFormatValue(value))}</text>`;
    }).join("\n");
    const bands = diagram.signals.map((signal, index) => {
      const top = plotTop + index * (laneHeight + laneGap);
      return `<rect x="18" y="${top.toFixed(2)}" width="1064" height="${laneHeight}" fill="${index % 2 ? "#ffffff" : "#f8fafc"}"></rect>`;
    }).join("\n");
    const signals = diagram.signals.map((signal, index) => renderWaveformSignal(signal, diagram, {
      left: plotLeft,
      width: plotWidth,
      top: plotTop + index * (laneHeight + laneGap),
      height: laneHeight
    })).join("\n");
    const markers = diagram.markers.map((marker, index) => {
      const at = Number(marker.attrs.at);
      if (!Number.isFinite(at)) return "";
      const fraction = (at - time.start) / duration;
      const x = plotLeft + fraction * plotWidth;
      const color = marker.attrs.color || "#475569";
      const label = clippedLineText(marker.attrs.label || marker.id, 20);
      const labelY = 68 - (index % 2) * 13;
      return `<g class="waveform-time-marker" data-marker="${escapeHtml(marker.id)}" data-at="${escapeHtml(at)}">
        <line x1="${x.toFixed(2)}" y1="${plotTop}" x2="${x.toFixed(2)}" y2="${plotBottom}" stroke="${escapeHtml(color)}" stroke-width="1.4" stroke-dasharray="6 5"></line>
        <path d="M ${(x - 4).toFixed(2)} ${plotTop} L ${(x + 4).toFixed(2)} ${plotTop} L ${x.toFixed(2)} ${(plotTop + 6).toFixed(2)} Z" fill="${escapeHtml(color)}"></path>
        <text class="waveform-marker" x="${x.toFixed(2)}" y="${labelY}" text-anchor="middle">${escapeHtml(label)} @ ${escapeHtml(waveformFormatValue(at))}${escapeHtml(time.unit)}</text>
      </g>`;
    }).join("\n");
    return `<svg class="diagram-svg waveform-diagram-svg" data-diagram-kind="waveform" data-signal-count="${diagram.signals.length}" data-marker-count="${diagram.markers.length}" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${Math.ceil(height)}" viewBox="0 0 ${width} ${Math.ceil(height)}" role="img">
      ${title}
      <style>${STANDALONE_SVG_STYLE}</style>
      <rect x="0" y="0" width="${width}" height="${Math.ceil(height)}" fill="#ffffff"></rect>
      <text class="waveform-title" x="24" y="32">${escapeHtml(diagram.title)}</text>
      <text class="waveform-subtitle" x="24" y="51">Idealized teaching shapes - not measured or simulated data</text>
      ${bands}
      <g class="waveform-grid">${grid}</g>
      ${signals}
      ${markers}
      <line x1="${plotLeft}" y1="${plotBottom}" x2="${plotRight}" y2="${plotBottom}" stroke="#334155" stroke-width="1.4"></line>
      <text class="waveform-time" x="${plotRight}" y="${(plotBottom + 47).toFixed(2)}" text-anchor="end">TIME (${escapeHtml(time.unit)})</text>
      <rect x="18" y="${plotTop}" width="1064" height="${(plotBottom - plotTop).toFixed(2)}" fill="none" stroke="#94a3b8" stroke-width="1.2"></rect>
    </svg>`;
  }

  function renderDiagnostics(diagnostics) {
    if (!diagnostics.length) return "";
    return `<div class="diagnostics">${diagnostics.map((diag) => (
      `<p class="diagnostic ${diag.severity === "error" ? "error" : ""}">line ${diag.line}: ${escapeHtml(diag.message)}</p>`
    )).join("")}</div>`;
  }

  function isLineDiagramLanguage(language) {
    return ["line", "line-diagram", "singleline", "single-line", "one-line"].includes(String(language || "").toLowerCase());
  }

  function isWiringDiagramLanguage(language) {
    return ["wiring", "panel-wiring"].includes(String(language || "").toLowerCase());
  }

  function isWaveformDiagramLanguage(language) {
    return ["waveform", "waveforms"].includes(String(language || "").toLowerCase());
  }

  function renderMarkdownCircuits(markdown, container) {
    const blocks = extractDiagramBlocks(markdown);
    if (!blocks.length) {
      container.innerHTML = `<div class="empty-state">Type Markdown with a circuit, line, wiring, or waveform code block to render a diagram.</div>`;
      return { blockCount: 0, diagnosticCount: 0, missingLibraries: [] };
    }

    const diagrams = blocks.map((block) => {
      if (isLineDiagramLanguage(block.language)) {
        return { kind: "line", model: parseLineDiagram(block.source, { startLine: block.startLine }) };
      }
      if (isWiringDiagramLanguage(block.language)) {
        return { kind: "wiring", model: parseWiringDiagram(block.source, { startLine: block.startLine }) };
      }
      if (isWaveformDiagramLanguage(block.language)) {
        return { kind: "waveform", model: parseWaveformDiagram(block.source, { startLine: block.startLine }) };
      }
      const circuit = parseCircuit(block.source, { startLine: block.startLine });
      validateCircuit(circuit);
      return { kind: "circuit", model: circuit };
    });
    validateGlobalLabels(diagrams.filter((entry) => entry.kind === "circuit").map((entry) => entry.model));

    let diagnosticCount = 0;
    const missingLibraries = new Set();
    container.innerHTML = blocks.map((block, index) => {
      const entry = diagrams[index];
      const model = entry.model;
      const svg = entry.kind === "line"
        ? renderLineDiagramSvg(model, { title: `Electrical line diagram block ${index + 1}` })
        : entry.kind === "wiring"
          ? renderWiringDiagramSvg(model, { title: `Panel wiring diagram block ${index + 1}` })
          : entry.kind === "waveform"
            ? renderWaveformDiagramSvg(model, { title: `Educational waveform block ${index + 1}` })
            : renderCircuitSvg(model, { title: `Electronic schematic block ${index + 1}` });
      diagnosticCount += model.diagnostics.length;
      if (entry.kind === "circuit") {
        for (const libraryName of model.librariesToLoad || []) missingLibraries.add(libraryName);
      }
      const errorCount = model.diagnostics.filter((diagnostic) => diagnostic.severity === "error").length;
      const meta = entry.kind === "line"
        ? `${model.equipment.length} devices, ${model.connections.length} feeders, ${model.controlLinks.length} control links`
        : entry.kind === "wiring"
          ? `${model.devices.length} devices, ${model.wires.length} physical wires`
          : entry.kind === "waveform"
            ? `${model.signals.length} signals, ${model.markers.length} time markers`
            : `${model.components.length} components, ${model.connections.length} wires, ${model.labels.length} labels, ${model.groups.length} groups`;
      const kindLabel = entry.kind === "line" ? "electrical line"
        : entry.kind === "wiring" ? "panel wiring"
          : entry.kind === "waveform" ? "educational waveform"
            : "electronic schematic";
      return `<article class="diagram-card">
        <div class="diagram-header">
          <span>${kindLabel} block ${index + 1}</span>
          <div class="diagram-meta">
            <span>${meta}${errorCount ? ` <strong class="diagram-error-badge">${errorCount} error${errorCount === 1 ? "" : "s"}</strong>` : ""}</span>
            <button class="button-secondary download-svg" type="button" data-download-svg="${index + 1}" data-diagram-kind="${entry.kind}" aria-label="Download ${kindLabel} block ${index + 1} as SVG">Download SVG</button>
          </div>
        </div>
        <div class="diagram-canvas">${svg}</div>
        ${renderDiagnostics(model.diagnostics)}
      </article>`;
    }).join("");
    return { blockCount: blocks.length, diagnosticCount, missingLibraries: [...missingLibraries] };
  }

  function debounce(fn, wait) {
    let timer = null;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), wait);
    };
  }

  function downloadBlob(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function serializeSvg(svg) {
    const clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("data-creator", PROJECT_CREATOR);
    const metadata = document.createElementNS("http://www.w3.org/2000/svg", "metadata");
    metadata.textContent = `Parametric Markdown diagram created by ${PROJECT_CREATOR}`;
    clone.insertBefore(metadata, clone.firstChild);
    return `<?xml version="1.0" encoding="UTF-8"?>\n${clone.outerHTML}`;
  }

  function boot() {
    const editor = document.getElementById("editor");
    const preview = document.getElementById("preview");
    const renderStatus = document.getElementById("renderStatus");
    const catalogStatus = document.getElementById("catalogStatus");
    const resetExample = document.getElementById("resetExample");
    const downloadMarkdown = document.getElementById("downloadMarkdown");

    if (!editor || !preview || !renderStatus || !catalogStatus || !resetExample || !downloadMarkdown) return;

    updateCatalogStatus(catalogStatus);

    editor.value = window.localStorage.getItem(STORAGE_KEY) || DEFAULT_MARKDOWN;
    let renderId = 0;

    const render = () => {
      renderId += 1;
      const currentRenderId = renderId;
      const result = renderMarkdownCircuits(editor.value, preview);
      window.localStorage.setItem(STORAGE_KEY, editor.value);
      renderStatus.textContent = `${result.blockCount} block${result.blockCount === 1 ? "" : "s"}, ${result.diagnosticCount} diagnostic${result.diagnosticCount === 1 ? "" : "s"}`;
      updateCatalogStatus(catalogStatus);
      if (result.missingLibraries.length) {
        renderStatus.textContent += ", loading symbols";
        loadLibraries(result.missingLibraries).then(() => {
          updateCatalogStatus(catalogStatus);
          if (currentRenderId === renderId) render();
        });
      }
    };

    const debouncedRender = debounce(render, 120);
    editor.addEventListener("input", debouncedRender);
    resetExample.addEventListener("click", () => {
      editor.value = DEFAULT_MARKDOWN;
      render();
      editor.focus();
    });
    downloadMarkdown.addEventListener("click", () => {
      downloadBlob(editor.value, "parametric-markdown.md", "text/markdown;charset=utf-8");
    });
    preview.addEventListener("click", (event) => {
      const button = event.target.closest("[data-download-svg]");
      if (!button) return;
      const card = button.closest(".diagram-card");
      const svg = card?.querySelector(".diagram-svg");
      if (!svg) return;
      const filename = button.dataset.diagramKind === "line"
        ? `electrical-line-${button.dataset.downloadSvg}.svg`
        : button.dataset.diagramKind === "wiring"
          ? `panel-wiring-${button.dataset.downloadSvg}.svg`
          : button.dataset.diagramKind === "waveform"
            ? `waveform-sheet-${button.dataset.downloadSvg}.svg`
            : `schematic-sheet-${button.dataset.downloadSvg}.svg`;
      downloadBlob(
        serializeSvg(svg),
        filename,
        "image/svg+xml;charset=utf-8"
      );
    });
    render();
  }

  window.SchematicMarkdown = {
    creator: PROJECT_CREATOR,
    entryFile: "app.js",
    extractDiagramBlocks,
    extractCircuitBlocks: extractDiagramBlocks,
    parseCircuit,
    parseLineDiagram,
    parseWiringDiagram,
    parseWaveformDiagram,
    validateCircuit,
    validateGlobalLabels,
    renderCircuitSvg,
    renderLineDiagramSvg,
    renderWiringDiagramSvg,
    renderWaveformDiagramSvg,
    renderMarkdownCircuits,
    serializeSvg
  };

  window.addEventListener("DOMContentLoaded", boot);
})();
