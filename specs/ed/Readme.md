```
Overview
  (no normative deps)

Serialization
├─ Designed
│  ├─ Structure            (adds organization metadata over Designed ids)
│  └─ Runtime              (uses Designed ids; follows Serialization timestamps/refs)
│     ├─ Conformance        (compares Runtime ↔ Designed; uses Runtime rules)
│     └─ Observed           (aggregates Runtime; optionally aligns to Designed)
│        └─ Metrics         (metric keys/units used in Observed artifacts)
└─ Profiles & Optional Modules
   ├─ First-level bridges   (Surface, Actor, Action, Artifact, Evidence, and similar small attachments)
   └─ Second-level modules  (Design System, Distributed Journey, and other bridge-mediated semantics)
```
