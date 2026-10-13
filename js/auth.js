const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USED_EMAIL = "test@codeit.com";

function getError(form, input) {
  const value = input.value.trim();

  if (input.name === "email") {
    if (!value) return "이메일을 입력해 주세요.";
    if (!EMAIL_RE.test(value)) return "잘못된 이메일 형식입니다.";
    if (form.dataset.authForm === "signup" && value.toLowerCase() === USED_EMAIL) {
      return "중복된 이메일입니다.";
    }
    if (form.dataset.authForm === "login" && input.dataset.credentialsError === "true") {
      return "이메일을 확인해 주세요.";
    }
  }

  if (input.name === "password") {
    if (form.dataset.authForm === "login") {
      if (!value) return "비밀번호를 입력해 주세요.";
      if (input.dataset.credentialsError === "true") return "비밀번호를 확인해 주세요.";
    } else if (value.length < 8) {
      return "비밀번호를 8자 이상 입력해 주세요.";
    }
  }

  if (input.name === "nickname" && !value) {
    return "닉네임을 입력해 주세요.";
  }

  if (input.name === "passwordConfirm" && value !== form.elements.password.value) {
    return "비밀번호가 일치하지 않습니다.";
  }

  return "";
}

function showFieldError(form, input, message) {
  const field = input.closest(".field");
  const error = field.querySelector(".field-error");
  field.classList.toggle("has-error", Boolean(message));
  input.setAttribute("aria-invalid", String(Boolean(message)));
  error.textContent = message;
}

document.querySelectorAll(".auth-form").forEach((form) => {
  const inputs = [...form.querySelectorAll("input")];
  const submitButton = form.querySelector(".submit-button");
  const signup = form.dataset.authForm === "signup";

  function updateSubmitButton() {
    submitButton.disabled = !inputs.every((input) => input.value.trim().length > 0);
  }

  inputs.forEach((input) => {
    input.addEventListener("blur", () => {
      input.dataset.touched = "true";
      
      showFieldError(form, input, getError(form, input));
    });

    input.addEventListener("input", () => {
      input.dataset.credentialsError = "false";
      if (input.dataset.touched === "true") {
        showFieldError(form, input, getError(form, input));
      }

      if (signup && input.name === "password" && form.elements.passwordConfirm.dataset.touched === "true") {
        showFieldError(form, form.elements.passwordConfirm, getError(form, form.elements.passwordConfirm));
      }
      updateSubmitButton();
    });
  });

  updateSubmitButton();

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

    if (!signup) {
      const correctEmail = form.elements.email.value.trim().toLowerCase() === USED_EMAIL;
      const correctPassword = form.elements.password.value === "codeit101";

      if (!correctEmail || !correctPassword) {
        form.elements.email.dataset.credentialsError = "true";
        form.elements.password.dataset.credentialsError = "true";
        showFieldError(form, form.elements.email, "이메일을 확인해 주세요.");
        showFieldError(form, form.elements.password, "비밀번호를 확인해 주세요.");
        return;
      }
    }

    window.location.href = "./items.html";
  });
});

document.querySelectorAll(".password-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const input = button.parentElement.querySelector("input");
    const showPassword = input.type === "password";
    input.type = showPassword ? "text" : "password";
    button.setAttribute("aria-pressed", String(showPassword));
    button.setAttribute("aria-label", showPassword ? "비밀번호 숨기기" : "비밀번호 표시");
  });
});



