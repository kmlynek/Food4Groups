import axios from 'axios';

type ProblemDetails = {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
};

const defaultErrorMessage = 'Wystąpił błąd systemu';

// Odczytuje komunikat błędu zwrócony przez backend
export function getApiErrorMessage(error: unknown, fallbackMessage = defaultErrorMessage) {
    // Obsługuje wyłącznie wyjątki pochodzące z biblioteki Axios
    if (!axios.isAxiosError(error)) {
        return fallbackMessage;
    }

    const responseData = error.response?.data;

    if (typeof responseData === 'string' && responseData.trim().length > 0) {
        return responseData;
    }

    const problemDetails = responseData as ProblemDetails | undefined;

    if (problemDetails?.errors) {
        // W przypadku błędów walidacji zwracany jest pierwszy komunikat z kolekcji błędów
        const firstError = Object.values(problemDetails.errors).flat()[0];

        if (firstError) {
            return firstError;
        }
    }

    if (problemDetails?.detail) {
        return problemDetails.detail;
    }

    if (problemDetails?.title) {
        return problemDetails.title;
    }

    // Jeśli backend nie zwrócił komunikatu, używany jest tekst domyślny
    return fallbackMessage;
}