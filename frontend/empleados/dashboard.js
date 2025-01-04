const API_URL = "http://ec2-54-236-111-1.compute-1.amazonaws.com:3000";

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

    // Ordenar las peticiones por nivel de urgencia
    peticiones.sort((a, b) => {
      const urgenciaNivel = { alta: 1, media: 2, baja: 3 };
      return urgenciaNivel[a.urgencia] - urgenciaNivel[b.urgencia];
    });

    const peticionesList = document.getElementById("peticiones-list");
    peticionesList.innerHTML = "";

    peticiones.forEach((peticion) => {
      const li = document.createElement("li");
      li.className = "peticion-item";

      // Aplicar estilos según el nivel de urgencia
      if (peticion.urgencia === "alta") {
        li.style.backgroundColor = "#ffcccc"; // Rojo claro
      } else if (peticion.urgencia === "media") {
        li.style.backgroundColor = "#fff5cc"; // Amarillo claro
      } else if (peticion.urgencia === "baja") {
        li.style.backgroundColor = "#ccffcc"; // Verde claro
      }

      li.innerHTML = `
        <div class="peticion-item">
          <span><strong>${peticion.descripcion}</strong></span><br>
          <small>Urgencia: ${peticion.urgencia}</small>
          <button class="btn aceptar" data-id="${peticion.id}">Aceptar</button>
        </div>`;  
      peticionesList.appendChild(li);
    });

    // Añadir evento a los botones aceptar
    document.querySelectorAll(".btn.aceptar").forEach((button) =>
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

    // Ordenar las tareas por nivel de urgencia
    tareas.sort((a, b) => {
      const urgenciaNivel = { alta: 1, media: 2, baja: 3 };
      return urgenciaNivel[a.urgencia] - urgenciaNivel[b.urgencia];
    });

    const tareasList = document.getElementById("tareas-list");
    tareasList.innerHTML = "";

    tareas.forEach((tarea) => {
      const li = document.createElement("li");
      li.className = "tarea-item";

      // Aplicar estilos según el nivel de urgencia
      if (tarea.urgencia === "alta") {
        li.style.backgroundColor = "#ffcccc"; // Rojo claro
      } else if (tarea.urgencia === "media") {
        li.style.backgroundColor = "#fff5cc"; // Amarillo claro
      } else if (tarea.urgencia === "baja") {
        li.style.backgroundColor = "#ccffcc"; // Verde claro
      }

      // Renderizar la tarea con el nombre del empleado responsable
      li.innerHTML = `
        <div class="tarea-item">
          <span><strong>${tarea.descripcion}</strong></span><br>
          <small>Urgencia: ${tarea.urgencia}</small><br>
          <small>Responsable: ${tarea.empleado_nombre || "Sin asignar"}</small>
          <button class="btn completado" data-id="${tarea.id}">Completado</button>
        </div>`;
      tareasList.appendChild(li);
    });

    // Añadir evento a los botones completado
    document.querySelectorAll(".btn.completado").forEach((button) =>
      button.addEventListener("click", (e) => completarTarea(e.target.dataset.id))
    );
  } catch (error) {
    console.error("Error al cargar tareas pendientes:", error);
  }
}



async function aceptarPeticion(id) {
  try {
    const usuarioActual = JSON.parse(localStorage.getItem("usuario"));

    if (!usuarioActual || !usuarioActual.nombre) {
      alert("No se encontró el usuario actual en localStorage.");
      return;
    }

    console.log("Datos enviados al backend:", {
      empleado_nombre: usuarioActual.nombre,
    });

    const response = await fetch(`${API_URL}/peticiones/${id}/aceptar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empleado_nombre: usuarioActual.nombre }),
    });

    if (response.ok) {
      await cargarPeticionesGenerales();
      await cargarTareasPendientes();
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
/*async function cargarHistorial() {
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
*/

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
  //document.getElementById("clienteSelect").addEventListener("change", cargarHistorial);
});
