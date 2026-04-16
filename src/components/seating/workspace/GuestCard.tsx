import React, { useRef, useState, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { User, Camera } from 'lucide-react';
import { Guest } from '../../../types/seating';
import { useSeatingStore } from '../../../store/seatingStore';

interface GuestCardProps {
  guest: Guest;
  compact?: boolean;
  isDragOverlay?: boolean;
}

const RsvpBadge = ({ status }: { status: Guest['rsvpStatus'] }) => {
  if (status === 'Yes') return <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>;
  if (status === 'No') return <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full flex items-center justify-center text-white text-xs">✗</span>;
  return <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-white text-xs">?</span>;
};

const SideDot = ({ side }: { side: Guest['side'] }) => {
  const color = side === 'Bride' ? 'bg-pink-400' : side === 'Groom' ? 'bg-blue-400' : 'bg-purple-400';
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${color}`} />;
};

export const GuestCard = React.memo(({ guest, compact = false, isDragOverlay = false }: GuestCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: guest.id,
    data: { guest },
  });
  const updateGuest = useSeatingStore(s => s.updateGuest);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      updateGuest(guest.id, { photoUrl: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [guest.id, updateGuest]);

  // stopPropagation on pointerDown prevents dnd-kit from hijacking the click
  const handleAvatarPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
  }, []);

  const handleAvatarClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    fileInputRef.current?.click();
  }, []);

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging && !isDragOverlay ? 0.4 : 1,
    cursor: isDragOverlay ? 'grabbing' : 'grab',
    zIndex: isDragOverlay ? 9999 : undefined,
  };

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`relative flex items-center gap-2 px-2.5 py-1.5 bg-white border rounded-lg shadow-sm select-none transition-shadow ${
          isDragOverlay ? 'shadow-lg border-gold-300 rotate-1' : 'border-gray-200 hover:border-gold-300 hover:shadow'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div
          className="relative flex-shrink-0 cursor-pointer"
          onMouseEnter={() => setIsHoveringAvatar(true)}
          onMouseLeave={() => setIsHoveringAvatar(false)}
          onPointerDown={handleAvatarPointerDown}
          onClick={handleAvatarClick}
        >
          {guest.photoUrl ? (
            <img src={guest.photoUrl} alt={guest.name} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-cream-200 flex items-center justify-center">
              <User size={12} className="text-gold-600" />
            </div>
          )}
          {/* Upload overlay */}
          <div
            className={`absolute inset-0 rounded-full flex items-center justify-center bg-black/50 transition-opacity ${
              isHoveringAvatar ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Camera size={10} className="text-white" />
          </div>
          <RsvpBadge status={guest.rsvpStatus} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-raleway text-xs font-medium text-gray-700 truncate">{guest.name}</p>
          <div className="flex items-center gap-1">
            <SideDot side={guest.side} />
            <p className="font-raleway text-xs text-gray-400 truncate">{guest.relationship}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`relative flex flex-col items-center p-3 bg-white border rounded-xl shadow-sm select-none transition-all w-24 ${
        isDragOverlay ? 'shadow-xl border-gold-400 rotate-2 scale-105' : 'border-gray-200 hover:border-gold-300 hover:shadow-md cursor-grab active:cursor-grabbing'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="relative mb-2">
        <div
          className="relative cursor-pointer"
          onMouseEnter={() => setIsHoveringAvatar(true)}
          onMouseLeave={() => setIsHoveringAvatar(false)}
          onPointerDown={handleAvatarPointerDown}
          onClick={handleAvatarClick}
        >
          {guest.photoUrl ? (
            <img src={guest.photoUrl} alt={guest.name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-cream-200 flex items-center justify-center">
              <User size={20} className="text-gold-600" />
            </div>
          )}
          {/* Upload overlay */}
          <div
            className={`absolute inset-0 rounded-full flex items-center justify-center bg-black/50 transition-opacity ${
              isHoveringAvatar ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Camera size={14} className="text-white" />
          </div>
        </div>
        <RsvpBadge status={guest.rsvpStatus} />
      </div>
      <p className="font-raleway text-xs font-semibold text-gray-700 text-center leading-tight truncate w-full text-center">
        {guest.name.split(' ')[0]}
      </p>
      <div className="flex items-center gap-1 mt-0.5">
        <SideDot side={guest.side} />
        <p className="font-raleway text-xs text-gray-400 truncate" style={{ maxWidth: '72px' }}>
          {guest.relationship}
        </p>
      </div>
    </div>
  );
});

GuestCard.displayName = 'GuestCard';

export default GuestCard;
