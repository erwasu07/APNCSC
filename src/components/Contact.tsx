import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, Calendar, CheckCircle2, AlertCircle, QrCode, Copy, Check, ExternalLink, CreditCard } from 'lucide-react';
import { WebsiteSettings } from '../types';
import { SERVICES_LIST } from '../servicesData';

const SERVICE_PRICES: Record<string, number> = {
  'New PAN Card Application': 150,
  'Aadhaar Card Update Assistance': 100,
  'Voter ID Card Services': 120,
  'Ayushman Bharat Golden Card': 50,
  'PM Kisan Registration & e-KYC': 50,
  'e-Shram & Labour Card': 50,
  'State Certificates (Caste/Income/Domicile)': 120,
  'New Ration Card & Corrections': 150,
  'Passport Application Filing': 350,
  'Driving Licence Services': 250,
  'Utility Bill Payments & Recharges': 20,
  'B&W / Color Printing & Scanning': 20,
  'Passport Size Photos & Editing': 50,
  'Professional Resume & Typing Services': 100,
  'School & College Admissions': 150,
  'National & State Scholarship Forms': 100,
  'Competitive Exam & Admit Card Downloads': 60,
  'GST Registration & Return Assistance': 500,
  'MSME & UDYAM Business Registration': 200,
  'Digital Signature Certificate (DSC)': 400,
  'Custom Amount': 100
};

interface ContactProps {
  settings: WebsiteSettings;
  selectedService: string;
  setSelectedService: (service: string) => void;
}

export default function Contact({ settings, selectedService, setSelectedService }: ContactProps) {
  const [formType, setFormType] = useState<'contact' | 'appointment'>('contact');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [message, setMessage] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  // UPI payment fields
  const [payService, setPayService] = useState('New PAN Card Application');
  const [payAmount, setPayAmount] = useState('150');
  const [payRefName, setPayRefName] = useState('');
  const [copied, setCopied] = useState(false);

  // Status management
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync selected service when changed from outer state
  useEffect(() => {
    if (selectedService) {
      setService(selectedService);
      setFormType('appointment'); // Switch to appointment tab if coming from "Apply Now"
      const el = document.getElementById('contact-form-container');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [selectedService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    // Basic Validation
    if (!name.trim() || !phone.trim() || !service) {
      setStatusMessage({
        type: 'error',
        text: 'Please fill out all required fields: Name, Phone, and Service Required.'
      });
      setLoading(false);
      return;
    }

    const phoneRegex = /^[0-9+\s-]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid telephone contact number (10-15 digits).'
      });
      setLoading(false);
      return;
    }

    try {
      if (formType === 'contact') {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, service, message })
        });
        const text1 = await res.text();
        const data = text1 ? JSON.parse(text1) : {};
        if (res.ok) {
          setStatusMessage({
            type: 'success',
            text: 'Your query has been recorded. Confirmation emails have been generated in server logs!'
          });
          // Reset
          setName('');
          setEmail('');
          setPhone('');
          setMessage('');
          setSelectedService('');
        } else {
          setStatusMessage({ type: 'error', text: data.error || 'Failed to submit.' });
        }
      } else {
        // Appointment
        if (!appointmentDate || !appointmentTime) {
          setStatusMessage({
            type: 'error',
            text: 'Please choose both a preferred date and time slot.'
          });
          setLoading(false);
          return;
        }

        const res = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, service, appointmentDate, appointmentTime, message })
        });
        const text2 = await res.text();
        const data = text2 ? JSON.parse(text2) : {};

        // Web3Forms direct integration & real-time extraction dispatch
        try {
          const web3Payload = {
            access_key: 'a6293a04-2711-4d7c-bb7c-e7c9ed3d888c',
            subject: `Contact Desk Inquiry - ${name}`,
            from_name: 'APNA CSC Contact Desk',
            name: name,
            email: email || 'no-reply@apnacsc.in',
            phone_number: phone,
            service_requested: service,
            message: message || 'Desk appointment query from Contact Page'
          };

          const web3Item = {
            id: data.data?.id || `w3f-contact-${Date.now()}`,
            appId: data.data?.appId || `CSC21251567${String(Math.floor(1 + Math.random() * 999)).padStart(3, '0')}`,
            name: name,
            email: email,
            phone: phone,
            service: service,
            dateOfBirth: 'N/A',
            userCategory: 'General/OBC',
            paymentMode: 'cash',
            utrNumber: 'N/A',
            totalAmount: 0,
            message: message || 'Contact form inquiry',
            documents: [],
            appointmentDate: appointmentDate || new Date().toISOString().split('T')[0],
            appointmentTime: appointmentTime || '10:00 AM',
            status: 'pending' as const,
            date: new Date().toISOString(),
            source: 'Web3Forms API'
          };

          const existingW3F = JSON.parse(localStorage.getItem('csc_web3forms_submissions') || '[]');
          localStorage.setItem('csc_web3forms_submissions', JSON.stringify([web3Item, ...existingW3F]));

          fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(web3Payload)
          }).catch(err => console.error('Web3Forms contact delivery error:', err));

          window.dispatchEvent(new CustomEvent('csc_web3forms_sync', { detail: web3Item }));
        } catch (w3fErr) {
          console.error('Web3Forms dispatch error in Contact.tsx:', w3fErr);
        }
        if (res.ok) {
          const savedItem = data.data;
          if (savedItem) {
            try {
              const existing = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
              localStorage.setItem('csc_local_applications', JSON.stringify([savedItem, ...existing]));
              window.dispatchEvent(new CustomEvent('csc_appointment_created', { detail: savedItem }));
              window.dispatchEvent(new Event('storage'));
              const bc = new BroadcastChannel('csc_portal_sync');
              bc.postMessage({ type: 'NEW_APPOINTMENT', payload: savedItem });
              bc.close();
            } catch (e) {
              console.error('Contact sync dispatch error:', e);
            }
          }
          setStatusMessage({
            type: 'success',
            text: 'Your Desk Appointment has been booked. Confirmation details printed in server logs!'
          });
          // Reset
          setName('');
          setEmail('');
          setPhone('');
          setAppointmentDate('');
          setAppointmentTime('');
          setMessage('');
          setSelectedService('');
        } else {
          setStatusMessage({ type: 'error', text: data.error || 'Failed to book.' });
        }
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: 'Server connection timeout. Please check if your backend is currently active.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    window.open('https://whatsapp.com/channel/0029VbDgSe75a248qEZAbL3g', '_blank');
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-orange-500 font-extrabold tracking-widest text-xs uppercase mb-1 block font-display">Visit or Contact Us</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-950 dark:text-white tracking-tight font-display">
            Start Your Application Process Today
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Have questions about documents? Send us a message or book a priority desk slot to skip the waiting line.
          </p>
        </div>

        {/* Contact Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Business Details & Map */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Contact Info Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Apex Kiosk Location</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Office Address</h4>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed mt-0.5">
                      {settings.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Support</h4>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-bold mt-0.5">
                      {settings.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Email</h4>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                      {settings.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Office Timings</h4>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                      {settings.officeHours}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instant Messenger CTA Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 py-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-2xl border border-emerald-200/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  id="contact-whatsapp-btn"
                  title="Join Our WhatsApp Channel"
                >
                  <MessageSquare className="w-4 h-4" />
                  Join WhatsApp Channel
                </button>
                <a
                  href={`tel:${settings.phone}`}
                  className="flex-1 py-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 font-bold text-xs rounded-2xl border border-blue-200/50 flex items-center justify-center gap-1.5 transition-all text-center"
                  id="contact-call-btn"
                >
                  <Phone className="w-4 h-4" />
                  Call Support Now
                </a>
              </div>
            </div>

            {/* Google Map Embedded iframe */}
            <div className="rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-800 shadow-sm bg-slate-200 aspect-video h-64">
              <iframe
                title="Apex Cyber Cafe Google Maps Location"
                src={settings.googleMapsEmbed}
                className="w-full h-full border-0"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                id="gmap-iframe"
              ></iframe>
            </div>

            {/* UPI QR Code Payment Component */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-5" id="contact-upi-payment-card">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-orange-50 dark:bg-orange-950/25 text-orange-600 dark:text-orange-400">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">Instant UPI Payment</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Pay securely via any BHIM UPI mobile app</p>
                </div>
              </div>

              {/* Input section */}
              <div className="space-y-3.5">
                <div>
                  <label htmlFor="payment-service-select" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    Select Service for Payment
                  </label>
                  <select
                    id="payment-service-select"
                    value={payService}
                    onChange={(e) => {
                      const srv = e.target.value;
                      setPayService(srv);
                      if (srv !== 'Custom Amount') {
                        setPayAmount(String(SERVICE_PRICES[srv] || 100));
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-850 dark:text-white outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                  >
                    {Object.keys(SERVICE_PRICES).map((srv) => (
                      <option key={srv} value={srv}>
                        {srv} {srv !== 'Custom Amount' ? `(₹${SERVICE_PRICES[srv]})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Amount input */}
                {payService === 'Custom Amount' && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label htmlFor="payment-custom-amount" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Enter Custom Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        id="payment-custom-amount"
                        min="1"
                        max="50000"
                        placeholder="Amount"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                    {/* Presets */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['20', '50', '100', '200', '500'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setPayAmount(preset)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                            payAmount === preset
                              ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          ₹{preset}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reference name / phone */}
                <div>
                  <label htmlFor="payment-ref-name" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    Your Name or Mobile (For Tracking)
                  </label>
                  <input
                    type="text"
                    id="payment-ref-name"
                    placeholder="Enter details to link with payment"
                    value={payRefName}
                    onChange={(e) => setPayRefName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              {/* Real-time Dynamic QR Display Box */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                <div className="relative p-3 bg-white rounded-2xl border border-slate-200 shadow-sm group">
                  {/* Dynamic QR image */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=apexkiosk@upi&pn=${encodeURIComponent("A Digital Shop for Digital India")}&am=${payAmount}&cu=INR&tn=${encodeURIComponent(payRefName ? `Pay from ${payRefName} for ${payService}` : `Pay for ${payService}`)}`)}`}
                    alt="UPI QR Code Payment"
                    className="w-36 h-36 relative z-10 block"
                    referrerPolicy="no-referrer"
                    id="upi-payment-qrcode-img"
                  />
                  {/* Neon active corners or animated scanner line overlay */}
                  <div className="absolute inset-0 border-2 border-dashed border-orange-400/40 rounded-2xl pointer-events-none scale-[1.02]"></div>
                </div>

                <div className="text-center mt-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Payable Amount</span>
                  <span className="text-2xl font-black text-blue-950 dark:text-orange-400 tracking-tight block">
                    ₹{payAmount || '0'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("apexkiosk@upi");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`flex-1 py-2.5 rounded-xl border font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 ${
                    copied
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                      : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                  id="copy-upi-vpa-btn"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      UPI ID Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy UPI ID
                    </>
                  )}
                </button>
                <a
                  href={`upi://pay?pa=apexkiosk@upi&pn=${encodeURIComponent("A Digital Shop for Digital India")}&am=${payAmount}&cu=INR&tn=${encodeURIComponent(payRefName ? `Pay from ${payRefName} for ${payService}` : `Pay for ${payService}`)}`}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all text-center"
                  id="pay-direct-upi-btn"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Pay via UPI App
                </a>
              </div>

              <div className="flex items-start gap-2 bg-blue-50/50 dark:bg-blue-950/10 p-3 rounded-xl border border-blue-100/50 dark:border-blue-900/20">
                <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  <strong>Track Payment:</strong> Select your service, scan/pay, and present the payment confirmation status screen to our operator.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Interaction Form widget */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col" id="contact-form-container">
            {/* Tab selector */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => { setFormType('contact'); setStatusMessage(null); }}
                className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  formType === 'contact'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                id="form-tab-contact"
              >
                <Send className="w-3.5 h-3.5" />
                General Enquiry
              </button>
              <button
                type="button"
                onClick={() => { setFormType('appointment'); setStatusMessage(null); }}
                className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  formType === 'appointment'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                id="form-tab-appointment"
              >
                <Calendar className="w-3.5 h-3.5" />
                Book Desk Appointment
              </button>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-display">
              {formType === 'contact' ? 'Submit Online Query' : 'Reserve Kiosk Priority Slot'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              {formType === 'contact' 
                ? 'Fill details and outline your documents query. We process response within 2 hours.' 
                : 'Select preferred day & hour window. Staff will keep application credentials files ready.'}
            </p>

            {/* Notification alert banner */}
            {statusMessage && (
              <div className={`p-4 rounded-2xl border flex items-start gap-2.5 mb-6 animate-fade-in ${
                statusMessage.type === 'success' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400' 
                  : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-400'
              }`}>
                {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                <p className="text-xs font-semibold leading-relaxed">{statusMessage.text}</p>
              </div>
            )}

            {/* Form Tag */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name input */}
                <div>
                  <label htmlFor="customer-name" className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="customer-name"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-850 dark:text-white outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                  />
                </div>

                {/* Telephone contact input */}
                <div>
                  <label htmlFor="customer-phone" className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="customer-phone"
                    required
                    placeholder="e.g., +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-850 dark:text-white outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email input */}
                <div>
                  <label htmlFor="customer-email" className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    id="customer-email"
                    placeholder="Enter email to get updates"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-850 dark:text-white outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                  />
                </div>

                {/* Service required selection */}
                <div>
                  <label htmlFor="customer-service" className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    Service Required <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="customer-service"
                    required
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-805 dark:text-white outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                  >
                    <option value="">-- Choose Category --</option>
                    {SERVICES_LIST.map((srv) => (
                      <option key={srv.id} value={srv.name}>
                        {srv.name}
                      </option>
                    ))}
                    <option value="Other CSC Government Schemes">Other Government Schemes</option>
                    <option value="Other SBI Banking Assistance">Other Banking Assistance</option>
                    <option value="General Cyber Typing Printing">General Typing / Printing</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Appointment Date / Time Pickers */}
              {formType === 'appointment' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                  <div>
                    <label htmlFor="appointment-date" className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                      Choose Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="appointment-date"
                      required={formType === 'appointment'}
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-850 dark:text-white outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                    />
                  </div>

                  <div>
                    <label htmlFor="appointment-time" className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                      Choose Time Window <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="appointment-time"
                      required={formType === 'appointment'}
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-850 dark:text-white outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                    >
                      <option value="">-- Select Time Slot --</option>
                      <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                      <option value="10:00 AM - 11:30 AM">10:00 AM - 11:30 AM</option>
                      <option value="11:30 AM - 01:00 PM">11:30 AM - 01:00 PM</option>
                      <option value="02:00 PM - 03:30 PM">02:00 PM - 03:30 PM</option>
                      <option value="03:30 PM - 05:00 PM">03:30 PM - 05:00 PM</option>
                      <option value="05:00 PM - 07:00 PM">05:00 PM - 07:00 PM</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Message query detail textarea */}
              <div>
                <label htmlFor="customer-message" className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Explain Your Requirements / Note <span className="text-slate-400">(Optional)</span>
                </label>
                <textarea
                  id="customer-message"
                  rows={4}
                  placeholder={
                    formType === 'contact'
                      ? 'e.g. I need to register for a new PAN card. Is Aadhaar mandatory, or can I submit a 10th marksheet instead?'
                      : 'e.g. Bringing old passport copy, 10th marksheet, and biometric credentials. Seeking fast PSK slot booking.'
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-850 dark:text-white outline-none focus:border-blue-500 focus:bg-white transition-all font-medium resize-none"
                ></textarea>
              </div>

              {/* Form submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-450 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 dark:shadow-none hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                id="form-submit-btn"
              >
                {loading ? (
                  <span>Saving to Secure DB...</span>
                ) : formType === 'contact' ? (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Online Request
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Confirm My Desk Reservation
                  </>
                )}
              </button>
            </form>

            {/* Spam protection micro-copy */}
            <p className="text-[10px] text-slate-400 text-center mt-4">
              🛡️ Form submissions are encrypted. Server-side validation and secure rate-limiting enabled automatically.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
