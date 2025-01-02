const API_URL = "http://localhost:3000"; // Cambiar por la URL de tu backend

// Función para cargar peticiones generales
async function cargarPeticiones() {
  try {
    const response = await fetch(`${API_URL}/peticiones`);
    const peticiones = await response.json();
    const peticionesList = document.getElementById("peticiones-list");
    peticionesList.innerHTML = ""; // Limpiar lista

    peticiones.forEach((peticion) => {
      const li = document.createElement("li");
      li.textContent = peticion.descripcion;
      const aceptarBtn = document.createElement("button");
      aceptarBtn.textContent = "Aceptar";
      aceptarBtn.addEventListener("click", () => aceptarPeticion(peticion.id));
      li.appendChild(aceptarBtn);
      peticionesList.appendChild(li);
    });
  } catch (error) {
    console.error("Error al cargar peticiones:", error);
  }
}

// Función para aceptar una petición
async function aceptarPeticion(id) {
  try {
    const response = await fetch(`${API_URL}/peticiones/${id}/aceptar`, {
      method: "POST",
    });

    if (response.ok) {
      alert("Petición aceptada");
      cargarPeticiones();
      cargarTareas();
    }
  } catch (error) {
    console.error("Error al aceptar petición:", error);
  }
}

// Función para cargar tareas pendientes
async function cargarTareas() {
  try {
    const response = await fetch(`${API_URL}/tareas`);
    const tareas = await response.json();
    const tareasList = document.getElementById("tareas-list");
    tareasList.innerHTML = ""; // Limpiar lista

    tareas.forEach((tarea) => {
      const li = document.createElement("li");
      li.textContent = tarea.descripcion;
      tareasList.appendChild(li);
    });
  } catch (error) {
    console.error("Error al cargar tareas:", error);
  }
}

// Función para enviar mensajes en el chat
document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const mensaje = document.getElementById("chat-input").value;
  const fileInput = document.getElementById("file-upload");

  try {
    const formData = new FormData();
    formData.append("mensaje", mensaje);
    if (fileInput.files[0]) {
      formData.append("archivo", fileInput.files[0]);
    }

    const response = await fetch(`${API_URL}/chat/enviar`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      document.getElementById("chat-input").value = "";
      document.getElementById("file-upload").value = null;
      alert("Mensaje enviado");
    }
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
  }
});

// Inicializar
cargarPeticiones();
cargarTareas();
