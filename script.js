// MEMORIA DEL SISTEMA (Recupera confirmados y stock guardado)
let productosConfirmados = JSON.parse(localStorage.getItem('confirmados')) || [];
let stockAlmacenado = JSON.parse(localStorage.getItem('stockAlmacenado')) || {}; // { "prod001": 30 }

function aleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function generarCodigoDinamico() {
    const p1 = aleatorio(10, 190);
    const p2 = aleatorio(100, 255);
    const p3 = 1; 
    const p4 = 100;
    const p5 = aleatorio(10, 99);
    const el = document.getElementById("codigo-ip");
    if(el) el.innerText = "ID: " + p1 + "." + p2 + "." + p3 + "." + p4 + "." + p5;
}
window.onload = generarCodigoDinamico;

// NAVEGACIÓN
function entrar() {
    if(document.getElementById("user").value !== "") window.location.href = "menu.html";
    else alert("Ingresa un nombre");
}

function funcionApp(nombre) {
    if(nombre === 'Confirmación') window.location.href = "confirmacion.html";
    else if(nombre === 'Almacenamiento') window.location.href = "almacenamiento.html";
    else if(nombre === 'Búsqueda') window.location.href = "busqueda.html";
}

// BASE DE DATOS AUTOMÁTICA
const productosDB = {};
const nombres = ["Ketchup", "Leche", "Arroz", "Aceite", "Detergente", "Jugo", "Harina", "Pasta"];
for (let i = 1; i <= 100; i++) {
    let id = "prod" + i.toString().padStart(3, '0');
    productosDB[id] = {
        nombre: nombres[i % nombres.length] + " Industrial Q" + i,
        litros: (i % 5 + 1) + " Litros",
        vencimiento: "20/12/2027",
        pasillo: "Pasillo " + ((i % 20) + 1)
    };
}

// LÓGICA CONFIRMACIÓN
function buscarProducto() {
    const code = document.getElementById("barcode-input").value.toLowerCase();
    const res = document.getElementById("resultado-producto");
    if(productosDB[code]) {
        const p = productosDB[code];
        document.getElementById("p-nombre").innerText = p.nombre;
        document.getElementById("p-litros").innerText = p.litros;
        document.getElementById("p-vence").innerText = p.vencimiento;
        document.getElementById("p-hora").innerText = new Date().toLocaleTimeString();
        res.style.display = "block";
        window.ultimoEscaneado = code;
    } else { alert("No encontrado"); }
}

function finalizarConfirmacion() {
    if(!productosConfirmados.includes(window.ultimoEscaneado)) {
        productosConfirmados.push(window.ultimoEscaneado);
        localStorage.setItem('confirmados', JSON.stringify(productosConfirmados));
    }
    alert("Producto confirmado.");
    window.location.href = "menu.html";
}

// LÓGICA ALMACENAMIENTO
function verificarParaAlmacenar() {
    const code = document.getElementById("storage-barcode").value.toLowerCase();
    const form = document.getElementById("form-almacenamiento");
    if(productosConfirmados.includes(code)) {
        const p = productosDB[code];
        document.getElementById("st-nombre").innerText = p.nombre;
        document.getElementById("st-vence").value = p.vencimiento;
        document.getElementById("st-pasillo").innerText = p.pasillo;
        form.style.display = "block";
        window.productoActualStorage = code;
    } else { alert("⚠️ BLOQUEO: Producto no confirmado."); }
}

function guardarEnAlmacen() {
    const cant = document.getElementById("st-cantidad").value;
    if(cant > 0) {
        // Guardamos la cantidad en el stock
        stockAlmacenado[window.productoActualStorage] = cant;
        localStorage.setItem('stockAlmacenado', JSON.stringify(stockAlmacenado));
        alert("Guardado en " + productosDB[window.productoActualStorage].pasillo);
        window.location.href = "menu.html";
    }
}

// LÓGICA BÚSQUEDA (NUEVO)
function consultarProducto() {
    const code = document.getElementById("query-barcode").value.toLowerCase();
    const card = document.getElementById("info-busqueda");
    const badge = document.getElementById("p-estado");

    if(productosDB[code]) {
        const p = productosDB[code];
        document.getElementById("b-nombre").innerText = p.nombre;
        document.getElementById("b-vence").innerText = p.vencimiento;
        
        if(stockAlmacenado[code]) {
            badge.innerText = "ALMACENADO";
            badge.style.background = "#28a745";
            document.getElementById("b-pasillo").innerText = p.pasillo;
            document.getElementById("b-stock").innerText = stockAlmacenado[code];
        } else if(productosConfirmados.includes(code)) {
            badge.innerText = "SOLO CONFIRMADO (Pendiente Almacén)";
            badge.style.background = "#f1c40f";
            document.getElementById("b-pasillo").innerText = "En muelle de entrada";
            document.getElementById("b-stock").innerText = "0";
        } else {
            badge.innerText = "NO RECIBIDO";
            badge.style.background = "#e94560";
            document.getElementById("b-pasillo").innerText = "Sin ubicación";
            document.getElementById("b-stock").innerText = "0";
        }
        card.style.display = "block";
    } else { alert("Código inexistente."); }
}