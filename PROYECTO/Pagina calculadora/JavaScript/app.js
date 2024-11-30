// Variables y Selectores
const formulario = document.getElementById('agregar-gasto');
const gastosListado = document.querySelector('#gastos ul');

// Eventos
eventListeners();
function eventListeners() {
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);
    formulario.addEventListener('submit', agregarGasto);
    gastosListado.addEventListener('click', eliminarGasto);
}

// Classes
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto(gasto) {
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }

    eliminarGasto(id) {
        this.gastos = this.gastos.filter(gasto => gasto.id.toString() !== id);
        this.calcularRestante();
    }

    calcularRestante() {
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0);
        this.restante = this.presupuesto - gastado;
    }
}

class UI {
    insertarPresupuesto(cantidad) {
        document.querySelector('#total').textContent = cantidad.presupuesto;
        document.querySelector('#restante').textContent = cantidad.restante;
    }

    imprimirAlerta(mensaje, tipo) {
        // Crear el div
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert');

        // Tipo de mensaje
        if (tipo === 'error') {
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }

        // Mensaje de error o éxito
        divMensaje.textContent = mensaje;

        // Insertar en el DOM
        document.querySelector('.primario').insertBefore(divMensaje, formulario);

        // Eliminar después de 3 segundos
        setTimeout(() => {
            document.querySelector('.primario .alert').remove();
        }, 3000);
    }

    agregarGastoListado(gastos) {
        // Limpiar HTML
        this.limpiarHTML();

        // Iterar sobre los gastos
        gastos.forEach(gasto => {
            const { nombre, cantidad, id } = gasto;

            // Crear un LI
            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            nuevoGasto.dataset.id = id;

            // Insertar el gasto
            nuevoGasto.innerHTML = `${nombre} <span class="badge badge-primary badge-pill">$ ${cantidad}</span>`;

            // Botón para borrar gasto
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.textContent = 'Borrar';
            nuevoGasto.appendChild(btnBorrar);

            // Insertar en el HTML
            gastosListado.appendChild(nuevoGasto);
        });
    }

    actualizarRestante(restante) {
        document.querySelector('span#restante').textContent = restante;
    }

    comprobarPresupuesto(presupuestoObj) {
        const { presupuesto, restante } = presupuestoObj;
        const restanteDiv = document.querySelector('.restante');

        // Cambiar colores según el presupuesto
        if (presupuesto / 4 > restante) {
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        } else if (presupuesto / 2 > restante) {
            restanteDiv.classList.remove('alert-success');
            restanteDiv.classList.add('alert-warning');
        } else {
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success');
        }

        // Deshabilitar el botón si el presupuesto se agota
        if (restante <= 0) {
            ui.imprimirAlerta('El presupuesto se ha agotado', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
        }
    }

    limpiarHTML() {
        while (gastosListado.firstChild) {
            gastosListado.removeChild(gastosListado.firstChild);
        }
    }
}

const ui = new UI();
let presupuesto;

function preguntarPresupuesto() {
    const presupuestoUsuario = prompt('¿Cuál es tu presupuesto?');

    if (presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0) {
        window.location.reload();
    }

    // Presupuesto válido
    presupuesto = new Presupuesto(presupuestoUsuario);

    // Insertar en el HTML
    ui.insertarPresupuesto(presupuesto);
}

function agregarGasto(e) {
    e.preventDefault();

    // Leer del formulario
    const nombre = document.querySelector('#gasto').value;555
    const cantidad = Number(document.querySelector('#cantidad').value);

    // Validar que solo contenga letras y espacios
    const soloLetras = /^[a-zA-Z\s]+$/;

    // Validar campos
    if (nombre === '' || cantidad === '') {
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
    } else if (!soloLetras.test(nombre)) {
        ui.imprimirAlerta('Campo de gasto no valido', 'error');
    } else if (cantidad <= 0 || isNaN(cantidad)) {
        ui.imprimirAlerta('Cantidad no válida', 'error');
    } else {
        // Crear objeto de gasto
        const gasto = { nombre, cantidad, id: Date.now() };
        
        // Añadir nuevo gasto
        presupuesto.nuevoGasto(gasto);

        // Mostrar mensaje de éxito
        ui.imprimirAlerta('Gasto agregado correctamente', 'success');

        // Actualizar listado
        ui.agregarGastoListado(presupuesto.gastos);

        // Actualizar presupuesto restante
        const { restante } = presupuesto;
        ui.actualizarRestante(restante);

        // Verificar presupuesto
        ui.comprobarPresupuesto(presupuesto);

        // Reiniciar formulario
        formulario.reset();
    }
}

function eliminarGasto(e) {
    if (e.target.classList.contains('borrar-gasto')) {
        // Obtener el ID del gasto a eliminar
        const { id } = e.target.parentElement.dataset;

        // Eliminar del objeto presupuesto
        presupuesto.eliminarGasto(id);

        // Actualizar el DOM para reflejar los cambios
        const { restante } = presupuesto;
        ui.actualizarRestante(restante);

        // Comprobar presupuesto restante
        ui.comprobarPresupuesto(presupuesto);

        // Habilitar botón si hay presupuesto disponible
        if (restante > 0) {
            formulario.querySelector('button[type="submit"]').disabled = false;
        }

        // Eliminar del DOM
        e.target.parentElement.remove();
    }
}
