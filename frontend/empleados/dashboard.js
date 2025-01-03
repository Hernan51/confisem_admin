const API_URL = "http://localhost:3000";

// Recuperar el nombre del usuario del almacenamiento local
const usuario = JSON.parse(localStorage.getItem("usuario"));

if (usuario && usuario.nombre) {
  document.getElementById("user-name").textContent = usuario.nombre;
}

// Función para cargar peticiones generales (estado: pendiente)
async function cargarPeticionesGenerales() {
  try {
    const response = await fetch(`${API_URL}/peticiones/pendientes`);
    const peticiones = await response.json();

    const peticionesList = document.getElementById("peticiones-list");
    peticionesList.innerHTML = "";

    peticiones.forEach((peticion) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="peticion-item">
          <span>${peticion.descripcion}</span>
          <button class="btn aceptar" data-id="${peticion.id}">Aceptar</button>
        </div>`;
      peticionesList.appendChild(li);
    });

    // Añadir evento a los botones aceptar
    document.querySelectorAll(".btn.aceptar").forEach(button =>
      button.addEventListener("click", (e) => aceptarPeticion(e.target.dataset.id))
    );
  } catch (error) {
    console.error("Error al cargar peticiones generales:", error);
  }
}

// Función para cargar tareas pendientes (estado: trabajando)
async function cargarTareasPendientes() {
  try {
    const response = await fetch(`${API_URL}/peticiones/trabajando`);
    const tareas = await response.json();

    const tareasList = document.getElementById("tareas-list");
    tareasList.innerHTML = "";

    tareas.forEach((tarea) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="tarea-item">
          <span>${tarea.descripcion}</span>
          <button class="btn completado" data-id="${tarea.id}">Completado</button>
        </div>`;
      tareasList.appendChild(li);
    });

    // Añadir evento a los botones completado
    document.querySelectorAll(".btn.completado").forEach(button =>
      button.addEventListener("click", (e) => completarTarea(e.target.dataset.id))
    );
  } catch (error) {
    console.error("Error al cargar tareas pendientes:", error);
  }
}

// Función para aceptar una petición (mover de pendiente a trabajando)
async function aceptarPeticion(id) {
  try {
    const response = await fetch(`${API_URL}/peticiones/${id}/aceptar`, { method: "POST" });

    if (response.ok) {
      cargarPeticionesGenerales(); // Actualiza las peticiones generales
      cargarTareasPendientes(); // Actualiza las tareas pendientes
    } else {
      const errorData = await response.json();
      alert(`Error al aceptar petición: ${errorData.message}`);
    }
  } catch (error) {
    console.error("Error al aceptar petición:", error);
    alert("Error al aceptar petición.");
  }
}


// Función para completar una tarea (mover de trabajando a completado)
async function completarTarea(id) {
  try {
    const response = await fetch(`${API_URL}/peticiones/${id}/completar`, {
      method: "POST",
    });

    if (response.ok) {
      cargarTareasPendientes(); // Actualiza tareas pendientes
    }
  } catch (error) {
    console.error("Error al completar tarea:", error);
  }
}

// Función para cargar historial de peticiones de un cliente
async function cargarHistorial() {
  const clienteId = document.getElementById("clienteSelect").value;

  try {
    const response = await fetch(`${API_URL}/peticiones/${clienteId}`);
    const historial = await response.json();

    const historialList = document.getElementById("historial-list");
    historialList.innerHTML = "";

    historial.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item.descripcion;
      historialList.appendChild(li);
    });
  } catch (error) {
    console.error("Error al cargar historial:", error);
  }
}

// Cerrar sesión
document.addEventListener("DOMContentLoaded", () => {
  const profileIcon = document.getElementById("profileIcon");
  const dropdownMenu = document.getElementById("dropdownMenu");

  profileIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle("active");
  });

  document.addEventListener("click", () => {
    if (dropdownMenu.classList.contains("active")) {
      dropdownMenu.classList.remove("active");
    }
  });

  dropdownMenu.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  document.getElementById("logout").addEventListener("click", () => {
    alert("Sesión cerrada");
    localStorage.clear();
    window.location.href = "../index.html";
  });

  cargarPeticionesGenerales();
  cargarTareasPendientes();
  document.getElementById("clienteSelect").addEventListener("change", cargarHistorial);
});
