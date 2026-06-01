import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { User, Invoice } from './types'

interface AppState {
  user: User | null
  invoices: Invoice[]
  setUser: (u: User | null) => void
  setInvoices: (items: Invoice[]) => void
  addInvoice: (inv: Invoice) => void
  clear: () => void
}

export const useStore = create<AppState>()(
  devtools((set) => ({
    user: null,
    invoices: [],
    setUser: (u) => set({ user: u }),
    setInvoices: (items) => set({ invoices: items }),
    addInvoice: (inv) => set((state) => ({ invoices: [...state.invoices, inv] })),
    clear: () => set({ user: null, invoices: [] }),
  }))
)

export default useStore
