function showMenu() {
    const menu = document.getElementById('menuList');
    const button = document.querySelector('.menu');
    const open = menu.style.display !== 'block';
    menu.style.display = open ? 'block' : 'none';
    button.setAttribute('aria-expanded', String(open));
}

function exploremore() { document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' }); }
function bookEvent(name) {
    document.getElementById('eventName').value = name;
    document.getElementById('eventForm').style.display = 'flex';
}
function closeForm() { document.getElementById('eventForm').style.display = 'none'; }
function confirmBooking(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const eventName = form.querySelector('#eventName').value;
    const body = `Name: ${form.querySelector('#userName').value}\nEmail: ${form.querySelector('#userEmail').value}\nEvent: ${eventName}\nSeats: ${form.querySelector('#seats').value}`;
    window.location.href = `mailto:${recipient()}?subject=${encodeURIComponent(`Event ticket enquiry: ${eventName}`)}&body=${encodeURIComponent(body)}`;
}

function recipient() { return document.body.dataset.bookingEmail || 'sujataguravkammar@gmail.com'; }
function openOutlook(subject, lines) {
    const address = recipient();
    window.location.href = `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}

function downloadBookingPDF(data) {
    const lines = [
        'SUJATA GURAV | ARTIST BOOKING SUMMARY', '',
        'ARTIST DETAILS', 'Artist: Sujata Gurav', `Artist contact: ${recipient()}`, 'Booking: Live performance enquiry', '',
        'CUSTOMER & EVENT', `Name: ${data.name}`, `Email: ${data.email}`, `Phone: ${data.phone}`,
        `Event type: ${data.eventType}`, `Event date: ${data.eventDate}`, `Event time: ${data.eventTime}`,
        `Venue / city: ${data.venue}`, `Expected audience: ${data.audience || 'Not specified'}`, '',
        'BOOKING REQUIREMENTS', data.requirements || 'No additional requirements provided.', '',
        'This document summarizes an enquiry only. The booking is not confirmed.'
    ];
    const esc = s => s.replace(/[^\x20-\x7E]/g, '?').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    const stream = `0.18 0.08 0.23 rg 0 0 612 792 re f\nBT /F1 20 Tf 0.95 0.82 0.40 rg 52 735 Td (${esc(lines[0])}) Tj 0 -34 Td 0.95 0.92 0.85 rg /F1 11 Tf\n${lines.slice(1).map(t => `0 -21 Td (${esc(t)}) Tj`).join('\n')}\nET`;
    const objects = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
    ];
    let pdf = '%PDF-1.4\n'; const offsets = [0];
    objects.forEach((obj, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`; });
    const xref = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(n => `${String(n).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
    link.download = 'Sujata-Gurav-Booking-Summary.pdf'; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(link.href);
}

function feedback(form, text, error = false) {
    const node = form.querySelector('.form-feedback');
    node.textContent = text; node.classList.toggle('error', error);
}

document.addEventListener('DOMContentLoaded', () => {
    const intro = document.getElementById('introAnimation');
    if (intro) {
        const skip = document.createElement('button'); skip.id = 'skipIntro'; skip.type = 'button'; skip.textContent = 'Skip intro →';
        intro.append(skip);
        const hide = () => { intro.classList.add('intro-skipped'); sessionStorage.setItem('introSeen', '1'); document.getElementById('Home')?.scrollIntoView({ behavior: 'smooth' }); };
        skip.addEventListener('click', hide);
        if (sessionStorage.getItem('introSeen') || location.hash) hide();
        else { sessionStorage.setItem('introSeen', '1'); setTimeout(() => intro.classList.add('intro-skipped'), 3800); }
    }

    document.querySelectorAll('.video-select').forEach(button => {
        button.addEventListener('click', () => {
            const player = document.getElementById(button.dataset.playerTarget);
            const videoId = button.dataset.videoId;
            if (!player || !videoId) return;
            player.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&playsinline=1`;
            player.title = button.dataset.videoTitle || 'Sujata Gurav official YouTube video';
            const captionId = button.dataset.playerTarget === 'reelPlayer' ? 'reelNowPlaying' : 'musicNowPlaying';
            const caption = document.getElementById(captionId);
            if (caption) caption.textContent = button.dataset.videoTitle;
            document.querySelectorAll(`.video-select[data-player-target="${button.dataset.playerTarget}"]`).forEach(card => card.setAttribute('aria-pressed', String(card === button)));
        });
    });

    const date = document.querySelector('[name="eventDate"]');
    const calendar = document.getElementById('eventCalendar');
    const minDate = new Date(); minDate.setMinutes(minDate.getMinutes() - minDate.getTimezoneOffset());
    const min = minDate.toISOString().slice(0, 10);
    if (date) date.min = min;
    if (calendar) { calendar.min = min; calendar.addEventListener('change', () => { date.value = calendar.value; }); }
    if (date && calendar) date.addEventListener('change', () => { calendar.value = date.value; });

    document.getElementById('bookingForm')?.addEventListener('submit', e => {
        e.preventDefault(); const form = e.currentTarget;
        if (!form.reportValidity()) return;
        const values = Object.fromEntries(new FormData(form).entries());
        if (values.eventDate < min) { feedback(form, 'Please choose a future date.', true); return; }
        if (form.dataset.submitting) return;
        form.dataset.submitting = 'true'; const button = form.querySelector('button[type="submit"]');
        button.disabled = true; button.textContent = 'Preparing your summary…';
        try {
            downloadBookingPDF(values);
            feedback(form, 'Booking summary downloaded. Your email app is opening with the request ready to review and send.');
            openOutlook('Artist Booking Request — Sujata Gurav', [
                'Artist: Sujata Gurav', `Name: ${values.name}`, `Email: ${values.email}`, `Phone: ${values.phone}`,
                `Event type: ${values.eventType}`, `Date: ${values.eventDate}`, `Time: ${values.eventTime}`,
                `Venue / city: ${values.venue}`, `Expected audience: ${values.audience || 'Not specified'}`,
                `Requirements: ${values.requirements || 'None specified'}`
            ]);
        } catch (_) { feedback(form, 'Could not prepare the booking summary. Please try again.', true); }
        finally { setTimeout(() => { delete form.dataset.submitting; button.disabled = false; button.textContent = 'Send Booking Request'; }, 1200); }
    });

    document.getElementById('messageForm')?.addEventListener('submit', e => {
        e.preventDefault(); const form = e.currentTarget;
        if (!form.reportValidity() || form.dataset.submitting) return;
        form.dataset.submitting = 'true'; const button = form.querySelector('button[type="submit"]'); button.disabled = true;
        button.textContent = 'Opening email…';
        const values = Object.fromEntries(new FormData(form).entries());
        openOutlook('Message for Sujata Gurav', [`Name: ${values.name}`, `Email: ${values.email}`, '', values.message]);
        feedback(form, 'Your email app is open with your message ready to review and send.');
        setTimeout(() => { delete form.dataset.submitting; button.disabled = false; button.textContent = '✉️ Send Message'; }, 1200);
    });

    const panel = document.getElementById('chatPanel');
    document.getElementById('chatToggle')?.addEventListener('click', () => { panel.hidden = !panel.hidden; });
    document.getElementById('chatClose')?.addEventListener('click', () => { panel.hidden = true; });
    const answers = [
        [/book|booking|hire|event/i, `For performance enquiries, use the Artist Booking form or email ${recipient()}.`],
        [/music|song|listen|youtube|album/i, 'Explore the Music & Performances player or visit youtube.com/@sujatagurav1 for Sujata’s official videos.'],
        [/about|bio|artist|sujata/i, 'Sujata Gurav is a vocalist and performer who shares her musical journey through live performances and recordings. Visit About and The Artist’s Journey for more.'],
        [/contact|email|phone/i, `You can reach Sujata at ${recipient()} or call +91 9060887575.`],
        [/event|performance|show/i, 'Sujata is available for event enquiries. Share your event date, venue, and details in the Artist Booking form.']
    ];
    function answerQuestion(question) {
        const match = answers.find(([pattern]) => pattern.test(question));
        return match ? match[1] : 'I can help with Sujata’s music, biography, performances, and bookings. Try one of the suggested questions or use the Contact section for other enquiries.';
    }
    document.querySelectorAll('.suggestions button').forEach(b => b.addEventListener('click', () => chatReply(b.textContent)));
    function chatReply(q) {
        const msgs = document.getElementById('chatMessages'); const user = document.createElement('p'); user.className = 'chat-user'; user.textContent = q;
        const reply = document.createElement('p'); reply.textContent = answerQuestion(q); msgs.append(user, reply); msgs.scrollTop = msgs.scrollHeight;
    }
    document.getElementById('chatForm')?.addEventListener('submit', e => { e.preventDefault(); const input = document.getElementById('chatInput'); if (input.value.trim()) { chatReply(input.value.trim()); input.value = ''; } });

    document.querySelectorAll('.menu-list a').forEach(a => a.addEventListener('click', () => { document.getElementById('menuList').style.display = 'none'; document.querySelector('.menu').setAttribute('aria-expanded', 'false'); }));
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.video-select').forEach(button => {
        button.addEventListener('click', () => {
            const player = document.getElementById(button.dataset.playerTarget);
            const videoId = button.dataset.videoId;
            if (!player || !videoId) return;
            player.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&playsinline=1`;
            player.title = button.dataset.videoTitle || 'Sujata Gurav official YouTube video';
            const captionId = button.dataset.playerTarget === 'reelPlayer' ? 'reelNowPlaying' : 'musicNowPlaying';
            const caption = document.getElementById(captionId);
            if (caption) caption.textContent = button.dataset.videoTitle;
            document.querySelectorAll(`.video-select[data-player-target="${button.dataset.playerTarget}"]`).forEach(card => card.setAttribute('aria-pressed', String(card === button)));
        });
    });
});
