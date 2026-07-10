import { httpClient } from './httpClient';
import axios from 'axios';

type ReportDownload = {
  blob: Blob;
  fileName: string;
};

type ReportProblemDetails = {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
};

function getFileNameFromHeader(contentDisposition?: string) {
  if (!contentDisposition) {
    return '';
  }

  const fileNameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  const fileName = fileNameMatch?.[1] ?? fileNameMatch?.[2] ?? '';

  return fileName ? decodeURIComponent(fileName) : '';
}

function buildReportDownload(blob: Blob, contentDisposition?: string, fallbackFileName = 'raport') {
  return {
    blob,
    fileName: getFileNameFromHeader(contentDisposition) || fallbackFileName,
  };
}

async function getReportErrorMessage(error: unknown, fallbackMessage: string) {
  if (!axios.isAxiosError(error) || !(error.response?.data instanceof Blob)) {
    return fallbackMessage;
  }

  const responseText = await error.response.data.text();

  if (!responseText.trim()) {
    return fallbackMessage;
  }

  try {
    const problemDetails = JSON.parse(responseText) as ReportProblemDetails;
    const firstValidationError = problemDetails.errors
      ? Object.values(problemDetails.errors).flat()[0]
      : undefined;

    return firstValidationError || problemDetails.detail || problemDetails.title || responseText;
  } catch {
    return responseText;
  }
}

export async function getGroupSettlementProformaReport(groupId: string, dateFrom: string, dateTo: string): Promise<ReportDownload> {
  // Pobiera proformę PDF dla wskazanej grupy i zakresu dat
  try {
    const response = await httpClient.get<Blob>('/reports/group-settlement-proforma', {
      params: { groupId, dateFrom, dateTo },
      responseType: 'blob',
    });

    return buildReportDownload(response.data, response.headers['content-disposition'], 'proforma.pdf');
  } catch (error) {
    throw new Error(await getReportErrorMessage(error, 'Nie udało się pobrać proformy'));
  }
}

export async function getMyGroupSettlementProformaReport(): Promise<ReportDownload> {
  // Pobiera proformę PDF dla grupy przypisanej do aktualnego koordynatora
  try {
    const response = await httpClient.get<Blob>('/reports/my-group-settlement-proforma', {
      responseType: 'blob',
    });

    return buildReportDownload(response.data, response.headers['content-disposition'], 'proforma.pdf');
  } catch (error) {
    throw new Error(await getReportErrorMessage(error, 'Nie udało się pobrać proformy'));
  }
}

export async function getDailyOrdersReport(menuDayId: string): Promise<ReportDownload> {
  // Pobiera dzienny raport zamówień w formacie Excel dla wybranego dnia menu
  try {
    const response = await httpClient.get<Blob>('/reports/daily-orders', {
      params: { menuDayId },
      responseType: 'blob',
    });

    return buildReportDownload(response.data, response.headers['content-disposition'], 'zamowienia.xlsx');
  } catch (error) {
    throw new Error(await getReportErrorMessage(error, 'Nie udało się pobrać raportu dziennego'));
  }
}
