import Swal from 'sweetalert2'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  },
})

export function showSuccess(message: string) {
  Toast.fire({
    icon: 'success',
    title: message,
  })
}

export function showError(message: string, errors?: Record<string, string[]>) {
  if (errors && Object.keys(errors).length > 0) {
    const messages = Object.values(errors).flat()
    const html = messages.map((m) => `<p style="margin:2px 0;font-size:13px;">${m}</p>`).join('')
    Toast.fire({
      icon: 'error',
      html: `<div style="text-align:left;">${html}</div>`,
      timer: 5000,
    })
  } else {
    Toast.fire({
      icon: 'error',
      title: message,
    })
  }
}

export function showWarning(message: string) {
  Toast.fire({
    icon: 'warning',
    title: message,
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
