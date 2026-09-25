# Kanony dziedzin

Ten katalog służy do audytu list osób wybieranych do projektu.

## Zasada

- `people_status.yaml` jest jedynym centralnym rejestrem osób i statusu opracowania.
- Pliki w `canons/` nie przechowują osobnych rekordów osób — tylko ich `id`.
- Jedna osoba może należeć do wielu kanonów bez duplikowania rekordu, np. Newton do matematyki i fizyki.
- Przed dodaniem nowej osoby należy sprawdzić `people_status.yaml`.
- Skrypt `scripts/audit_people_registry.py` sprawdza duplikaty, brakujące identyfikatory i zgodność opisanych rekordów z katalogiem `people/`.
- Audyt uruchamia się automatycznie podczas deployu.

Kolejne listy, np. filozofowie, pisarze, biologowie, odkrywcy czy władcy, dostają osobny plik w tym katalogu. Epoki nie są osobami i powinny mieć osobny rejestr danych.
