const API_URL = "http://54.123.45.67:3000"; // Cambia esta URL si el backend está en un servidor diferente

// Login
document.getElementById("formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo = document.getElementById("loginCorreo").value;
  const contrasena = document.getElementById("loginContrasena").value;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo, contrasena }),
    });

    const data = await response.json();

    if (response.ok) {
      // Guardar los datos del usuario en el localStorage
      localStorage.setItem("usuario", JSON.stringify(data));

      if (data.isSuperuser) {
        // Redirigir a la página del superusuario
        window.location.href = "superadmin.html";
      } else {
        // Redirigir a la página principal para usuarios regulares
        window.location.href = "./empleados/dashboard.html";
      }
    } else {
      // Mostrar mensaje de error
      document.getElementById("loginMessage").textContent = data.message;
    }
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("loginMessage").textContent = "Error al iniciar sesión.";
  }
});
