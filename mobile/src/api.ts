// Moduł odpowiada za wspólną komunikację aplikacji mobilnej z backendem.
// Centralna konfiguracja zapobiega powielaniu adresów i obsługi błędów w ekranach.
const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

if (!apiUrl) {
  throw new Error('Brak konfiguracji EXPO_PUBLIC_API_URL');
}

// Końcowy ukośnik jest usuwany, aby budowane adresy nie zawierały "//".
const normalizedApiUrl = apiUrl.replace(/\/+$/, '');

type ProblemDetails = {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
};

type ApiRequestOptions = RequestInit & {
  token?: string;
};

// Własny typ błędu odróżnia błędy komunikacji z API od pozostałych błędów aplikacji.
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Funkcja wysyła żądanie HTTP, dodaje wymagane nagłówki
// i zwraca odpowiedź zdeserializowaną do wskazanego typu.
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { token, headers: initialHeaders, ...requestOptions } = options;
  const headers = new Headers(initialHeaders);

  // Dane formularzy są przekazywane do backendu w formacie JSON.
  if (requestOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Token jest dołączany wyłącznie do żądań wymagających uwierzytelnienia.
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(
      `${normalizedApiUrl}${path.startsWith('/') ? path : `/${path}`}`,
      {
        ...requestOptions,
        headers,
      },
    );
  } catch {
    // Brak odpowiedzi z backendu jest przedstawiany jako błąd połączenia.
    throw new ApiError('Nie udało się połączyć z serwerem');
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response));
  }

  // Odpowiedź HTTP 204 nie zawiera danych do zdeserializowania.
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

// Backend może zwrócić prosty tekst albo obiekt ProblemDetails.
// Oba formaty są przekształcane do jednego komunikatu dla użytkownika.
async function readErrorMessage(response: Response) {
  const fallbackMessage = 'Nie udało się wykonać operacji';
  const responseText = await response.text();

  if (!responseText) {
    return fallbackMessage;
  }

  try {
    const responseData = JSON.parse(responseText) as
      | string
      | ProblemDetails;

    if (typeof responseData === 'string') {
      return responseData;
    }

    // Pierwszy błąd walidacji ma pierwszeństwo przed komunikatem ogólnym.
    const firstValidationError = responseData.errors
      ? Object.values(responseData.errors).flat()[0]
      : undefined;

    return (
      firstValidationError ??
      responseData.detail ??
      responseData.title ??
      fallbackMessage
    );
  } catch {
    // Odpowiedź w formacie innym niż JSON jest przekazywana jako gotowy tekst błędu.
    return responseText;
  }
}