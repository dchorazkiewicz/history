# Roadmap

## Tematy, epoki i relacje z osobami

W przyszłości warto rozwinąć epoki i duże tematy historyczne w pełne encje, które będą mogły wskazywać związane osoby.

Przykład:

```yaml
id: scientific_revolution
label: "Rewolucja naukowa"
people:
  - copernicus
  - galileo
  - descartes
  - newton
  - leibniz
```

Docelowo relacja powinna być bogatsza niż sama lista ID i móc opisywać rolę osoby, np. `precursor`, `participant`, `critic`, `popularizer`, `influenced_by`.

Interfejs mógłby wtedy po kliknięciu „Rewolucji naukowej” pokazywać nie tylko zakres dat, lecz także:
- kluczowe osoby,
- najważniejsze dzieła i publikacje,
- idee,
- powiązania między ludźmi,
- wydarzenia,
- źródła i dalsze czytanie.

Ta warstwa powinna być rozwijana później, gdy baza osób będzie znacznie pełniejsza.
