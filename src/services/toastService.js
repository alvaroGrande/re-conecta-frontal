// src/services/toastService.js
let toast = null;

export function setToast(toastInstance) {
  toast = toastInstance;
}

export function showError(message) {
  if (toast) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: message,
      life: 4000,
    });
  } else {
    console.error("Toast service not initialized:", message);
  }
}

export function showSuccess(summary, message) {
  if (toast) {
    toast.add({
      severity: "success",
      summary: summary || "Éxito",
      detail: message,
      life: 3000,
    });
  }
}

export function showWarn(summary, message) {
  if (toast) {
    toast.add({
      severity: "warn",
      summary: summary || "Advertencia",
      detail: message,
      life: 3000,
    });
  }
}