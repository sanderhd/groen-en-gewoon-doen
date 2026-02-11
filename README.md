# Groen en Gewoon doen

## API Eindpunten

Basis URL: `http://localhost:3000`

| Methode | Eindpunt | Beschrijving |
|---------|----------|-------------|
| GET | `/api/orders` | Alle orders ophalen |
| GET | `/api/orders/:id` | Één order ophalen |
| POST | `/api/orders` | Nieuwe order maken |
| PUT | `/api/orders/:id` | Order bijwerken |
| DELETE | `/api/orders/:id` | Order verwijderen |

## Verzoekgegevens

### Order maken

`POST /api/orders`

Voorbeeld:

```json
{
    "client": "Jane Doe",
    "adres": "Stationsstraat 1, 1234 AB Amsterdam",
    "email": "jane.doe@example.com",
    "telefoon": "+31 6 12345678",
    "pakket": false,
    "offerte": {
        "m2gras": "40",
        "m2tegels": "20",
        "heg": "10",
        "prijs": "4"
    },
    "datum": "2024-06-10",
    "status": "In behandeling"
}
```

Antwoord: de nieuwe order met `id`.

### Order bijwerken

`PUT /api/orders/:id`

Voorbeeld:

```json
{
    "status": "Afgerond"
}
```

Antwoord: de bijgewerkte order.

### Order verwijderen

`DELETE /api/orders/:id`

Antwoord: de verwijderde order.