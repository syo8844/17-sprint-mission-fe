// 이메일 형식 검사와 회원가입 중복 이메일 확인에 사용하는 기준입니다.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USED_EMAIL = "test@codeit.com";

// 폼 종류와 input 이름에 맞는 유효성 검사 오류 문구를 반환합니다.
function getError(form, input) {
  const value = input.value.trim();

  if (input.name === "email") {
    if (!value) return "이메일을 입력해주세요.";
    if (!EMAIL_RE.test(value)) return "잘못된 이메일 형식입니다.";
    if (form.dataset.authForm === "signup" && value.toLowerCase() === USED_EMAIL) {
      return "중복된 이메일입니다.";
    }
  }

  if (input.name === "password") {
    if (!value) return "비밀번호를 입력해주세요.";
    if (value.length < 8) return "비밀번호를 8자 이상 입력해주세요.";
  }

  if (input.name === "nickname" && !value) {
    return "닉네임을 입력해 주세요.";
  }

  if (input.name === "passwordConfirm" && value !== form.elements.password.value) {
    return "비밀번호가 일치하지 않습니다.";
  }

  return "";
}

// 오류 문구, 필드 스타일, 스크린 리더용 상태를 함께 갱신합니다.
function showFieldError(form, input, message) {
  const field = input.closest(".field");
  const error = field.querySelector(".field-error");
  field.classList.toggle("has-error", Boolean(message));
  input.setAttribute("aria-invalid", String(Boolean(message)));
  error.textContent = message;
}

// 현재 페이지의 로그인·회원가입 폼 각각에 입력 및 제출 이벤트를 연결합니다.
document.querySelectorAll(".auth-form").forEach((form) => {
  const inputs = [...form.querySelectorAll("input")];
  const submitButton = form.querySelector(".submit-button");
  const signup = form.dataset.authForm === "signup";

  // 모든 input이 입력되어 있고 유효한 경우에만 제출 버튼을 활성화합니다.
  function updateSubmitButton() {
    submitButton.disabled = !inputs.every((input) => {
      return input.value.trim().length > 0 && !getError(form, input);
    });
  }

  // 포커스를 잃을 때 검사하고, 사용자가 수정하면 표시된 오류를 다시 검사합니다.
  inputs.forEach((input) => {
    input.addEventListener("blur", () => {
      input.dataset.touched = "true";
      
      showFieldError(form, input, getError(form, input));
    });

    input.addEventListener("input", () => {
      if (input.dataset.touched === "true") {
        showFieldError(form, input, getError(form, input));
      }

      if (signup && input.name === "password" && form.elements.passwordConfirm.dataset.touched === "true") {
        showFieldError(form, form.elements.passwordConfirm, getError(form, form.elements.passwordConfirm));
      }
      updateSubmitButton();
    });
  });

  // 최초 로드 시 빈 입력을 반영해 버튼을 비활성 상태로 설정합니다.
  updateSubmitButton();

  // 제출 시 전체 필드를 다시 검사하고 유효하면 items.html로 이동합니다.
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let valid = true;

    inputs.forEach((input) => {
      input.dataset.touched = "true";
      const message = getError(form, input);
      showFieldError(form, input, message);
      if (message) valid = false;
    });

    if (!valid) return;

    window.location.href = "items.html";
  });
});

// 눈 모양 버튼으로 비밀번호 입력값의 표시/숨김 상태를 전환합니다.
document.querySelectorAll(".password-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const input = button.parentElement.querySelector("input");
    const showPassword = input.type === "password";
    input.type = showPassword ? "text" : "password";
    button.setAttribute("aria-pressed", String(showPassword));
    button.setAttribute("aria-label", showPassword ? "비밀번호 숨기기" : "비밀번호 표시");
  });
});



