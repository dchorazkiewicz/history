# People data schema

Each person is stored in one YAML file so the future timeline can load people independently.

Conventions:
- BCE years are negative integers (e.g. 470 BCE = -470).
- Approximate/uncertain dates use `precision: approximate` and a note.
- `works[].year` is the publication/composition year when reasonably known; uncertainty is stated explicitly.
- `events` are timeline-ready biographical or intellectual milestones.
- `ideas` are concise descriptions for hover/detail panels.
- `sources` are provenance links used to verify the record.
- Images are intentionally deferred; `image` is left null until licensing/provenance is handled consistently.
