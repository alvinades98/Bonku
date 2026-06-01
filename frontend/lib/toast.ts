import Swal from 'sweetalert2'

export function showSuccess(message: string) {
  Swal.fire({
    icon: 'success',
    title: 'Success',
    text: message,
    timer: 2000,
    showConfirmButton: false,
  })
}

export function showError(message: string) {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
  })
}

export function showWarning(message: string) {
  Swal.fire({
    icon: 'warning',
    title: 'Warning',
    text: message,
  })
}

export function showConfirm(message: string): Promise<boolean> {
  return Swal.fire({
    icon: 'question',
    title: 'Are you sure?',
    text: message,
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
  }).then((result) => result.isConfirmed)
}

export function showLoading(message = 'Loading...') {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => Swal.showLoading(),
  })
}

export function hideLoading() {
  if (Swal.isVisible()) {
    Swal.close()
  }
}
