const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim();

export const API_BASE_URL = (
  configuredApiBaseUrl || (import.meta.env.DEV ? "http://localhost:3001" : "")
).replace(/\/+$/, "");

export async function parseApiResponse(response, fallbackMessage) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("상품 API가 JSON 대신 HTML을 반환했습니다. VITE_API_BASE_URL을 백엔드 주소로 설정하고 백엔드 서버를 실행해 주세요.");
  }

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message ?? `${fallbackMessage} (${response.status})`);
  }
  return result;
}
