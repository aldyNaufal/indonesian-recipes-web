import Swal from "sweetalert2";

export function showSuccessAlert(message) {
  Swal.fire({
    icon: "success",
    title: "Berhasil!",
    text: message,
    confirmButtonColor: "#3085d6",
    confirmButtonText: "OK",
  });
}

export function showErrorAlert(message) {
  Swal.fire({
    icon: "error",
    title: "Gagal!",
    text: message,
    confirmButtonColor: "#d33",
    confirmButtonText: "OK",
  });
}

export function showConfirmationAlert(message, confirmCallback, cancelCallback) {
  Swal.fire({
    title: "Apakah Anda Yakin?",
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, lanjutkan",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      confirmCallback();
    } else if (cancelCallback) {
      cancelCallback();
    }
  });
}

export function showLoadingAlert(message) {
  Swal.fire({
    title: message || "Loading...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
}

export function hideLoadingAlert() {
  Swal.close();
}
