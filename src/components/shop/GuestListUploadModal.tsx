import { useEffect, useRef, useState } from 'react'
import { X, Upload, AlertCircle, FileText, Loader2, CheckCircle2 } from 'lucide-react'
import { parseExcelFile } from '../../utils/excelParser'

interface GuestListUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (names: string[]) => void
  pricePerCardDisplay?: string
  submitting?: boolean
}

export default function GuestListUploadModal({
  isOpen,
  onClose,
  onConfirm,
  pricePerCardDisplay,
  submitting,
}: GuestListUploadModalProps) {
  const [names, setNames] = useState<string[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setNames([])
      setWarnings([])
      setFileName(null)
      setParsing(false)
      setError(null)
      setConfirmed(false)
      setDragActive(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, submitting, onClose])

  if (!isOpen) return null

  const handleFile = async (file: File) => {
    setError(null)
    setWarnings([])
    setNames([])
    setConfirmed(false)
    setFileName(file.name)
    setParsing(true)

    try {
      const result = await parseExcelFile(file)
      const extracted = result.guests
        .map((g) => g.name.replace(/\s*\(\d+\)$/, '').trim())
        .filter((n) => n.length > 0)

      if (result.errors.length > 0 && extracted.length === 0) {
        setError(result.errors.join(' '))
        return
      }
      if (extracted.length === 0) {
        setError('No valid names found. Make sure your file has a "Name" column.')
        return
      }

      setNames(extracted)
      setWarnings(result.warnings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file.')
    } finally {
      setParsing(false)
    }
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleProceed = () => {
    if (!confirmed || names.length === 0 || submitting) return
    onConfirm(names)
  }

  const reset = () => {
    setNames([])
    setWarnings([])
    setFileName(null)
    setError(null)
    setConfirmed(false)
  }

  const hasNames = names.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c1f0e]/75 backdrop-blur-sm p-4">
      <div className="bg-cream-50 rounded-sm shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-cream-200">
          <div>
            <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-1">
              Step 1 of 2
            </p>
            <h3 className="font-playfair text-2xl text-[#2c1f0e]">Upload Your Guest List</h3>
            <p className="font-raleway text-xs text-[#6b5744] mt-1">
              We'll print one place card per name. Upload an .xlsx or .csv file with a "Name" column.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-[#6b5744] hover:text-[#2c1f0e] p-1 disabled:opacity-40"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!hasNames ? (
            <div>
              <label
                onDragEnter={(e) => {
                  e.preventDefault()
                  setDragActive(true)
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-sm py-14 px-6 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-[#c9a96e] bg-[#c9a96e]/5'
                    : 'border-cream-200 hover:border-[#c9a96e]/60 hover:bg-cream-100'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={onInputChange}
                  className="hidden"
                  disabled={parsing}
                />
                {parsing ? (
                  <>
                    <Loader2 size={28} className="text-[#c9a96e] animate-spin" />
                    <p className="font-raleway text-sm text-[#6b5744]">Reading {fileName}…</p>
                  </>
                ) : (
                  <>
                    <Upload size={28} className="text-[#c9a96e]" />
                    <p className="font-playfair text-lg text-[#2c1f0e]">
                      Drop your guest list here, or click to browse
                    </p>
                    <p className="font-raleway text-xs text-[#9b836e]">
                      Accepted: .xlsx, .xls, .csv
                    </p>
                  </>
                )}
              </label>

              {error && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-sm">
                  <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="font-raleway text-xs text-red-600 leading-relaxed">{error}</p>
                </div>
              )}

              <div className="mt-6 p-4 bg-cream-100 border border-cream-200 rounded-sm">
                <p className="font-raleway text-xs tracking-widest uppercase text-[#6b5744] mb-2">
                  Tips for your file
                </p>
                <ul className="font-raleway text-xs text-[#6b5744] space-y-1 leading-relaxed list-disc list-inside">
                  <li>Include a column titled <span className="font-semibold">Name</span> (or "Guest", "Full Name").</li>
                  <li>One guest per row. Already have your seating chart spreadsheet? It works.</li>
                  <li>You'll see every name on the next step before paying.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-[#c9a96e]" />
                  <p className="font-raleway text-sm text-[#2c1f0e]">{fileName}</p>
                </div>
                <button
                  onClick={reset}
                  disabled={submitting}
                  className="font-raleway text-xs text-[#9b836e] hover:text-[#c9a96e] underline disabled:opacity-40"
                >
                  Upload a different file
                </button>
              </div>

              <div className="bg-[#c9a96e]/10 border border-[#c9a96e]/40 rounded-sm p-4 mb-4 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#c9a96e] mt-0.5 shrink-0" />
                <div>
                  <p className="font-playfair text-lg text-[#2c1f0e]">
                    {names.length} {names.length === 1 ? 'name' : 'names'} detected
                  </p>
                  {pricePerCardDisplay && (
                    <p className="font-raleway text-xs text-[#6b5744] mt-1">
                      Quantity will be set to {names.length} cards at {pricePerCardDisplay} each.
                    </p>
                  )}
                </div>
              </div>

              {warnings.length > 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-sm">
                  <p className="font-raleway text-xs text-amber-800 mb-1 font-semibold">
                    {warnings.length} row{warnings.length === 1 ? '' : 's'} skipped:
                  </p>
                  <ul className="font-raleway text-xs text-amber-700 space-y-0.5 max-h-20 overflow-y-auto">
                    {warnings.slice(0, 5).map((w, i) => (
                      <li key={i}>• {w}</li>
                    ))}
                    {warnings.length > 5 && <li>• …and {warnings.length - 5} more</li>}
                  </ul>
                </div>
              )}

              <p className="font-raleway text-xs tracking-widest uppercase text-[#6b5744] mb-2">
                Names to be printed
              </p>
              <div className="border border-cream-200 rounded-sm bg-white max-h-64 overflow-y-auto">
                <ol className="divide-y divide-cream-200">
                  {names.map((name, i) => (
                    <li
                      key={`${name}-${i}`}
                      className="flex items-baseline gap-3 px-4 py-2 font-raleway text-sm text-[#2c1f0e]"
                    >
                      <span className="font-raleway text-xs text-[#9b836e] w-8 shrink-0">
                        {i + 1}.
                      </span>
                      <span>{name}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <label className="mt-5 flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#c9a96e] cursor-pointer"
                />
                <span className="font-raleway text-sm text-[#2c1f0e] leading-relaxed">
                  I've reviewed every name and confirm the spelling is correct. Place cards will be printed exactly as shown above.
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-cream-200 flex items-center justify-end gap-3 bg-cream-100">
          <button
            onClick={onClose}
            disabled={submitting}
            className="font-raleway text-sm text-[#6b5744] hover:text-[#2c1f0e] px-4 py-2 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            disabled={!confirmed || !hasNames || submitting}
            className="btn-gold flex items-center gap-2 px-6 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Redirecting…
              </>
            ) : (
              <>Continue to Checkout</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
