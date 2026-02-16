// Inicializar animaciones
AOS.init({
    duration: 1200, // Un poco más lento para que sea más elegante
    once: true // Que solo se anime una vez al bajar
});

// --- CONFIGURA AQUÍ LA FECHA DE LOS XV ---
// NOTA: Los meses en JS empiezan en 0 (Enero=0, Diciembre=11)
// Ejemplo: 24 de Diciembre de 2026 a las 8 PM
const eventDate = new Date(2026, 11, 19, 12, 0, 0).getTime();

const updateTimer = setInterval(() => {
    const now = new Date().getTime();
    const diff = eventDate - now;

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // Aseguramos que los números siempre tengan dos dígitos (ej. "05" en vez de "5")
    document.getElementById('days').innerText = d < 10 ? '0' + d : d;
    document.getElementById('hours').innerText = h < 10 ? '0' + h : h;
    document.getElementById('minutes').innerText = m < 10 ? '0' + m : m;

    if (diff < 0) {
        clearInterval(updateTimer);
        document.getElementById('timer').innerHTML = "<h3 class='fancy-title'>¡Hoy es el gran día!</h3>";
    }
}, 1000);

// ... (Tu código del contador está arriba) ...

// === LÓGICA DEL MODAL Y WHATSAPP ===

const modal = document.getElementById('rsvpModal');

// Función para abrir el modal
function openModal() {
    modal.classList.add('show-modal');
}

// Función para cerrar el modal
function closeModal() {
    modal.classList.remove('show-modal');
}

// Cerrar si el usuario hace click fuera de la cajita blanca
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

// Función para enviar los datos a WhatsApp
function sendToWhatsapp(e) {
    e.preventDefault(); // Evita que se recargue la página

    const name = document.getElementById('guestName').value;
    const count = document.getElementById('guestCount').value;

    // AQUI PONES TU NUMERO DE TELEFONO (con código de país, sin +)
    const phoneNumber = "525559781006"; 

    // Creamos el mensaje personalizado
    const message = `¡Hola! Soy ${name} y confirmo mi asistencia a los XV Años.
    
 Número de invitados: ${count} personas.`;

    // Codificamos el texto para que sirva como URL (cambia espacios por %20, etc.)
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Abrimos WhatsApp en una nueva pestaña
    window.open(url, '_blank');

    // Opcional: Cerrar el modal después de enviar
    closeModal();
}