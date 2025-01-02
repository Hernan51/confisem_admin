const API_URL = "http://localhost:3000";
const token = localStorage.getItem("token");

// Verifica si el usuario está autenticado
if (!token) {
  window.location.href = "index.html"; // Redirige al login si no hay token
}

// Obtener clientes simulados
async function obtenerClientes() {
  const response = await fetch(`${API_URL}/clientes`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const clientes = await response.json();
  mostrarClientes(clientes);
}

// Mostrar lista de clientes
function mostrarClientes(clientes) {
  const clientesList = document.getElementById("clientesList");
  clientesList.innerHTML = clientes
    .map(
      (cliente) => `
      <div class="cliente" onclick="abrirChat(${cliente.id}, '${cliente.nombre}')">
        ${cliente.nombre}
      </div>
    `
    )
    .join("");
}

// Abrir chat con un cliente
function abrirChat(clienteId, nombre) {
  const chatWindow = document.getElementById("chatWindow");
  chatWindow.innerHTML = `
    <h2>Chat con ${nombre}</h2>
    <div id="chatMessages"></div>
    <input type="text" id="mensaje" placeholder="Escribe un mensaje">
    <button onclick="enviarMensaje(${clienteId})">Enviar</button>
  `;
}

// Enviar mensaje
async function enviarMensaje(clienteId) {
  const mensaje = document.getElementById("mensaje").value;

  await fetch(`${API_URL}/clientes/${clienteId}/mensaje`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mensaje }),
  });

  document.getElementById("mensaje").value = "";
}

obtenerClientes();
