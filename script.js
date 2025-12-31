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

// Mostrar mensaje motivador
function mostrarMensajeMotivador(metge, dia, hora) {
    // Crear el mensaje flotante
    const mensajeDiv = document.createElement("div");
    mensajeDiv.className = "mensaje-motivador";
    mensajeDiv.innerHTML = `
        <div class="mensaje-contenido">
            <div class="mensaje-icon">🎉</div>
            <h3>¡Cita Confirmada!</h3>
            <p><strong>${metge}</strong></p>
            <p>${dia} a les ${hora}</p>
            <p class="mensaje-motivador-text">Molt bé! Has fet un pas important per a la teva salut. 💪</p>
            <p class="mensaje-pequeño">Recorda portar la targeta sanitària!</p>
            <button class="btn blau" onclick="this.parentElement.parentElement.remove()">D'acord</button>
        </div>
    `;
    
    document.body.appendChild(mensajeDiv);
    
    // Reproducir mensaje motivador por voz
    const mensajeVoz = `Perfecte! Has demanat cita amb ${metge} per al ${dia} a les ${hora}. 
    Molt bé! Has fet un pas important per a la teva salut. 
    Recorda portar la targeta sanitària. T'ho has guanyat!`;
    crearVoz(mensajeVoz);
    
    // Vibrar si es posible
    if(navigator.vibrate){
        navigator.vibrate([100, 50, 100]);
    }
    
    // Quitar automáticamente después de 10 segundos
    setTimeout(() => {
        if(mensajeDiv.parentElement) {
            mensajeDiv.remove();
        }
    }, 10000);
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
        crearVoz("Veu activada");
    } else {
        btn.classList.add("voice-off");
        btn.classList.remove("voice-on");
        btn.textContent = "🔇";
        crearVoz("Veu desactivada");
    }

    if(navigator.vibrate){
        navigator.vibrate(100);
    }
}

// Leer texto según sección
function llegirText(seccio) {
    let text = "";

    switch(seccio) {
        case 'intro': 
            text = "Benvingut o benvinguda a La Meva Salut Fàcil Plus. L'aplicació més senzilla per a les teves gestions mèdiques."; 
            break;
        case 'menu': 
            text = "Estàs al menú principal. Pots seleccionar: Demanar cita mèdica, Les meves cites, Els meus medicaments, Resultats de proves, o Ajuda."; 
            break;
        case 'cita': 
            text = "Estàs a Demanar cita mèdica. Primer selecciona el metge, després el dia i l'hora. Pots tornar enrere amb el botó fletxa."; 
            break;
        case 'meves-cites': 
            text = "Estàs a Les meves cites. Aquí veus totes les cites que has demanat."; 
            break;
        case 'medicaments': 
            text = "Estàs a Els meus medicaments. Aquí tens la llista de medicaments i els seus horaris."; 
            break;
        case 'resultats': 
            text = "Estàs a Resultats de proves. Pots veure els resultats dels teus exàmens mèdics."; 
            break;
        case 'ajuda': 
            text = "Estàs a Ajuda. Pots trucar a un familiar o a un assistent. No estàs sol o sola."; 
            break;
        case 'login': 
            text = "Introdueix el teu número de targeta sanitària. Si t'equivoques, no passa res, pots tornar-ho a escriure."; 
            break;
        default: 
            text = "Segueix els passos indicats. Pots activar o desactivar la veu amb el botó altaveu.";
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
    
    actualizarHistorial(id);
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
    
    actualizarHistorial('menu-principal');
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
        crearVoz("Has seleccionat " + valor + ". Ara tria el dia.");

        const dia = document.getElementById("seleccio-dia");
        dia.classList.remove("hidden");
        dia.innerHTML = "<p>Selecciona el dia:</p>";

        for(let i=1;i<=5;i++){
            let btn = document.createElement("button");
            btn.className = "btn blau slide-up";
            btn.textContent = "Dia "+i;
            btn.onclick = () => pasCita(2,"Dia "+i);
            dia.appendChild(btn);
        }
    }
    else if(step ===2) {
        crearVoz("Has triat " + valor + ". Ara selecciona l'hora.");
        document.getElementById("seleccio-dia").classList.add("hidden");

        const hora = document.getElementById("seleccio-hora");
        hora.classList.remove("hidden");
        hora.innerHTML = "<p>Selecciona l'hora:</p>";

        ["10:00","12:00","14:00","16:00","18:00"].forEach(h => {
            let btn = document.createElement("button");
            btn.className = "btn blau slide-up";
            btn.textContent = h;
            btn.onclick = () => pasCita(3,h);
            hora.appendChild(btn);
        });
    }
    else if(step ===3) {
        const horaSeleccionada = valor;
        document.getElementById("seleccio-hora").classList.add("hidden");
        
        // Extraer el día del valor (ej: "Dia 3")
        const diaSeleccionado = historialCitaDia || "Dia seleccionat";
        
        cites.push(metgeSeleccionat + " - " + diaSeleccionado + " a les " + horaSeleccionada);
        actualizarCites();
        
        // Mostrar mensaje motivador
        mostrarMensajeMotivador(metgeSeleccionat, diaSeleccionado, horaSeleccionada);
        
        // Añadir botón para volver al menú
        setTimeout(() => {
            const citaDiv = document.getElementById("cita");
            const existingBtn = citaDiv.querySelector('.btn-tornar-cita');
            if (!existingBtn) {
                const tornarBtn = document.createElement("button");
                tornarBtn.className = "btn verd btn-tornar-cita";
                tornarBtn.textContent = "⬅️ Tornar al menú";
                tornarBtn.onclick = tornarMenu;
                citaDiv.appendChild(tornarBtn);
            }
        }, 500);
    }
}

// Variable para guardar el día seleccionado temporalmente
let historialCitaDia = "";

// Modificar pasCita para guardar el día
function pasCita(step, valor) {
    speechSynthesis.cancel();

    if(step === 1) {
        metgeSeleccionat = valor;
        crearVoz("Has seleccionat " + valor + ". Ara tria el dia.");

        const dia = document.getElementById("seleccio-dia");
        dia.classList.remove("hidden");
        dia.innerHTML = "<p>Selecciona el dia:</p>";

        for(let i=1;i<=5;i++){
            let btn = document.createElement("button");
            btn.className = "btn blau slide-up";
            btn.textContent = "Dia "+i;
            btn.onclick = () => {
                historialCitaDia = "Dia "+i;
                pasCita(2,"Dia "+i);
            };
            dia.appendChild(btn);
        }
    }
    else if(step ===2) {
        crearVoz("Has triat " + valor + ". Ara selecciona l'hora.");
        document.getElementById("seleccio-dia").classList.add("hidden");

        const hora = document.getElementById("seleccio-hora");
        hora.classList.remove("hidden");
        hora.innerHTML = "<p>Selecciona l'hora:</p>";

        ["10:00","12:00","14:00","16:00","18:00"].forEach(h => {
            let btn = document.createElement("button");
            btn.className = "btn blau slide-up";
            btn.textContent = h;
            btn.onclick = () => pasCita(3,h);
            hora.appendChild(btn);
        });
    }
    else if(step ===3) {
        const horaSeleccionada = valor;
        document.getElementById("seleccio-hora").classList.add("hidden");
        
        cites.push(metgeSeleccionat + " - " + historialCitaDia + " a les " + horaSeleccionada);
        actualizarCites();
        
        // Mostrar mensaje motivador
        mostrarMensajeMotivador(metgeSeleccionat, historialCitaDia, horaSeleccionada);
        
        // Resetear variable temporal
        historialCitaDia = "";
        
        // Añadir botón para volver al menú
        setTimeout(() => {
            const citaDiv = document.getElementById("cita");
            const existingBtn = citaDiv.querySelector('.btn-tornar-cita');
            if (!existingBtn) {
                const tornarBtn = document.createElement("button");
                tornarBtn.className = "btn verd btn-tornar-cita";
                tornarBtn.textContent = "⬅️ Tornar al menú";
                tornarBtn.onclick = tornarMenu;
                citaDiv.appendChild(tornarBtn);
            }
        }, 500);
    }
}

// Actualizar lista de citas
function actualizarCites() {
    const llista = document.getElementById("llista-cites");
    llista.innerHTML = "";

    cites.forEach(c => {
        let li = document.createElement("li");
        li.textContent = c;
        li.classList.add("slide-up");
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

// ================= HISTORIAL DE NAVEGACIÓN =================
let historial = ['login']; // Empezamos en login

// Actualizar historial cuando cambiamos de sección
function actualizarHistorial(seccion) {
    // No añadir si es la misma que la última
    if (historial[historial.length - 1] !== seccion) {
        historial.push(seccion);
    }
    
    // Limitar historial a 10 elementos
    if (historial.length > 10) {
        historial = historial.slice(-10);
    }
    
    actualizarBotonesNav();
}

// Función Volver
function goBack() {
    if (historial.length > 1) {
        historial.pop(); // Quitar actual
        const anterior = historial[historial.length - 1];
        
        if (anterior === 'login') {
            document.getElementById("login").classList.remove("hidden");
            document.getElementById("menu-principal").classList.add("hidden");
            document.getElementById("cita").classList.add("hidden");
            document.getElementById("meves-cites").classList.add("hidden");
            document.getElementById("medicaments").classList.add("hidden");
            document.getElementById("resultats").classList.add("hidden");
            document.getElementById("ajuda").classList.add("hidden");
            crearVoz("Has tornat a l'inici. Introdueix la teva targeta sanitària.");
        } else {
            mostrarSeccio(anterior);
        }
    } else {
        alert("Ja ets al principi");
        crearVoz("Ja ets al principi");
    }
}

// Función Inicio (volver al menú principal)
function goHome() {
    historial = ['login', 'menu-principal'];
    mostrarSeccio('menu-principal');
    crearVoz("Has tornat al menú principal");
}

// Actualizar visibilidad de botones
function actualizarBotonesNav() {
    const backBtn = document.getElementById('backBtn');
    const homeBtn = document.getElementById('homeBtn');
    
    // Mostrar/ocultar según pantalla
    const pantallaActual = historial[historial.length - 1];
    
    if (pantallaActual === 'login') {
        backBtn.style.display = 'none';
        homeBtn.style.display = 'none';
    } else {
        backBtn.style.display = 'block';
        homeBtn.style.display = 'block';
    }
}

// Inicializar botones al cargar
document.addEventListener('DOMContentLoaded', function() {
    actualizarBotonesNav();
});
