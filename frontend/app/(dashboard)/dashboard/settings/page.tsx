'use client'

import { useState, useEffect } from 'react'
import { authApi, ApiErrorClass } from '@/lib/api'
import type { User } from '@/lib/types'

export default function SettingsPage() {
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    company_phone: '',
    company_address: '',
    npwp: '',
    company_logo_path: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      setLoading(true)
      setError(null)
      const user = await authApi.me()
      setProfile(user)
      setFormData({
        name: user.name || '',
        company_name: user.company_name || '',
        company_phone: user.company_phone || '',
        company_address: user.company_address || '',
        npwp: user.npwp || '',
        company_logo_path: user.company_logo_path || '',
      })
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message)
      } else {
        setError('Failed to load profile')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError(null)
    setValidationErrors(null)

    try {
      const updated = await authApi.updateProfile(formData)
      setProfile(updated)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        if (err.errors) {
          setValidationErrors(err.errors)
        } else {
          setError(err.message)
        }
      } else {
        setError('Failed to update profile')
      }
    } finally {
      setSaving(false)
    }
  }

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Settings</h1>
      <p className="text-slate-500 mt-1">Manage your business profile</p>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            Profile updated successfully
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Personal Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-base font-medium text-slate-800 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {validationErrors?.name && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.name[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="mt-1 w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-base font-medium text-slate-800 mb-4">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Business Name</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={e => handleChange('company_name', e.target.value)}
                placeholder="Your business name"
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {validationErrors?.company_name && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.company_name[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input
                type="tel"
                value={formData.company_phone}
                onChange={e => handleChange('company_phone', e.target.value)}
                placeholder="+62 xxx-xxxx-xxxx"
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {validationErrors?.company_phone && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.company_phone[0]}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Address</label>
              <textarea
                rows={2}
                value={formData.company_address}
                onChange={e => handleChange('company_address', e.target.value)}
                placeholder="Business address"
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {validationErrors?.company_address && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.company_address[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">NPWP (optional)</label>
              <input
                type="text"
                value={formData.npwp}
                onChange={e => handleChange('npwp', e.target.value)}
                placeholder="Tax ID number"
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {validationErrors?.npwp && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.npwp[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Logo URL (optional)</label>
              <input
                type="text"
                value={formData.company_logo_path}
                onChange={e => handleChange('company_logo_path', e.target.value)}
                placeholder="https://example.com/logo.png"
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {saving && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
