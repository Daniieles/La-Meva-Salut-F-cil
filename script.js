// ================= CONTROL DE VOZ =================
let voices = [];
let activarVoz = true;

// Cargar voces disponibles
function cargarVoces() {
    voices = speechSynthesis.getVoices();
}
speechSynthesis.onvoiceschanged = cargarVoces;

// Crear y reproducir voz
function crearVoz(text) {
    if(!activarVoz) return;

    speechSynthesis.cancel();

    const veu = new SpeechSynthesisUtterance(text);
    veu.lang = "es-ES";

    const veuSeleccionada =
        voices.find(v => v.lang.includes("es") && v.name.includes("Google")) || voices[0];

    veu.voice = veuSeleccionada;
    veu.rate = 1;
    veu.pitch = 1;

    speechSynthesis.speak(veu);
}

// Activar / desactivar voz
function toggleVoz() {
    activarVoz = !activarVoz;
    speechSynthesis.cancel();

    const btn = document.getElementById("activarVozBtn");

    if(activarVoz){
        btn.classList.add("voice-on");
        btn.classList.remove("voice-off");
        btn.textContent = "🔊";
    } else {
        btn.classList.add("voice-off");
        btn.classList.remove("voice-on");
        btn.textContent = "🔇";
    }

    if(navigator.vibrate){
        navigator.vibrate(100);
    }
}

// Leer texto según sección
function llegirText(seccio) {
    let text = "";

    switch(seccio) {
        case 'intro': text = "Benvingut a La Meva Salut Fàcil Plus."; break;
        case 'menu': text = "Estàs al menú principal."; break;
        case 'cita': text = "Estàs a Demanar cita mèdica."; break;
        case 'meves-cites': text = "Estàs a Les meves cites."; break;
        case 'medicaments': text = "Estàs a Els meus medicaments."; break;
        case 'resultats': text = "Estàs a Resultats de proves."; break;
        case 'ajuda': text = "Estàs a Ajuda."; break;
        case 'login': text = "Introdueix el teu número de targeta sanitària."; break;
        default: text = "Segueix els passos indicats.";
    }

    crearVoz(text);
}

// ================= ANIMACIÓN DE SECCIONES =================
// Fuerza la repetición de la animación cada vez que se muestra una pantalla
function animarSeccio(id) {
    const el = document.getElementById(id);
    el.classList.remove("fade-in");
    void el.offsetWidth; // Truco para reiniciar animación CSS
    el.classList.add("fade-in");
}

// Mostrar sección
function mostrarSeccio(id) {
    speechSynthesis.cancel();

    const seccions = ["menu-principal","cita","meves-cites","medicaments","resultats","ajuda"];
    seccions.forEach(s => document.getElementById(s).classList.add("hidden"));

    document.getElementById(id).classList.remove("hidden");
    animarSeccio(id);

    llegirText(id === "menu-principal" ? "menu" : id);
}

// Volver al menú
function tornarMenu() {
    mostrarSeccio("menu-principal");
}

// Verificar tarjeta
function verificarTarjeta() {
    const tarjeta = document.getElementById("tarjeta").value.trim();

    if(tarjeta === "") {
        alert("Si us plau, introdueix el número de targeta.");
        llegirText('login');
        return;
    }

    document.getElementById("login").classList.add("hidden");
    document.getElementById("menu-principal").classList.remove("hidden");
    animarSeccio("menu-principal");

    llegirText('menu');
}

// ================= CITES =================
let metgeSeleccionat = "";
let cites = [];

// Proceso paso a paso
function pasCita(step, valor) {
    speechSynthesis.cancel();

    if(step === 1) {
        metgeSeleccionat = valor;

        const dia = document.getElementById("seleccio-dia");
        dia.classList.remove("hidden");
        dia.innerHTML = "<p>Selecciona el dia:</p>";

        for(let i=1;i<=5;i++){
            let btn = document.createElement("button");
            btn.className = "btn blau slide-up"; // animación añadida
            btn.textContent = "Dia "+i;
            btn.onclick = () => pasCita(2,"Dia "+i);
            dia.appendChild(btn);
        }
    }
    else if(step ===2) {
        document.getElementById("seleccio-dia").classList.add("hidden");

        const hora = document.getElementById("seleccio-hora");
        hora.classList.remove("hidden");
        hora.innerHTML = "<p>Selecciona l'hora:</p>";

        ["10:00","12:00","14:00","16:00","18:00"].forEach(h => {
            let btn = document.createElement("button");
            btn.className = "btn blau slide-up"; // animación añadida
            btn.textContent = h;
            btn.onclick = () => pasCita(3,h);
            hora.appendChild(btn);
        });
    }
    else if(step ===3) {
        document.getElementById("seleccio-hora").classList.add("hidden");
        cites.push(metgeSeleccionat + " - " + valor);
        actualizarCites();
    }
}

// Actualizar lista de citas
function actualizarCites() {
    const llista = document.getElementById("llista-cites");
    llista.innerHTML = "";

    cites.forEach(c => {
        let li = document.createElement("li");
        li.textContent = c;
        li.classList.add("slide-up"); // animación suave
        llista.appendChild(li);
    });
}

// ================= PANTALLA DE CARGA =================
window.addEventListener("load", () => {
    let progress = 0;
    const barra = document.getElementById("progress");
    const pantalla = document.getElementById("loading-screen");

    const interval = setInterval(() => {
        progress += 10;
        barra.style.width = progress + "%";

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                pantalla.style.display = "none";
                llegirText("intro");
            }, 400);
        }
    }, 200);
});
