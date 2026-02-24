import React, { useState } from 'react';
import { Ship, Calendar, MapPin, CreditCard, CheckCircle, Ticket as TicketIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const MOCK_FERRIES = [
  { id: 1, operator: "Goundar Shipping", vessel: "Lomaiviti Princess V", price: 55, time: "18:00", duration: "12h", type: "Direct" },
  { id: 2, operator: "Patterson Brothers", vessel: "Spirit of Harmony", price: 71, time: "04:00", duration: "10h", type: "Bus + Ferry" },
  { id: 3, operator: "Interlink Shipping", vessel: "Origin Spirit", price: 65, time: "20:00", duration: "11h", type: "Direct" },
];

export default function VonuTravel() {
  const [step, setStep] = useState('search'); // search, results, payment, ticket
  const [booking, setBooking] = useState({ from: 'Suva', to: 'Savusavu', date: '2026-03-15' });
  const [selectedFerry, setSelectedFerry] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    setStep('results');
  };

  const selectFerry = (ferry) => {
    setSelectedFerry(ferry);
    setStep('payment');
  };

  const handlePayment = () => {
    // In a real app, this triggers the M-PAiSA API push
    setStep('ticket');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl flex flex-col">
      {/* Header */}
      <header className="bg-blue-700 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Ship size={28} /> VonuTravel
        </h1>
        <p className="text-blue-100 text-sm">Fiji's Inter-Island Link</p>
      </header>

      <main className="p-4 flex-grow">
        {/* STEP 1: SEARCH */}
        {step === 'search' && (
          <form onSubmit={handleSearch} className="space-y-4 mt-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-500 uppercase">From</label>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="text-blue-600" size={20} />
                <select className="bg-transparent w-full font-semibold focus:outline-none">
                  <option>Suva (Narain Jetty)</option>
                  <option>Natovi Landing</option>
                  <option>Lautoka Wharf</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-500 uppercase">To</label>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="text-red-600" size={20} />
                <select className="bg-transparent w-full font-semibold focus:outline-none">
                  <option>Savusavu</option>
                  <option>Nabouwalu</option>
                  <option>Taveuni</option>
                  <option>Kadavu</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform">
              Find Sailings
            </button>
          </form>
        )}

        {/* STEP 2: RESULTS */}
        {step === 'results' && (
          <div className="space-y-4">
            <button onClick={() => setStep('search')} className="text-blue-600 text-sm font-bold">← Back to Search</button>
            <h2 className="font-bold text-xl">Available Ships</h2>
            {MOCK_FERRIES.map(ferry => (
              <div key={ferry.id} onClick={() => selectFerry(ferry)} className="border-2 border-slate-100 p-4 rounded-2xl hover:border-blue-500 cursor-pointer transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{ferry.operator}</h3>
                    <p className="text-slate-500 text-sm italic">{ferry.vessel}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">${ferry.price}</span>
                </div>
                <div className="flex gap-4 mt-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1"><Calendar size={14}/> {ferry.time}</span>
                  <span className="bg-slate-100 px-2 rounded">{ferry.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 3: PAYMENT (M-PAiSA Simulation) */}
        {step === 'payment' && (
          <div className="text-center space-y-6 mt-8">
            <CreditCard size={64} className="mx-auto text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold">Total: ${selectedFerry.price}.00</h2>
              <p className="text-slate-500">Pay securely with M-PAiSA</p>
            </div>
            <input type="tel" placeholder="Enter M-PAiSA Number" className="w-full p-4 border-2 border-slate-200 rounded-xl text-center text-xl" />
            <button onClick={handlePayment} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg">
              Confirm & Pay
            </button>
          </div>
        )}

        {/* STEP 4: TICKET */}
        {step === 'ticket' && (
          <div className="bg-blue-600 p-6 rounded-3xl text-white text-center space-y-6 shadow-2xl">
            <div className="bg-white p-4 rounded-2xl inline-block">
              <QRCodeSVG value={`TICKET-${selectedFerry.id}-2026`} size={180} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Boarding Pass</h2>
              <p className="opacity-80">Present this at the wharf</p>
            </div>
            <div className="border-t border-blue-400 pt-4 text-left space-y-2">
              <p className="flex justify-between"><span>Vessel:</span> <b>{selectedFerry.vessel}</b></p>
              <p className="flex justify-between"><span>Route:</span> <b>{booking.from} → {booking.to}</b></p>
              <p className="flex justify-between"><span>Boarding:</span> <b>{selectedFerry.time}</b></p>
            </div>
            <button onClick={() => setStep('search')} className="bg-white text-blue-600 w-full py-3 rounded-xl font-bold">Done</button>
          </div>
        )}
      </main>

      {/* Footer Nav */}
      <nav className="border-t flex justify-around p-4 bg-slate-50">
        <div className="flex flex-col items-center text-blue-600"><Ship size={24} /><span className="text-[10px] font-bold">Sailing</span></div>
        <div className="flex flex-col items-center text-slate-400"><TicketIcon size={24} /><span className="text-[10px] font-bold">My Trips</span></div>
        <div className="flex flex-col items-center text-slate-400"><CheckCircle size={24} /><span className="text-[10px] font-bold">Status</span></div>
      </nav>
    </div>
  );
}