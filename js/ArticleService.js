// Article API 요청에 공통으로 사용하는 서버 주소입니다.
const API_BASE_URL = "https://panda-market-api-crud.vercel.app";

// Article API 요청을 보내고, HTTP 오류와 네트워크 오류를 처리합니다.
function requestArticle(path, options = {}, operation = "Article API") {
  // fetch의 Promise에 then/catch를 연결해 비동기 응답과 오류를 처리합니다.
  return fetch(`${API_BASE_URL}${path}`, options)
    .then((response) => {
      // response.ok가 false면 2xx가 아닌 응답이므로 오류로 처리합니다.
      if (!response.ok) {
        throw new Error(`${operation} 요청 실패: HTTP ${response.status}`);
      }

      // DELETE처럼 응답 본문이 없는 204 상태에서는 JSON 파싱을 건너뜁니다.
      if (response.status === 204) return null;
      // 나머지 정상 응답은 JSON으로 변환해 호출한 함수에 반환합니다.
      return response.json();
    })
    .catch((error) => {
      // 오류 메시지를 콘솔에 남기고 상위 호출부에서도 처리할 수 있게 다시 전달합니다.
      console.error(`${operation} 오류:`, error.message);
      throw error;
    });
}

// 목록 조회용 page, pageSize, keyword를 URL 쿼리 문자열로 만듭니다.
function makeQuery({ page = 1, pageSize = 10, keyword = "" } = {}) {
  // URLSearchParams가 각 값을 URL에 사용할 수 있도록 인코딩합니다.
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    keyword,
  });
  // 예: ?page=1&pageSize=10&keyword=... 형식으로 반환합니다.
  return `?${params.toString()}`;
}

// GET /articles?page=...&pageSize=...&keyword=... 게시글 목록을 조회합니다.
export function getArticleList(options = {}) {
  return requestArticle(
    `/articles${makeQuery(options)}`,
    {},
    "getArticleList()",
  );
}

// GET /articles/{articleId} 지정한 ID의 게시글 상세 정보를 조회합니다.
export function getArticle(articleId) {
  return requestArticle(
    `/articles/${encodeURIComponent(articleId)}`,
    {},
    "getArticle()",
  );
}

// POST /articles title, content, image를 본문에 담아 게시글을 생성합니다.
export function createArticle({ title, content, image = null }) {
  return requestArticle(
    "/articles",
    {
      // 서버에 POST 요청을 보내 새 게시글을 등록합니다.
      method: "POST",
      // 요청 본문이 JSON 형식임을 서버에 알립니다.
      headers: { "Content-Type": "application/json" },
      // API 명세에 맞는 필드를 JSON 문자열로 변환해 전송합니다.
      body: JSON.stringify({ title, content, image }),
    },
    "createArticle()",
  );
}

// PATCH /articles/{articleId} 전달한 필드만 게시글에서 수정합니다.
export function patchArticle(articleId, updates) {
  return requestArticle(
    `/articles/${encodeURIComponent(articleId)}`,
    {
      // PATCH는 기존 리소스의 일부 필드를 변경합니다.
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      // 수정할 필드만 담긴 객체를 JSON 본문으로 보냅니다.
      body: JSON.stringify(updates),
    },
    "patchArticle()",
  );
}

// DELETE /articles/{articleId} 지정한 ID의 게시글을 삭제합니다.
export function deleteArticle(articleId) {
  return requestArticle(
    `/articles/${encodeURIComponent(articleId)}`,
    // 삭제 요청에는 별도의 JSON 본문이 필요하지 않습니다.
    { method: "DELETE" },
    "deleteArticle()",
  );
}
