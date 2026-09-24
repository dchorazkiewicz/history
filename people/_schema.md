# Schemat danych osób

Każda osoba ma jeden plik YAML. **Polski jest językiem podstawowym interfejsu**, a wersje oryginalne są przechowywane jako materiał kontrolny.

## Zasady
- Lata p.n.e. zapisujemy jako liczby ujemne, np. 470 p.n.e. = `-470`.
- Daty niepewne mają `precision: approximate` oraz polskie objaśnienie w `note`.
- `summary`, `works[].title`, `ideas[].name`, `ideas[].summary`, `events[].title` i `events[].summary` są po polsku.
- Tekst źródłowy zachowujemy odpowiednio jako `summary_original`, `original_title`, `original_name`, `summary_original`, `dating_note_original` lub `publication_note_original`.
- `works[].year` oznacza rok publikacji, napisania lub przybliżonego powstania — zależnie od tego, co historycznie można ustalić. Niepewność opisujemy jawnie.
- `ideas` zawiera krótkie, edukacyjne objaśnienia idei i koncepcji związanych z daną osobą.
- `events` zawiera wydarzenia biograficzne i intelektualne nadające się bezpośrednio do osi czasu.
- `sources` przechowuje źródła używane do kontroli danych.
- Obrazy są na razie opcjonalne (`image: null`), dopóki nie ustalimy jednolitego sposobu obsługi licencji i pochodzenia.

- Każda osoba, dzieło i idea może opcjonalnie mieć pole `wikipedia` / `wikipedia_url` z konkretnym adresem hasła.
- Dodatkowe materiały dla dzieła lub idei można zapisywać jako `links: [{ title, url }]`.
- Jeśli bezpośredni link do Wikipedii nie jest wpisany, interfejs automatycznie szuka najpierw hasła w polskiej Wikipedii, a potem w angielskiej.

- Link Wikipedii do osoby może być rozwiązywany automatycznie i jest pokazywany tylko raz przy nagłówku osoby.
- Dla dzieł, idei i wydarzeń **nie generujemy automatycznych linków wyszukiwarki**. Link pojawia się tylko wtedy, gdy w rekordzie istnieje konkretne pole `wikipedia` / `wikipedia_url` albo wpis w `links`.
- Dzięki temu link przy „Principiach” musi prowadzić do Principiów, a nie ogólnie do Isaaca Newtona.
