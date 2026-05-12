import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, LayoutGrid } from 'lucide-react'

interface ChartRequiredForFoamBoardModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChartRequiredForFoamBoardModal({
  isOpen,
  onClose,
}: ChartRequiredForFoamBoardModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="foam-chart-required-title"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-sm border border-cream-200 shadow-xl max-w-md w-full p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-[#9b836e] hover:text-[#2c1f0e] rounded-sm"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <div className="flex items-center gap-3 mb-4 pr-10">
          <div className="w-10 h-10 rounded-sm bg-[#f5efe6] flex items-center justify-center text-[#c9a96e]">
            <LayoutGrid size={20} />
          </div>
          <h2 id="foam-chart-required-title" className="font-playfair text-xl text-[#2c1f0e] leading-tight">
            Create your seating chart first
          </h2>
        </div>
        <p className="font-raleway text-sm text-[#6b5744] leading-relaxed mb-6">
          The foam board is printed from your floor plan and table list. Import your guest list in our Seating Chart
          Tool, add your tables, and seat at least one guest — then you can complete your purchase here.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="font-raleway text-sm px-4 py-2.5 border border-cream-200 text-[#6b5744] hover:bg-cream-50 rounded-sm order-2 sm:order-1"
          >
            Close
          </button>
          <Link
            to="/seating-chart-tool"
            onClick={onClose}
            className="font-raleway text-sm px-4 py-2.5 bg-[#c9a96e] text-white text-center hover:bg-[#b8965a] rounded-sm order-1 sm:order-2"
          >
            Open Seating Chart Tool
          </Link>
        </div>
      </div>
    </div>
  )
}
