
/* ============================================
   MICHI-PIZZERÍA
   PRE-ENTREGA 10: API, FETCH Y LIBRERÍAS
============================================ */

class Pizza {

    constructor(id, variedad, precio, tacc) {
        this.id = id;
        this.variedad = variedad.toLowerCase();
        this.precio = parseFloat(precio);
        this.tacc = tacc;
    }

}




// El menú se completará con los datos del JSON
let pizzas = [];


function guardarPizzas() {

    localStorage.setItem("pizzas", JSON.stringify(pizzas));

}




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


const btnVaciar = document.createElement("button");

btnVaciar.textContent = "Vaciar menú";
btnVaciar.id = "btn-vaciar";

contenedorPizzas.insertAdjacentElement("afterend", btnVaciar);




function renderizarPizzas(listaPizzas) {

    contenedorPizzas.innerHTML = "";

    
    contenedorPizzas.innerHTML = listaPizzas.length === 0
        ? `<p class="sin-resultados">No encontramos pizzas disponibles.</p>`
        : "";

    if (listaPizzas.length === 0) return;

    listaPizzas.forEach((pizza) => {

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




async function cargarMenu() {

    try {

       
        btnCargarMenu.disabled = true;

        estadoCarga.textContent = "Cargando menú...";

        const respuesta = await fetch("./data.json");

        
        if (!respuesta.ok) {
            throw new Error("No se pudo cargar el menú.");
        }

        
        const datos = await respuesta.json();

      
        const pizzasGuardadas = localStorage.getItem("pizzas");

        if (pizzasGuardadas !== null) {

            try {

            
                const datosGuardados = JSON.parse(pizzasGuardadas);

                if (!Array.isArray(datosGuardados)) {
                    throw new Error("Los datos guardados no son válidos.");
                }

                
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


        btnCargarMenu.disabled = false;

    }

}




cargarMenu();


setTimeout(() => {

    if (infoBienvenida) {

        infoBienvenida.textContent =
            "¡Bienvenido a Michi-Pizzería! Tenemos opciones Sin TACC para vos.";

    }

}, 3000);

btnCargarMenu.addEventListener("click", cargarMenu);




formulario.addEventListener("submit", (e) => {

    e.preventDefault();

    const variedad = inputVariedad.value.trim();
    const precio = Number(inputPrecio.value);
    const tacc = selectTacc.value;

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


    pizzas.push(nuevaPizza);

    guardarPizzas();

    renderizarPizzas(pizzas);

    mensaje.textContent =
        `¡${variedad} se agregó correctamente al menú!`;

    notificar("¡Nueva pizza agregada! 🍕");

    formulario.reset();

});




buscador.addEventListener("input", () => {

    const textoBuscado = buscador.value.toLowerCase().trim();

    const resultado = pizzas.filter((pizza) =>
        pizza.variedad.includes(textoBuscado)
    );

    renderizarPizzas(resultado);

});




btnTodas.addEventListener("click", () => {

    buscador.value = "";

    renderizarPizzas(pizzas);

    mensaje.textContent =
        "Estás viendo todas nuestras pizzas.";

});




btnSinTacc.addEventListener("click", () => {

    buscador.value = "";

    const sinTacc = pizzas.filter(
        (pizza) => pizza.tacc === "Sin TACC"
    );

    renderizarPizzas(sinTacc);

    mensaje.textContent =
        "Mostrando pizzas sin TACC.";

});




contenedorPizzas.addEventListener("click", (e) => {



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




    if (e.target.classList.contains("btn-modificar")) {

        const id = Number(e.target.dataset.id);

        const pizza = pizzas.find(
            (pizza) => pizza.id === id
        );

        // Operador ?. para comprobar que la pizza exista
        if (!pizza) return;


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




async function cargarGatito() {

    estadoGatito.textContent =
        "🐱 Buscando a nuestro chef...";

    try {


        const respuesta = await fetch("https://cataas.com/cat");

        if (!respuesta.ok) {
            throw new Error("No se pudo obtener la imagen.");
        }

        const imagen = await respuesta.blob();

        if (imagenGatito.dataset.urlAnterior) {
            URL.revokeObjectURL(imagenGatito.dataset.urlAnterior);
        }

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


cargarGatito();
