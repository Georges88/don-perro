"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import FormNotice from "@/components/ui/FormNotice";

export default function ReservationForm() {
  const [ownerName, setOwnerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dogAge, setDogAge] = useState("");
  const [message, setMessage] = useState("");
  const [hasVaccinationBook, setHasVaccinationBook] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ownerName.trim()) return setFormError("Please enter the owner's full name.");
    if (!phoneNumber.trim()) return setFormError("Please enter a phone number so our team can contact you.");
    if (!dogAge.trim()) return setFormError("Please tell us your dog's age.");
    if (!hasVaccinationBook) return setFormError("Please attach a photo of your dog's vaccination book.");
    setFormError(null);

    const whatsappMessage = [
      "Hello Don Perro! I'd like to reserve a spot at the Dog Hotel.",
      "",
      "*Reservation Details:*",
      `• Owner: ${ownerName.trim()}`,
      `• Phone: ${phoneNumber.trim()}`,
      `• Dog's age: ${dogAge.trim()}`,
      `• Message: ${message.trim() || "None"}`,
      "",
      "I will attach the vaccination book image in this chat.",
    ].join("\n");

    const whatsappUrl = `https://wa.me/96171661011?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="reservation-form" className="py-20 bg-surface scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="max-w-3xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-heading text-on-background tracking-tight">
              Reserve a Stay for Your Dog
            </h2>
            <p className="text-base text-secondary mt-2">
              Complete the form below and our team will contact you regarding availability.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0px_10px_40px_rgba(90,96,90,0.04)] border border-secondary/10">
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <FormNotice message={formError} />
              
              {/* row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="owner-name" className="text-sm font-semibold text-on-surface block">
                    Owner Full Name *
                  </label>
                  <input 
                    type="text"
                    id="owner-name"
                    value={ownerName}
                    onChange={(e) => { setOwnerName(e.target.value); setFormError(null); }}
                    required
                    placeholder="e.g. John Doe"
                    className="w-full px-5 py-3.5 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary bg-surface-container-low text-sm outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone-number" className="text-sm font-semibold text-on-surface block">
                    Phone Number *
                  </label>
                  <input 
                    type="tel"
                    id="phone-number"
                    value={phoneNumber}
                    onChange={(e) => { setPhoneNumber(e.target.value); setFormError(null); }}
                    required
                    placeholder="e.g. +1 555 123 4567"
                    className="w-full px-5 py-3.5 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary bg-surface-container-low text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="dog-age" className="text-sm font-semibold text-on-surface block">
                    Dog's Age *
                  </label>
                  <input 
                    type="text"
                    id="dog-age"
                    value={dogAge}
                    onChange={(e) => { setDogAge(e.target.value); setFormError(null); }}
                    required
                    placeholder="e.g. 3 years"
                    className="w-full px-5 py-3.5 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary bg-surface-container-low text-sm outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="vaccination-book" className="text-sm font-semibold text-on-surface block">
                    Vaccination Book Image *
                  </label>
                  <input 
                    type="file"
                    id="vaccination-book"
                    accept="image/*"
                    onChange={(e) => { setHasVaccinationBook(Boolean(e.target.files?.length)); setFormError(null); }}
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-outline-variant bg-surface-container-low text-xs outline-none transition-all file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:bg-primary/15 file:text-primary hover:file:bg-primary/25 cursor-pointer"
                  />
                </div>
              </div>

              {/* textarea */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-semibold text-on-surface block">
                  Message (Optional)
                </label>
                <textarea 
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us anything important about your dog's behavior, special care requirements, or preferred stay dates."
                  className="w-full px-5 py-3.5 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary bg-surface-container-low text-sm h-32 outline-none resize-none transition-all"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-primary text-on-primary px-8 py-4.5 rounded-full font-bold shadow-[0_4px_14px_0_rgba(106,95,0,0.3)] hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Submit via WhatsApp
                </button>
                <p className="text-xs text-secondary text-center mt-4 italic">
                  Note: Please attach your vaccination book image manually in WhatsApp before sending.
                </p>
              </div>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
