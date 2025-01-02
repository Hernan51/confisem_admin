const API_URL = "http://localhost:3000"; // Cambiar por la URL de tu backend

// Redirigir al login si no hay usuario autenticado
if (!localStorage.getItem("usuario")) {
  window.location.href = "index.html";
}

// Cerrar sesión
document.addEventListener("DOMContentLoaded", () => {
  const profileIcon = document.getElementById("profileIcon");
  const dropdownMenu = document.getElementById("dropdownMenu");

  // Alternar el menú desplegable al hacer clic en el icono
  profileIcon.addEventListener("click", (e) => {
    e.stopPropagation(); // Evita que el evento se propague al document
    dropdownMenu.classList.toggle("active");
  });

  // Cerrar el menú si se hace clic fuera
  document.addEventListener("click", () => {
    if (dropdownMenu.classList.contains("active")) {
      dropdownMenu.classList.remove("active");
    }
  });

  // Evitar que el menú se cierre al hacer clic dentro de él
  dropdownMenu.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Función para cerrar sesión
  const logout = document.getElementById("logout");
  logout.addEventListener("click", () => {
    alert("Sesión cerrada");
    localStorage.clear(); // Limpia el almacenamiento local
    window.location.href = "index.html"; // Redirige al login
  });
});

// Recuperar el nombre del usuario del almacenamiento local
const usuario = JSON.parse(localStorage.getItem("usuario")); // Asegúrate de que el nombre esté en localStorage

if (usuario && usuario.nombre) {
  document.getElementById("user-name").textContent = usuario.nombre;
}


// Función para cargar usuarios en la tabla
async function cargarUsuarios() {
  try {
    const response = await fetch(`${API_URL}/usuarios`);
    const usuarios = await response.json();

    const tbody = document.querySelector("#tablaUsuarios tbody");
    tbody.innerHTML = ""; // Limpiar tabla

    usuarios.forEach(usuario => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${usuario.id}</td>
        <td><input type="text" value="${usuario.nombre}" data-id="${usuario.id}" class="edit-nombre"></td>
        <td><input type="email" value="${usuario.correo}" data-id="${usuario.id}" class="edit-correo"></td>
        <td>
          <select data-id="${usuario.id}" class="edit-rol">
            <option value="admin" ${usuario.rol === "admin" ? "selected" : ""}>Admin</option>
            <option value="usuario" ${usuario.rol === "usuario" ? "selected" : ""}>Usuario</option>
          </select>
        </td>
        <td>
          <button class="guardar" data-id="${usuario.id}">Guardar</button>
          <button class="eliminar" data-id="${usuario.id}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Agregar eventos
    document.querySelectorAll(".guardar").forEach(btn => btn.addEventListener("click", actualizarUsuario));
    document.querySelectorAll(".eliminar").forEach(btn => btn.addEventListener("click", eliminarUsuario));
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  }
}

// Función para registrar usuario
document.getElementById("formCrearUsuario").addEventListener("submit", async e => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const correo = document.getElementById("correo").value;
  const contrasena = document.getElementById("contrasena").value;
  const rol = document.getElementById("rol").value;

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre, correo, contrasena, rol }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Usuario registrado con éxito");
      cargarUsuarios();
      // Limpiar el formulario
      document.getElementById("formCrearUsuario").reset();
    } else {
      alert(data.message || "Error al registrar usuario");
    }
  } catch (error) {
    console.error("Error al registrar usuario:", error);
  }
});

// Función para actualizar usuario
async function actualizarUsuario(e) {
  const id = e.target.getAttribute("data-id");
  const nombre = document.querySelector(`.edit-nombre[data-id="${id}"]`).value;
  const correo = document.querySelector(`.edit-correo[data-id="${id}"]`).value;
  const rol = document.querySelector(`.edit-rol[data-id="${id}"]`).value;

  try {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre, correo, rol }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Usuario actualizado");
    } else {
      alert(data.message || "Error al actualizar usuario");
    }
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
  }
}

// Función para eliminar usuario
async function eliminarUsuario(e) {
  const id = e.target.getAttribute("data-id");

  const confirmacion = confirm("¿Estás seguro de que deseas eliminar este usuario?");
  if (!confirmacion) return;

  try {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Usuario eliminado correctamente.");
      cargarUsuarios();
    } else {
      alert("Error al eliminar el usuario.");
    }
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
  }
}

// Inicializar la tabla
cargarUsuarios();
