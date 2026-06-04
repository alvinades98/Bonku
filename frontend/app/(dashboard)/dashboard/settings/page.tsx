'use client'

import { useState, useEffect, useRef } from 'react'
import { authApi, ApiErrorClass, getUploadUrl } from '@/lib/api'
import type { User } from '@/lib/types'
import { showSuccess, showError } from '@/lib/toast'

export default function SettingsPage() {
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    company_phone: '',
    company_address: '',
    npwp: '',
    company_logo_path: '',
  })

  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      setLoading(true)
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
        showError(err.message, err.errors)
      } else {
        showError('Failed to load profile')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setValidationErrors(null)

    try {
      const updated = await authApi.updateProfile(formData)
      setProfile(updated)
      showSuccess('Profile updated successfully')
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        if (err.errors) {
          setValidationErrors(err.errors)
          showError(err.message, err.errors)
        } else {
          showError(err.message)
        }
      } else {
        showError('Failed to update profile')
      }
    } finally {
      setSaving(false)
    }
  }

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function handleLogoUpload(file: File) {
    const allowedTypes = ['image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      showError('Only JPG and PNG files are allowed')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      showError('File size must not exceed 2 MB')
      return
    }

    setUploading(true)
    try {
      const result = await authApi.uploadLogo(file)
      setFormData(prev => ({ ...prev, company_logo_path: result.path }))
      showSuccess('Logo uploaded successfully')
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        showError(err.message, err.errors)
      } else {
        showError('Failed to upload logo')
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleRemoveLogo() {
    setFormData(prev => ({ ...prev, company_logo_path: '' }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-32 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-4 w-56 bg-slate-100 rounded animate-pulse mt-3" />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 h-48 animate-pulse" />
        <div className="bg-white rounded-2xl border border-slate-200 h-64 animate-pulse" />
      </div>
    )
  }

  const inputClass = 'w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow'

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Settings</h1>
      <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage your business profile</p>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-slate-900">Personal Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                className={inputClass}
              />
              {validationErrors?.name && (
                <p className="mt-1.5 text-xs text-red-500">{validationErrors.name[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
              <p className="mt-1.5 text-xs text-slate-400">Email cannot be changed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-slate-900">Business Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Name</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={e => handleChange('company_name', e.target.value)}
                placeholder="Your business name"
                className={inputClass}
              />
              {validationErrors?.company_name && (
                <p className="mt-1.5 text-xs text-red-500">{validationErrors.company_name[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
              <input
                type="tel"
                value={formData.company_phone}
                onChange={e => handleChange('company_phone', e.target.value)}
                placeholder="+62 xxx-xxxx-xxxx"
                className={inputClass}
              />
              {validationErrors?.company_phone && (
                <p className="mt-1.5 text-xs text-red-500">{validationErrors.company_phone[0]}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
              <textarea
                rows={2}
                value={formData.company_address}
                onChange={e => handleChange('company_address', e.target.value)}
                placeholder="Business address"
                className={inputClass}
              />
              {validationErrors?.company_address && (
                <p className="mt-1.5 text-xs text-red-500">{validationErrors.company_address[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">NPWP (optional)</label>
              <input
                type="text"
                value={formData.npwp}
                onChange={e => handleChange('npwp', e.target.value)}
                placeholder="Tax ID number"
                className={inputClass}
              />
              {validationErrors?.npwp && (
                <p className="mt-1.5 text-xs text-red-500">{validationErrors.npwp[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Logo (optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleLogoUpload(file)
                }}
              />
              <div className="flex items-center gap-4">
                {formData.company_logo_path ? (
                  <div className="relative group">
                    <img
                      src={getUploadUrl(formData.company_logo_path)}
                      alt="Logo preview"
                      className="w-20 h-20 object-contain border border-slate-200 rounded-xl bg-white p-1"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors shadow-sm"
                      title="Remove logo"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                  </div>
                )}
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        Upload
                      </>
                    )}
                  </button>
                  <p className="text-xs text-slate-400 mt-1.5">JPG or PNG, max 2 MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200"
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
