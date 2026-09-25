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


## Kanon a dossier

Kanon jest tylko punktem wejścia do osoby. Nie definiuje jej zawodu ani nie ogranicza opisywanego dorobku.

Przykład: osoba może mieć w centralnym rejestrze `focus: [mathematics, physics, philosophy]`, ale nadal istnieje tylko jeden rekord `people/<id>.yaml`. W tym rekordzie pole `fields` powinno obejmować wszystkie historycznie istotne obszary jej działalności, a dzieła i idee ze wszystkich tych obszarów trafiają do jednego pełnego dossier.
