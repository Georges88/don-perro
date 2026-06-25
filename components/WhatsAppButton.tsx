export default function WhatsAppButton() {
  const message = encodeURIComponent("Hello Don Perro! I would like some help.");

  return (
    <a
      href={`https://wa.me/96171661011?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Don Perro on WhatsApp"
      title="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 md:bottom-7 md:right-7 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_28px_rgba(37,211,102,0.35)] transition-all duration-200 hover:-translate-y-1 hover:bg-[#20bd5a] hover:shadow-[0_12px_32px_rgba(37,211,102,0.45)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/30 active:scale-95"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-7 w-7 fill-current"
      >
        <path d="M16.04 3A12.84 12.84 0 0 0 5.01 22.42L3.2 29l6.73-1.76A12.85 12.85 0 1 0 16.04 3Zm0 23.5a10.66 10.66 0 0 1-5.43-1.49l-.39-.23-3.99 1.05 1.07-3.89-.25-.4A10.67 10.67 0 1 1 16.04 26.5Zm5.85-7.98c-.32-.16-1.9-.94-2.2-1.05-.29-.11-.5-.16-.72.16-.21.32-.82 1.05-1.01 1.26-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.58a9.63 9.63 0 0 1-1.78-2.21c-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.08-1.11 2.64s1.14 3.07 1.3 3.28c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.9-.77 2.17-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
      </svg>
      <span className="sr-only">WhatsApp</span>
    </a>
  );
}
