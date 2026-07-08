// Floating WhatsApp chat button — links to the store owner's WhatsApp.
// Ghana number 0532340875 -> international format +233532340875.
const WHATSAPP_NUMBER = '233532340875';
const WHATSAPP_PRESET_MESSAGE = 'Hello! I have a question about my order.';

(function injectWhatsAppButton() {
    if (document.getElementById('whatsapp-float')) return;

    const link = document.createElement('a');
    link.id = 'whatsapp-float';
    link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_PRESET_MESSAGE)}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'Chat with us on WhatsApp');
    link.title = 'Chat with us on WhatsApp';
    link.innerHTML = `
        <svg width="30" height="30" viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.002 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.6 4.46 1.74 6.4L3.2 28.8l6.55-1.72a12.74 12.74 0 0 0 6.25 1.59h.003c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05A12.66 12.66 0 0 0 16.002 3.2zm0 23.28h-.005a10.64 10.64 0 0 1-5.42-1.48l-.39-.23-3.89 1.02 1.04-3.79-.25-.4a10.6 10.6 0 0 1-1.63-5.66c0-5.89 4.79-10.68 10.69-10.68 2.86 0 5.54 1.11 7.56 3.13a10.6 10.6 0 0 1 3.13 7.55c0 5.9-4.79 10.69-10.69 10.69zm5.85-7.99c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.51-.16-.73.16-.21.32-.83 1.05-1.02 1.26-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.59-1.6-.96-.86-1.6-1.92-1.79-2.24-.19-.32-.02-.49.14-.65.14-.14.32-.38.49-.56.16-.19.21-.32.32-.54.11-.21.05-.4-.03-.56-.08-.16-.73-1.76-1-2.4-.26-.63-.53-.55-.73-.56h-.62c-.21 0-.56.08-.85.4-.3.32-1.13 1.1-1.13 2.69 0 1.58 1.16 3.11 1.32 3.33.16.21 2.26 3.45 5.47 4.84.76.33 1.36.53 1.82.68.76.25 1.46.21 2.01.13.61-.09 1.9-.78 2.16-1.53.27-.75.27-1.39.19-1.53-.08-.13-.29-.21-.61-.37z"/>
        </svg>
    `;
    link.style.cssText = [
        'position:fixed',
        'bottom:24px',
        'right:24px',
        'z-index:9999',
        'width:56px',
        'height:56px',
        'border-radius:50%',
        'background:#25D366',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'box-shadow:0 6px 18px rgba(37,211,102,0.45)',
        'transition:transform .2s ease',
        'cursor:pointer'
    ].join(';') + ';';
    link.onmouseenter = () => (link.style.transform = 'scale(1.08)');
    link.onmouseleave = () => (link.style.transform = 'scale(1)');

    document.body.appendChild(link);
})();
