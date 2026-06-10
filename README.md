## Food4Groups - instrukcja uruchomienia środowiska testowego

Food4Groups to aplikacja wspierająca proces organizacji i zamawiania posiłków grupowych.

Do uruchomienia aplikacji wymagany jest Docker.

W katalogu głównym projektu należy wykonać polecenie:

```bash
docker compose up --build
```

---

Podczas uruchamiania aplikacji automatycznie tworzone są role systemowe oraz konta testowe. Przy pierwszym uruchomieniu dochodzi również do powstania bazy danych i wprowadzenia przykładowych danych testowych.


### Dostępne są następujące dane logowania:

Administrator: `admin@food4groups.com` / `Admin123!`

Pracownik cateringu: `catering@food4groups.com` / `Test123!`

Dietetyk: `dietitian@food4groups.com` / `Test123!`

Koordynator grupy: `coordinator@food4groups.com` / `Test123!`

Użytkownik: `user@food4groups.com` / `Test123!`  

---

Po uruchomieniu, API Swagger będzie dostępny pod adresem `http://localhost:8080/swagger`.

---
Po zalogowaniu należy skopiować zwrócony token JWT i użyć przycisku `Authorize`, aby uzyskać dostęp do endpointów wymagających uwierzytelnienia.
Pełny dostęp do wszystkich endpointów systemu posiada konto z rolą `Administrator`.

Członków grup można dodawać testowo przez endpoint `GroupMembers`. Najwygodniej najpierw zarejestrować nowego użytkownika - po rejestracji otrzymuje on domyślną rolę `User`.

Aby przypisać użytkownika do grupy, należy zalogować się jako `Administrator` lub `Pracownik cateringu`, pobrać identyfikator użytkownika z endpointu `GroupMembers/users`, a następnie użyć go przy tworzeniu rekordu w `GroupMembers`.

---

Aplikację można zatrzymać poleceniem:

```bash
docker compose down
```
