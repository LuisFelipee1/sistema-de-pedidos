import axios from "axios";

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined;
    if (data && typeof data === "object") {
      if (typeof data.detail === "string") {
        return data.detail;
      }
      const firstField = Object.values(data)[0];
      if (Array.isArray(firstField) && typeof firstField[0] === "string") {
        return firstField[0];
      }
    }
    if (error.message) return error.message;
  }
  return "Algo deu errado. Tente novamente.";
}
