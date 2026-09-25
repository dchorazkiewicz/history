from __future__ import annotations

from pathlib import Path
import sys
import yaml

ROOT = Path(__file__).resolve().parents[1]
STATUS_FILE = ROOT / "people_status.yaml"
PEOPLE_DIR = ROOT / "people"
CANONS_DIR = ROOT / "canons"
VALID_STATUSES = {"pending", "researching", "described", "reviewed"}


def load_yaml(path: Path):
    with path.open("r", encoding="utf-8") as fh:
        return yaml.safe_load(fh)


def fail(message: str) -> None:
    print(f"AUDIT ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    data = load_yaml(STATUS_FILE) or {}
    people = data.get("people", [])
    if not isinstance(people, list):
        fail("people_status.yaml: 'people' must be a list")

    registry = {}
    for index, person in enumerate(people, start=1):
        if not isinstance(person, dict):
            fail(f"people_status.yaml: entry #{index} is not an object")
        person_id = str(person.get("id", "")).strip()
        if not person_id:
            fail(f"people_status.yaml: entry #{index} has no id")
        if person_id in registry:
            fail(f"duplicate person id in registry: {person_id}")
        if not person.get("name"):
            fail(f"{person_id}: missing name")
        status = person.get("status")
        if status not in VALID_STATUSES:
            fail(f"{person_id}: invalid status {status!r}")
        registry[person_id] = person

    yaml_people = {}
    for path in sorted(PEOPLE_DIR.glob("*.yaml")):
        person = load_yaml(path)
        if not isinstance(person, dict) or not person.get("id"):
            fail(f"{path.relative_to(ROOT)}: invalid person record")
        person_id = str(person["id"])
        if person_id in yaml_people:
            fail(f"duplicate id in people/*.yaml: {person_id}")
        yaml_people[person_id] = path

        if person_id not in registry:
            fail(f"{path.relative_to(ROOT)} exists but {person_id!r} is missing from people_status.yaml")

    for person_id, person in registry.items():
        if person.get("status") in {"described", "reviewed"}:
            if person_id not in yaml_people:
                fail(f"{person_id}: status is {person['status']} but no people/{person_id}.yaml-equivalent record exists")
            data_file = person.get("data_file")
            if data_file and not (ROOT / data_file).exists():
                fail(f"{person_id}: data_file does not exist: {data_file}")

    canon_count = 0
    membership_count = 0
    if CANONS_DIR.exists():
        for path in sorted(CANONS_DIR.glob("*.yaml")):
            canon = load_yaml(path) or {}
            members = canon.get("members", [])
            if not isinstance(members, list):
                fail(f"{path.relative_to(ROOT)}: 'members' must be a list")
            seen = set()
            for person_id in members:
                person_id = str(person_id)
                if person_id in seen:
                    fail(f"{path.relative_to(ROOT)}: duplicate member {person_id}")
                seen.add(person_id)
                if person_id not in registry:
                    fail(f"{path.relative_to(ROOT)}: unknown person id {person_id}")
            declared = canon.get("count")
            if declared is not None and int(declared) != len(members):
                fail(f"{path.relative_to(ROOT)}: count={declared}, actual={len(members)}")
            canon_count += 1
            membership_count += len(members)

    print(
        f"People registry OK: {len(registry)} unique people; "
        f"{len(yaml_people)} described YAML records; "
        f"{canon_count} canons / {membership_count} memberships."
    )


if __name__ == "__main__":
    main()
