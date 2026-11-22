
/* ============================================
   MICHI-PIZZERÍA
   PRE-ENTREGA 10: API, FETCH Y LIBRERÍAS
============================================ */


/* ============================================
   CLASE PIZZA
============================================ */

class Pizza {

    constructor(id, variedad, precio, tacc) {
        this.id = id;
        this.variedad = variedad.toLowerCase();
        this.precio = parseFloat(precio);
        this.tacc = tacc;
    }

}


/* ============================================
   VARIABLES Y ARRAY DE PIZZAS
============================================ */

// El menú se completará con los datos del JSON
let pizzas = [];


// Función para guardar el array actualizado
function guardarPizzas() {

    localStorage.setItem("pizzas", JSON.stringify(pizzas));

}


/* ============================================
   SELECCIONAR ELEMENTOS DEL DOM
============================================ */

const formulario = document.querySelector("#form-pizza");

const inputVariedad = document.querySelector("#variedad");
const inputPrecio = document.querySelector("#precio");
const selectTacc = document.querySelector("#tacc");

const buscador = document.querySelector("#buscador");

const btnTodas = document.querySelector("#btn-todas");
const btnSinTacc = document.querySelector("#btn-sin-tacc");
const btnCargarMenu = document.querySelector("#btn-cargar-menu");

const contenedorPizzas = document.querySelector("#contenedor-pizzas");

const mensaje = document.querySelector("#mensaje");
const estadoCarga = document.querySelector("#estado-carga");
const infoBienvenida = document.querySelector("#info-bienvenida");

const imagenGatito = document.querySelector("#imagen-gatito");
const estadoGatito = document.querySelector("#estado-gatito");


/* ============================================
   NOTIFICACIONES CON TOASTIFY
============================================ */

function notificar(texto, color = "#e58b45") {

    if (typeof Toastify === "function") {

        Toastify({
            text: texto,
            duration: 3000,
            gravity: "bottom",
            position: "right",
            style: {
                background: color
            }
        }).showToast();

    }

}


/* ============================================
   CREAR BOTÓN PARA VACIAR EL MENÚ
============================================ */

const btnVaciar = document.createElement("button");

btnVaciar.textContent = "Vaciar menú";
btnVaciar.id = "btn-vaciar";

contenedorPizzas.insertAdjacentElement("afterend", btnVaciar);


/* ============================================
   RENDERIZAR LAS PIZZAS EN PANTALLA
============================================ */

function renderizarPizzas(listaPizzas) {

    contenedorPizzas.innerHTML = "";

    // Operador ternario para mostrar un mensaje
    contenedorPizzas.innerHTML = listaPizzas.length === 0
        ? `<p class="sin-resultados">No encontramos pizzas disponibles.</p>`
        : "";

    if (listaPizzas.length === 0) return;

    listaPizzas.forEach((pizza) => {

        // DESTRUCTURING: extraemos las propiedades
        const { id, variedad, precio, tacc } = pizza;

        contenedorPizzas.innerHTML += `
            <div class="card-pizza">

                <h3>${variedad}</h3>

                <p>Precio: $${precio.toLocaleString("es-AR")}</p>

                <p>${tacc}</p>

                <button class="btn-modificar" data-id="${id}">
                    Modificar
                </button>

                <button class="btn-eliminar" data-id="${id}">
                    Eliminar
                </button>

            </div>
        `;

    });

}


/* ============================================
   FETCH + ASYNC/AWAIT
   CARGAR MENÚ DESDE DATA.JSON
============================================ */

async function cargarMenu() {

    try {

        // Deshabilitamos el botón durante la carga
        btnCargarMenu.disabled = true;

        estadoCarga.textContent = "Cargando menú...";

        // Solicitamos los datos del archivo JSON
        const respuesta = await fetch("./data.json");

        // Verificamos que la respuesta sea correcta
        if (!respuesta.ok) {
            throw new Error("No se pudo cargar el menú.");
        }

        // Convertimos la respuesta a formato JSON
        const datos = await respuesta.json();

        // Consultamos si existen pizzas guardadas
        const pizzasGuardadas = localStorage.getItem("pizzas");

        if (pizzasGuardadas !== null) {

            try {

                // Recuperamos los datos guardados
                const datosGuardados = JSON.parse(pizzasGuardadas);

                if (!Array.isArray(datosGuardados)) {
                    throw new Error("Los datos guardados no son válidos.");
                }

                // Reconstruimos las instancias de Pizza
                pizzas = datosGuardados.map((pizza) =>
                    new Pizza(
                        pizza.id,
                        pizza.variedad,
                        pizza.precio,
                        pizza.tacc
                    )
                );

            } catch (error) {

                console.error("Error al recuperar localStorage:", error);

                // Si los datos guardados están dañados,
                // recuperamos el menú original del JSON
                pizzas = datos.map((pizza) =>
                    new Pizza(
                        pizza.id,
                        pizza.variedad,
                        pizza.precio,
                        pizza.tacc
                    )
                );

                guardarPizzas();

            }

        } else {

            // Primera visita: cargamos las pizzas del JSON
            pizzas = datos.map((pizza) =>
                new Pizza(
                    pizza.id,
                    pizza.variedad,
                    pizza.precio,
                    pizza.tacc
                )
            );

            guardarPizzas();

        }

        // Renderizamos el menú en el DOM
        renderizarPizzas(pizzas);

        estadoCarga.textContent =
            "¡Menú cargado correctamente!";

        notificar("¡Nuestro menú está listo! 🍕");

    } catch (error) {

        console.error("Error al cargar el menú:", error);

        estadoCarga.textContent =
            "No pudimos cargar el menú.";

        notificar(
            "¡Ups! No se pudieron cargar las pizzas. 😿",
            "#d9534f"
        );

    } finally {

        // Habilitamos nuevamente el botón
        btnCargarMenu.disabled = false;

    }

}


/* ============================================
   MOSTRAR EL MENÚ AL INICIAR LA PÁGINA
============================================ */

cargarMenu();


/* ============================================
   TEMPORIZADOR: MENSAJE DE BIENVENIDA
============================================ */

setTimeout(() => {

    if (infoBienvenida) {

        infoBienvenida.textContent =
            "¡Bienvenido a Michi-Pizzería! Tenemos opciones Sin TACC para vos.";

    }

}, 3000);


/* ============================================
   CONSULTAR MENÚ ACTUALIZADO
============================================ */

btnCargarMenu.addEventListener("click", cargarMenu);


/* ============================================
   AGREGAR NUEVAS PIZZAS
============================================ */

formulario.addEventListener("submit", (e) => {

    e.preventDefault();

    const variedad = inputVariedad.value.trim();
    const precio = Number(inputPrecio.value);
    const tacc = selectTacc.value;

    // Validación de los datos
    if (
        variedad === "" ||
        !Number.isFinite(precio) ||
        precio <= 0 ||
        !tacc
    ) {

        mensaje.textContent =
            "Completá todos los campos correctamente.";

        notificar(
            "Revisá los datos ingresados. 😿",
            "#d9534f"
        );

        return;

    }

    // Generar un ID nuevo
    const nuevoId = pizzas.reduce(
        (max, pizza) => Math.max(max, pizza.id),
        -1
    ) + 1;

    const nuevaPizza = new Pizza(
        nuevoId,
        variedad,
        precio,
        tacc
    );

    // Actualizar el array
    pizzas.push(nuevaPizza);

    // Guardar y actualizar el DOM
    guardarPizzas();

    renderizarPizzas(pizzas);

    mensaje.textContent =
        `¡${variedad} se agregó correctamente al menú!`;

    notificar("¡Nueva pizza agregada! 🍕");

    formulario.reset();

});


/* ============================================
   BUSCADOR DE PIZZAS
============================================ */

buscador.addEventListener("input", () => {

    const textoBuscado = buscador.value.toLowerCase().trim();

    const resultado = pizzas.filter((pizza) =>
        pizza.variedad.includes(textoBuscado)
    );

    renderizarPizzas(resultado);

});


/* ============================================
   FILTRO: MOSTRAR TODAS LAS PIZZAS
============================================ */

btnTodas.addEventListener("click", () => {

    buscador.value = "";

    renderizarPizzas(pizzas);

    mensaje.textContent =
        "Estás viendo todas nuestras pizzas.";

});


/* ============================================
   FILTRO: PIZZAS SIN TACC
============================================ */

btnSinTacc.addEventListener("click", () => {

    buscador.value = "";

    const sinTacc = pizzas.filter(
        (pizza) => pizza.tacc === "Sin TACC"
    );

    renderizarPizzas(sinTacc);

    mensaje.textContent =
        "Mostrando pizzas sin TACC.";

});


/* ============================================
   ELIMINAR Y MODIFICAR PIZZAS
============================================ */

contenedorPizzas.addEventListener("click", (e) => {

    // ELIMINAR UNA PIZZA

    if (e.target.classList.contains("btn-eliminar")) {

        const id = Number(e.target.dataset.id);

        pizzas = pizzas.filter(
            (pizza) => pizza.id !== id
        );

        guardarPizzas();

        renderizarPizzas(pizzas);

        mensaje.textContent =
            "La pizza fue eliminada del menú.";

        notificar("Pizza eliminada correctamente.");

    }


    // MODIFICAR UNA PIZZA

    if (e.target.classList.contains("btn-modificar")) {

        const id = Number(e.target.dataset.id);

        const pizza = pizzas.find(
            (pizza) => pizza.id === id
        );

        // Operador ?. para comprobar que la pizza exista
        if (!pizza) return;

        // DESTRUCTURING
        const { variedad, precio, tacc } = pizza;

        const nuevaVariedad = prompt(
            "Ingresá el nuevo nombre:",
            variedad
        );

        if (nuevaVariedad === null) return;

        const nuevoPrecio = prompt(
            "Ingresá el nuevo precio:",
            precio
        );

        if (nuevoPrecio === null) return;

        const nuevoTacc = prompt(
            "Ingresá Tiene TACC o Sin TACC:",
            tacc
        );

        if (nuevoTacc === null) return;

        // Validar los nuevos datos
        if (
            nuevaVariedad.trim() === "" ||
            !Number.isFinite(Number(nuevoPrecio)) ||
            Number(nuevoPrecio) <= 0 ||
            !["Tiene TACC", "Sin TACC"].includes(nuevoTacc)
        ) {

            mensaje.textContent =
                "Los datos ingresados no son válidos.";

            notificar(
                "Los datos ingresados no son válidos.",
                "#d9534f"
            );

            return;

        }

        // Modificar las propiedades del objeto
        pizza.variedad = nuevaVariedad.trim().toLowerCase();
        pizza.precio = Number(nuevoPrecio);
        pizza.tacc = nuevoTacc;

        guardarPizzas();

        renderizarPizzas(pizzas);

        mensaje.textContent =
            "¡La pizza fue modificada correctamente!";

        notificar("¡Pizza modificada correctamente! 🍕");

    }

});


/* ============================================
   VACIAR TODO EL MENÚ
============================================ */

btnVaciar.addEventListener("click", () => {

    const confirmar = confirm(
        "¿Querés eliminar todas las pizzas?"
    );

    if (confirmar) {

        pizzas = [];

        guardarPizzas();

        renderizarPizzas(pizzas);

        mensaje.textContent =
            "El menú fue vaciado correctamente.";

        notificar("El menú fue vaciado. 🐾");

    }

});


/* ============================================
   FETCH + ASYNC/AWAIT
   CARGAR GATITO ALEATORIO DESDE CATAAS
============================================ */

async function cargarGatito() {

    estadoGatito.textContent =
        "🐱 Buscando a nuestro chef...";

    try {

        // Solicitamos una imagen aleatoria
        const respuesta = await fetch("https://cataas.com/cat");

        // Verificamos la respuesta
        if (!respuesta.ok) {
            throw new Error("No se pudo obtener la imagen.");
        }

        // Convertimos la respuesta en una imagen
        const imagen = await respuesta.blob();

        // Liberamos la URL anterior si existe
        if (imagenGatito.dataset.urlAnterior) {
            URL.revokeObjectURL(imagenGatito.dataset.urlAnterior);
        }

        // Creamos una URL para mostrar la imagen
        const urlImagen = URL.createObjectURL(imagen);

        imagenGatito.src = urlImagen;

        imagenGatito.dataset.urlAnterior = urlImagen;

        estadoGatito.textContent =
            "¡Nuestro chef ya está aquí! 🐾";

        notificar("¡Llegó un nuevo chef a Michi-Pizzería! 🐾");

    } catch (error) {

        console.error("Error al cargar el gatito:", error);

        estadoGatito.textContent =
            "No pudimos encontrar a nuestro chef 😿";

        notificar(
            "¡Ups! No pudimos cargar el gatito.",
            "#d9534f"
        );

    } finally {

        console.log("Proceso de carga del gatito finalizado.");

    }

}


/* ============================================
   CARGAR EL GATITO AL INICIAR LA PÁGINA
============================================ */

cargarGatito();
