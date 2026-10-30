// Product API 요청 주소의 공통 도메인입니다.
const API_BASE_URL = "https://panda-market-api-crud.vercel.app";

// Product 요청 공통 처리: async/await, try/catch로 오류를 잡고 콘솔에 출력합니다.
// 2XX가 아닌 응답은 에러로 처리하며, 본문이 없는 204 응답은 null로 반환합니다.
async function requestProduct(path, options = {}, operation = "Product API") {
  try {
    // fetch 응답이 도착할 때까지 기다린 뒤 다음 줄에서 처리합니다.
    const response = await fetch(`${API_BASE_URL}${path}`, options);

    // response.ok가 false면 HTTP 상태 코드를 포함한 오류를 발생시킵니다.
    if (!response.ok) {
      throw new Error(`${operation} 요청 실패: HTTP ${response.status}`);
    }

    // 본문이 없는 204 성공 응답은 null로 처리합니다.
    if (response.status === 204) return null;
    // 그 외 성공 응답은 JSON으로 읽어 반환합니다.
    return await response.json();
  } catch (error) {
    // HTTP 오류 또는 네트워크 오류를 기록하고 호출자에게 전달합니다.
    console.error(`${operation} 오류:`, error.message);
    throw error;
  }
}

// 목록 조회에 사용할 page, pageSize, keyword 쿼리 파라미터를 구성합니다.
function makeQuery({ page = 1, pageSize = 10, keyword = "" } = {}) {
  // 파라미터를 URL에 안전한 형태로 인코딩합니다.
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    keyword,
  });
  // Product 목록 endpoint 뒤에 붙일 쿼리 문자열을 반환합니다.
  return `?${params.toString()}`;
}

// GET /products?page=...&pageSize=...&keyword=...
export function getProductList(options = {}) {
  // 페이지·페이지 크기·검색어를 포함해 Product 목록을 요청합니다.
  return requestProduct(`/products${makeQuery(options)}`, {}, "getProductList()");
}

// GET /products/{productId}: 상품 상세 정보를 조회합니다.
export function getProduct(productId) {
  // productId를 URL 경로에 안전하게 넣어 단일 상품을 조회합니다.
  return requestProduct(`/products/${encodeURIComponent(productId)}`, {}, "getProduct()");
}

// POST /products: 요청 본문에 name, description, price, tags, images를 담아 생성합니다.
export function createProduct({
  name,
  description,
  price,
  tags = [],
  images = [],
}) {
  return requestProduct(
    "/products",
    {
      // POST 메서드와 JSON 헤더로 새 상품 등록 요청을 보냅니다.
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // 명세에 나온 필수 필드를 JSON 문자열로 만들어 전송합니다.
      body: JSON.stringify({ name, description, price, tags, images }),
    },
    "createProduct()",
  );
}

// PATCH /products/{productId}: 전달한 필드만 수정합니다.
export function patchProduct(productId, updates) {
  return requestProduct(
    `/products/${encodeURIComponent(productId)}`,
    {
      // PATCH 메서드로 해당 상품의 일부 필드를 변경합니다.
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      // 수정할 필드만 담은 updates 객체를 JSON으로 전송합니다.
      body: JSON.stringify(updates),
    },
    "patchProduct()",
  );
}

// DELETE /products/{productId}: 상품을 삭제합니다.
export function deleteProduct(productId) {
  return requestProduct(
    `/products/${encodeURIComponent(productId)}`,
    // DELETE 요청으로 지정한 상품을 삭제합니다.
    { method: "DELETE" },
    "deleteProduct()",
  );
}
