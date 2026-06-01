'use client'

import { useEffect, useState } from 'react'
import { clientsApi, ApiErrorClass } from '@/lib/api'
import type { Client } from '@/lib/types'
import { showSuccess, showError, showConfirm } from '@/lib/toast'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' })
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = () => {
    clientsApi.list()
      .then((data) => {
        setClients(data)
        setLoading(false)
      })
      .catch((err) => {
        if (err instanceof ApiErrorClass) {
          showError(err.message)
        }
        setLoading(false)
      })
  }

  const openCreateForm = () => {
    setEditingClient(null)
    setFormData({ name: '', email: '', phone: '', address: '' })
    setShowForm(true)
  }

  const openEditForm = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      email: client.email ?? '',
      phone: client.phone ?? '',
      address: client.address ?? '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      if (editingClient) {
        await clientsApi.update(editingClient.id, formData)
        showSuccess('Client updated successfully')
      } else {
        await clientsApi.create(formData)
        showSuccess('Client created successfully')
      }
      setShowForm(false)
      loadClients()
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        showError(err.message)
      } else {
        showError('Failed to save client')
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm('Are you sure you want to delete this client?')
    if (!confirmed) return
    try {
      await clientsApi.delete(id)
      setClients((prev) => prev.filter((c) => c.id !== id))
      showSuccess('Client deleted successfully')
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        showError(err.message)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-slate-400">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Clients</h1>
          <p className="text-slate-500 mt-1">Manage your client information</p>
        </div>
        <button
          onClick={openCreateForm}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          New Client
        </button>
      </div>

      {showForm && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-base font-medium text-slate-800 mb-4">
            {editingClient ? 'Edit Client' : 'New Client'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={formLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? 'Saving...' : editingClient ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Phone</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                    No clients yet. Add your first client to get started.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-800">{client.name}</td>
                    <td className="px-4 py-3 text-slate-500">{client.email || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{client.phone || '—'}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => openEditForm(client)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
