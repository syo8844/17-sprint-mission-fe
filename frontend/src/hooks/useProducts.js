import { useEffect, useState } from "react";
import { API_BASE_URL, parseApiResponse } from "../api.js";

export function useProducts({ page, pageSize, keyword = "", orderBy = "recent" }) {
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      offset: String((page - 1) * pageSize),
      limit: String(pageSize),
      orderBy,
      ...(keyword ? { keyword } : {}),
    });

    async function loadProducts() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/products?${params}`, {
          signal: controller.signal,
        });
        const result = await parseApiResponse(response, "상품을 불러오지 못했습니다.");
        setProducts(result.list);
        setTotalCount(result.totalCount);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "상품 목록을 불러오지 못했습니다.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProducts();
    return () => controller.abort();
  }, [page, pageSize, keyword, orderBy]);

  return { products, totalCount, loading, error };
}
