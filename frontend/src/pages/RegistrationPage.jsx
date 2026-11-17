import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, parseApiResponse } from "../api.js";
import { useRegistrationValidation } from "../hooks/useRegistrationValidation.js";
const initialValues = { name: "", description: "", price: "", tags: [] };
const controlBackground = { backgroundColor: "var(--cool-gray-100)" };

export function RegistrationPage() {
  const [values, setValues] = useState(initialValues);
  const [tagInput, setTagInput] = useState("");
  const [tagError, setTagError] = useState("");
  const [touched, setTouched] = useState({});
  const [requestError, setRequestError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { errors, isValid } = useRegistrationValidation(values);
  const hasRequiredValues = Boolean(
    values.name.trim() && values.description.trim() && values.price.trim() && values.tags.length,
  );
  const navigate = useNavigate();

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function addTag(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const tag = tagInput.trim().replace(/^#/, "");
    if (!tag || tag.length > 5 || values.tags.includes(tag)) {
      setTouched((current) => ({ ...current, tags: true }));
      setTagError(
        tag.length > 5
          ? "5글자 이내로 입력해주세요."
          : tag
            ? "이미 추가된 태그입니다."
            : "태그를 입력해주세요.",
      );
      return;
    }
    setValues((current) => ({ ...current, tags: [...current.tags, tag] }));
    setTagInput("");
    setTagError("");
    setTouched((current) => ({ ...current, tags: true }));
  }

  function removeTag(tagToRemove) {
    setValues((current) => ({ ...current, tags: current.tags.filter((tag) => tag !== tagToRemove) }));
  }

  async function submit(event) {
    event.preventDefault();
    setTouched({ name: true, description: true, price: true, tags: true });
    if (!isValid) return;

    setSubmitting(true);
    setRequestError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, price: Number(values.price.replaceAll(",", "")) }),
      });
      const result = await parseApiResponse(response, "상품을 등록하지 못했습니다.");
      navigate(`/items/${result.id}`);
    } catch (error) {
      setRequestError(error.message || "상품을 등록하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="registration-main">
      <form className="registration-form" onSubmit={submit} noValidate>
        <div className="registration-heading">
          <h1>상품 등록하기</h1>
          <button className="submit-registration" type="submit" disabled={!hasRequiredValues || submitting}>{submitting ? "등록 중..." : "등록"}</button>
        </div>
        <Field label="상품명" error={touched.name ? errors.name : ""}>
          <input name="name" style={controlBackground} value={values.name} onChange={updateField} onBlur={() => setTouched((current) => ({ ...current, name: true }))} placeholder="상품명을 입력해주세요" aria-invalid={Boolean(touched.name && errors.name)} />
        </Field>
        <Field label="상품 소개" error={touched.description ? errors.description : ""}>
          <textarea name="description" style={controlBackground} value={values.description} onChange={updateField} onBlur={() => setTouched((current) => ({ ...current, description: true }))} placeholder="상품 소개를 입력해주세요" rows={6} aria-invalid={Boolean(touched.description && errors.description)} />
        </Field>
        <Field label="판매 가격" error={touched.price ? errors.price : ""}>
          <div className="price-input-wrap">
            <input name="price" style={controlBackground} inputMode="numeric" value={values.price} onChange={updateField} onBlur={() => setTouched((current) => ({ ...current, price: true }))} placeholder="판매 가격을 입력해주세요" aria-invalid={Boolean(touched.price && errors.price)} />
            <span>원</span>
          </div>
        </Field>
        <Field
          label="태그"
          error={touched.tags ? tagError || errors.tags : ""}
          afterError={values.tags.length > 0 ? (
            <div className="tag-list" aria-label="추가한 태그">
              {values.tags.map((tag) => <button className="tag-chip" type="button" key={tag} onClick={() => removeTag(tag)} aria-label={`${tag} 태그 삭제`}>#{tag}<span aria-hidden="true"><svg viewBox="0 0 12 12"><path d="m3 3 6 6M9 3 3 9" /></svg></span></button>)}
            </div>
          ) : null}
        >
          <input className="tag-input" style={controlBackground} value={tagInput} onChange={(event) => { setTagInput(event.target.value); setTagError(""); }} onKeyDown={addTag} onBlur={() => setTouched((current) => ({ ...current, tags: true }))} placeholder="태그를 입력해주세요" aria-label="태그 입력" aria-invalid={Boolean(touched.tags && (tagError || errors.tags))} />
        </Field>
        {requestError ? <p className="request-error" role="alert">{requestError}</p> : null}
      </form>
    </main>
  );
}

function Field({ label, error, afterError, children }) {
  return (
    <div className="registration-field">
      <label>{label}</label>
      <div className="registration-control">{children}</div>
      {error ? <p className="field-error" role="alert">{error}</p> : <p className="field-error-placeholder" aria-hidden="true">&nbsp;</p>}
      {afterError}
    </div>
  );
}
