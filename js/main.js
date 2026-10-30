// ArticleService.js, ProductService.js에서 CRUD 함수를 불러옵니다.
// main.js에서는 이 함수들을 실행하고 결과를 확인합니다.
import {
  createArticle,
  deleteArticle,
  getArticle,
  getArticleList,
  patchArticle,
} from "./ArticleService.js";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProductList,
  patchProduct,
} from "./ProductService.js";

// 읽기 전용 API 확인을 Given → When → Then 시나리오로 표현합니다.
// 목록 조회 후 목록의 첫 번째 항목으로 상세 조회를 이어서 확인합니다.
const articleScenarios = [
  {
    given: "게시글 목록 조회 조건(page 1, 10개)이 주어졌을 때",
    when: "getArticleList()를 실행하면",
    then: "게시글 목록이 반환된다",
    run: () => getArticleList({ page: 1, pageSize: 10, keyword: "" }),
    saveAs: "articles",
  },
  {
    given: "게시글 목록에 첫 번째 게시글이 있을 때",
    when: "그 게시글 ID로 getArticle()을 실행하면",
    then: "해당 게시글 정보가 반환된다",
    run: (context) => {
      const article = getFirstItem(context.articles, "article");
      const articleId = article?.id ?? article?.articleId;
      return articleId == null ? null : getArticle(articleId);
    },
  },
];

const productScenarios = [
  {
    given: "상품 목록 조회 조건(page 1, 10개)이 주어졌을 때",
    when: "getProductList()를 실행하면",
    then: "상품 목록이 반환된다",
    run: () => getProductList({ page: 1, pageSize: 10, keyword: "" }),
    saveAs: "products",
  },
  {
    given: "상품 목록에 첫 번째 상품이 있을 때",
    when: "그 상품 ID로 getProduct()를 실행하면",
    then: "해당 상품 정보가 반환된다",
    run: (context) => {
      const product = getFirstItem(context.products, "product");
      const productId = product?.id ?? product?.productId;
      return productId == null ? null : getProduct(productId);
    },
  },
];

// API 응답이 배열이거나 목록을 감싼 객체인 경우 첫 항목을 가져옵니다.
function getFirstItem(result, resourceName) {
  if (Array.isArray(result)) return result[0];

  const listKey = resourceName === "article" ? "articles" : "products";
  const candidates = [result?.[listKey], result?.list, result?.data, result?.data?.list];
  return candidates.find(Array.isArray)?.[0];
}

// 각 시나리오의 조건·실행·예상 결과와 실제 API 응답을 브라우저 콘솔에 출력합니다.
async function runBddScenarios(resourceName, scenarios) {
  const context = {};

  for (const scenario of scenarios) {
    console.group(`${resourceName} BDD 시나리오`);
    console.log(`Given: ${scenario.given}`);
    console.log(`When: ${scenario.when}`);
    console.log(`Then: ${scenario.then}`);

    try {
      const result = await scenario.run(context);
      if (scenario.saveAs) context[scenario.saveAs] = result;
      console.log(
        "실제 결과:",
        result === null ? "조회할 항목이 목록에 없습니다." : result,
      );
    } catch (error) {
      console.error("실행 오류:", error);
    } finally {
      console.groupEnd();
    }
  }
}

// 페이지를 열면 읽기 전용 Article/Product 시나리오를 실행합니다.
runBddScenarios("Article", articleScenarios);
runBddScenarios("Product", productScenarios);

// 생성 응답에서 Article/Product id를 찾아 상세 조회·수정·삭제에 전달합니다.
function getCreatedId(created, resourceName) {
  // API 응답이 id, articleId/productId 또는 중첩 객체 형식일 때 모두 대응합니다.
  const id = created?.id ?? created?.[`${resourceName}Id`] ?? created?.[resourceName]?.id;
  // 생성 결과에서 id를 못 찾으면 후속 조회·수정·삭제를 진행할 수 없으므로 중단합니다.
  if (id === undefined || id === null) {
    throw new Error(`${resourceName} 생성 응답에서 id를 찾을 수 없습니다.`);
  }
  return id;
}

// Article CRUD 실행 예시: 생성 → 상세 조회 → 수정 → 삭제.
// 콘솔에서 window.runArticleCrudDemo()로 실행하며, 원격 데이터를 쓰므로 자동 실행하지 않습니다.
window.runArticleCrudDemo = async function runArticleCrudDemo() {
  // finally 블록에서도 생성된 게시글을 정리할 수 있게 id를 바깥에 보관합니다.
  let articleId;
  try {
    // POST: 테스트용 게시글을 생성하고 응답에서 id를 추출합니다.
    const created = await createArticle({
      title: "CRUD API 확인용 게시글",
      content: "확인 후 삭제되는 테스트 게시글입니다.",
      image: "https://example.com/mission3-crud-test.png",
    });
    articleId = getCreatedId(created, "article");
    console.log("생성한 Article:", created);
    // GET: 방금 생성한 게시글의 상세 정보를 확인합니다.
    console.log("상세 Article:", await getArticle(articleId));
    // PATCH: 테스트 게시글의 제목을 바꾸고 변경 응답을 확인합니다.
    console.log(
      "수정한 Article:",
      await patchArticle(articleId, { title: "수정된 CRUD API 확인용 게시글" }),
    );
  } catch (error) {
    // CRUD 단계 중 실패한 작업을 콘솔에 표시합니다.
    console.error("Article CRUD 데모 실패:", error);
  } finally {
    // 생성이 성공했다면 테스트 데이터가 남지 않도록 마지막에 삭제합니다.
    if (articleId !== undefined) {
      try {
        console.log("Article 삭제 결과:", await deleteArticle(articleId));
      } catch (error) {
        // 삭제 요청도 실패할 수 있으므로 별도로 오류를 기록합니다.
        console.error("Article 테스트 데이터 삭제 실패:", error);
      }
    }
  }
};

// Product CRUD 실행 예시: 생성 → 상세 조회 → 수정 → 삭제.
// 콘솔에서 window.runProductCrudDemo()로 실행하며, 원격 데이터를 쓰므로 자동 실행하지 않습니다.
window.runProductCrudDemo = async function runProductCrudDemo() {
  // 마지막에 삭제할 테스트 상품의 id를 보관합니다.
  let productId;
  try {
    // POST: 명세의 상품 필드로 테스트 상품을 생성합니다.
    const created = await createProduct({
      name: "CRUD 확인 상품",
      description: "확인 후 삭제되는 테스트 상품입니다.",
      price: 1000,
      tags: ["test"],
      images: [],
    });
    productId = getCreatedId(created, "product");
    console.log("생성한 Product:", created);
    // GET: 생성 응답에서 받은 id로 상품 상세를 불러옵니다.
    console.log("상세 Product:", await getProduct(productId));
    // PATCH: 상품명을 수정하고 결과를 확인합니다.
    console.log(
      "수정한 Product:",
      await patchProduct(productId, { name: "수정된 CRUD 확인 상품" }),
    );
  } catch (error) {
    // 생성·조회·수정 단계 중 발생한 오류를 기록합니다.
    console.error("Product CRUD 데모 실패:", error);
  } finally {
    // 생성된 상품이 있으면 데모 종료 전에 삭제해 테스트 데이터를 정리합니다.
    if (productId !== undefined) {
      try {
        console.log("Product 삭제 결과:", await deleteProduct(productId));
      } catch (error) {
        // 테스트 상품 삭제 실패도 별도로 알려줍니다.
        console.error("Product 테스트 데이터 삭제 실패:", error);
      }
    }
  }
};
