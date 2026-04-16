import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, X } from 'lucide-react';
import { Table, Guest } from '../../../types/seating';

interface QRCodeGeneratorProps {
  tables: Table[];
  guests: Guest[];
  onClose: () => void;
}

export default function QRCodeGenerator({ tables, guests, onClose }: QRCodeGeneratorProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const getTableGuests = (table: Table): Guest[] =>
    table.guestIds.map(id => guests.find(g => g.id === id)!).filter(Boolean);

  const getQRData = (table: Table): string => {
    const tableGuests = getTableGuests(table);
    const data = {
      tableName: table.name,
      guests: tableGuests.map(g => ({
        name: g.name,
        side: g.side,
        relationship: g.relationship,
        howWeMet: g.howWeMet,
        photo: g.photoUrl,
      })),
    };
    // Encode as JSON (for demo — in production use a hosted page URL)
    return 'data:application/json,' + encodeURIComponent(JSON.stringify(data));
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Codes - Wedding Seating</title>
          <style>
            body { font-family: Georgia, serif; margin: 0; padding: 20px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; text-align: center; break-inside: avoid; }
            .table-name { font-size: 18px; font-weight: bold; color: #374151; margin-bottom: 8px; }
            .guests { font-size: 12px; color: #6b7280; margin-top: 8px; }
            .qr-wrapper { margin: 10px auto; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
          <div>
            <h2 className="font-playfair text-2xl text-gray-800">QR Memory Codes</h2>
            <p className="font-raleway text-sm text-gray-500">
              Print these and place on table cards. Guests scan to see who's at their table!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-white rounded-xl font-raleway text-sm hover:bg-gold-600 transition-colors"
            >
              <Download size={15} /> Print All
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* QR Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div ref={printRef}>
            <div className="grid grid-cols-3 gap-4">
              {tables.map(table => {
                const tableGuests = getTableGuests(table);
                const qrValue = getQRData(table);

                return (
                  <div
                    key={table.id}
                    className="border border-cream-200 rounded-2xl p-4 text-center bg-cream-50"
                  >
                    <div className="font-playfair text-lg text-gray-800 mb-1">{table.name}</div>
                    <div className="font-raleway text-xs text-gray-400 mb-3">
                      {tableGuests.length} guests
                    </div>

                    <div className="flex justify-center mb-3 bg-white p-2 rounded-xl border border-cream-200">
                      <QRCodeSVG
                        value={qrValue.length > 2000 ? `Table: ${table.name} | ${tableGuests.map(g => g.name).join(', ')}` : qrValue}
                        size={120}
                        fgColor="#374151"
                        level="M"
                      />
                    </div>

                    <div className="text-left space-y-1">
                      {tableGuests.slice(0, 5).map(g => (
                        <div key={g.id} className="flex items-start gap-1.5">
                          <span className="text-sm">{g.photoUrl ? '📷' : '👤'}</span>
                          <div className="min-w-0">
                            <p className="font-raleway text-xs font-semibold text-gray-700 truncate">{g.name}</p>
                            {g.howWeMet && (
                              <p className="font-raleway text-xs text-gray-400 truncate italic">"{g.howWeMet}"</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {tableGuests.length > 5 && (
                        <p className="font-raleway text-xs text-gray-400">+{tableGuests.length - 5} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
