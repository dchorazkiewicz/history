from __future__ import annotations

import json
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
PEOPLE_DIR = ROOT / "people"


def main() -> None:
    files = sorted(PEOPLE_DIR.glob("*.yaml"))
    people = []
    seen_ids = set()

    for path in files:
        with path.open("r", encoding="utf-8") as fh:
            person = yaml.safe_load(fh)

        if not isinstance(person, dict):
            raise ValueError(f"{path}: YAML must contain an object")

        for required in ("id", "display_name", "born"):
            if required not in person:
                raise ValueError(f"{path}: missing required field {required!r}")

        person_id = str(person["id"])
        if person_id in seen_ids:
            raise ValueError(f"Duplicate person id: {person_id}")
        seen_ids.add(person_id)

        person["_file"] = path.name
        people.append(person)

    people.sort(key=lambda p: (
        int(p.get("born", {}).get("year", 0)),
        str(p.get("display_name", p.get("name", ""))).casefold(),
    ))

    manifest = {"people": [p["_file"] for p in people]}
    catalog_people = []
    for person in people:
        person = dict(person)
        person.pop("_file", None)
        catalog_people.append(person)

    catalog = {
        "count": len(catalog_people),
        "people": catalog_people,
    }

    (PEOPLE_DIR / "index.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (PEOPLE_DIR / "catalog.json").write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Built people catalog: {len(catalog_people)} records")


if __name__ == "__main__":
    main()
