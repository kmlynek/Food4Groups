# Food4Groups

Food4Groups to system wspierający organizację cateringu i składanie zamówień grupowych. Baza danych PostgreSQL, backend oraz aplikacja webowa są uruchamiane za pomocą Docker Compose. Aplikacja mobilna korzysta ze wspólnego kodu Expo/React Native i może zostać uruchomiona w emulatorze Androida lub symulatorze iOS.

## Wymagania

Do uruchomienia bazy danych, backendu i aplikacji webowej wymagane są:

- Docker Desktop z obsługą Docker Compose
- dostęp do Internetu podczas pierwszego pobierania obrazów i budowania kontenerów

Aplikacja mobilna wymaga dodatkowo:

- Node.js 22 LTS wraz z npm
- Android Studio i Android Emulator -> wariant domyślny dla Windows oraz macOS
- albo komputera z macOS, Xcode i iOS Simulator -> wariant alternatywny

Lokalna instalacja PostgreSQL, środowiska .NET ani zależności aplikacji webowej nie jest potrzebna.

## Uruchomienie bazy danych, backendu i aplikacji webowej

1. Uruchom Docker Desktop.
2. Otwórz terminal w głównym katalogu projektu, czyli w katalogu zawierającym pliki `docker-compose.yml` i `.env`.
3. Uruchom wszystkie usługi:

```bash
docker compose up --build -d
```

Pierwsze uruchomienie może potrwać kilka minut. Docker pobierze wymagane obrazy, zbuduje backend i aplikację webową, utworzy bazę danych, a następnie wykona kolejno skrypty `db/init/01_DB_schema.sql` oraz `db/init/02_seed_crud.sql`.

4. Sprawdź stan kontenerów:

```bash
docker compose ps
```

Kontener `food4groups-db` powinien mieć stan `healthy`, a kontenery `food4groups-api` i `food4groups-web` powinny być uruchomione.

5. Otwórz aplikację webową w przeglądarce:

```text
http://localhost:5173
```

API używane przez aplikację mobilną jest dostępne na porcie `8080`.

## Konta demonstracyjne

| Rola w aplikacji | Nazwa techniczna | Login | Hasło |
| --- | --- | --- | --- |
| Administrator | `Admin` | `admin@food4groups.com` | `Admin123!` |
| Pracownik cateringu | `CateringEmployee` | `catering@food4groups.com` | `Test123!` |
| Dietetyk | `Dietitian` | `dietitian@food4groups.com` | `Test123!` |
| Koordynator grupy | `GroupCoordinator` | `coordinator@food4groups.com` | `Test123!` |
| Klient | `User` | `user@food4groups.com` | `Test123!` |

Konta i hasła są przeznaczone wyłącznie do prezentacji lokalnej. Po pierwszym zalogowaniu zaleca się zmianę hasła w sekcji **Moje konto** aplikacji webowej.

Do aplikacji mobilnej należy zalogować się poprzez konto z przypisaną rolą Klient:

```text
user@food4groups.com
Test123!
```

## Aplikacja mobilna - Android Emulator

Android jest domyślnie skonfigurowanym wariantem i może zostać uruchomiony zarówno na Windowsie, jak i na macOS.

1. Otwórz Android Studio i uruchom emulator w narzędziu **Device Manager**.
2. Jeżeli emulator nie został wcześniej utworzony, dodaj urządzenie wirtualne. Przetestowana konfiguracja projektu to **Pixel 8**, obraz systemu **API 36** z **Google APIs**.
3. Poczekaj, aż emulator w pełni się uruchomi i wyświetli ekran główny Androida.
4. Upewnij się, że w pliku `mobile/.env` aktywna jest domyślna konfiguracja:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api
```

5. Otwórz drugi terminal w głównym katalogu projektu i wykonaj:

```bash
cd mobile
npm ci
npm run android
```

Terminal z serwerem Expo należy pozostawić uruchomiony podczas korzystania z aplikacji. Przy pierwszym uruchomieniu Expo może pobrać lub zainstalować aplikację Expo Go w emulatorze.

Adres `10.0.2.2` wskazuje komputer uruchamiający Dockera z perspektywy standardowego Android Emulatora. Nie należy zastępować go adresem `localhost`, ponieważ wskazywałby on sam emulator.

## Aplikacja mobilna - iOS Simulator

Ten wariant wymaga systemu macOS oraz zainstalowanego Xcode i iOS Simulatora.

1. W pliku `mobile/.env` zakomentuj adres dla Androida i odkomentuj adres dla iOS. Aktywny powinien pozostać tylko jeden wpis:

```env
# EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api
EXPO_PUBLIC_API_URL=http://localhost:8080/api
```

2. Otwórz drugi terminal w głównym katalogu projektu i wykonaj:

```bash
cd mobile
npm ci
npm run ios
```

Terminal z serwerem Expo należy pozostawić uruchomiony podczas korzystania z aplikacji. Po każdej zmianie pliku `mobile/.env` zatrzymaj Expo skrótem `Ctrl+C` i uruchom je ponownie.

## Zatrzymanie projektu

Aby zatrzymać aplikację mobilną, użyj skrótu `Ctrl+C` w terminalu z Expo.

Aby zatrzymać kontenery bez usuwania zapisanych danych, wykonaj w głównym katalogu projektu:

```bash
docker compose down
```

Przy kolejnym uruchomieniu wystarczy:

```bash
docker compose up -d
```

## Przywrócenie początkowych danych demonstracyjnych

Skrypty SQL są wykonywane automatycznie tylko podczas tworzenia pustego wolumenu PostgreSQL. Aby usunąć bieżącą bazę i odtworzyć początkowe dane demonstracyjne, wykonaj:

```bash
docker compose down -v
docker compose up --build -d
```

> **Uwaga:** polecenie `docker compose down -v` bezpowrotnie usuwa wszystkie dane zapisane w lokalnej bazie projektu, w tym zmienione hasła.
