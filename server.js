const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const dbConfig = {
  host: "database-1.cdaciig4auli.us-east-2.rds.amazonaws.com", // Cambia al host de tu base de datos
  user: "admin", // Usuario de tu base de datos
  password: "ConfisEm24+*", // Contraseña de tu base de datos
  database: "prueba", // Nombre de la base de datos
};

// Endpoint para registrar un usuario
app.post("/register", async (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;

  if (!nombre || !correo || !contrasena || !rol) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      "INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)",
      [nombre, correo, hashedPassword, rol]
    );

    await connection.end();

    res.status(201).json({ message: "Usuario registrado exitosamente." });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ message: "Error al registrar usuario." });
  }
});

app.get("/validate-superuser", async (req, res) => {
    const { correo } = req.query;
  
    try {
      const connection = await mysql.createConnection(dbConfig);
  
      const [rows] = await connection.execute(
        "SELECT rol FROM usuarios WHERE correo = ?",
        [correo]
      );
  
      await connection.end();
  
      if (rows.length === 0 || rows[0].rol !== "admin") {
        return res.status(403).json({ message: "Acceso denegado" });
      }
  
      res.json({ message: "Acceso permitido" });
    } catch (error) {
      console.error("Error al validar superusuario:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  });
  

// Endpoint para iniciar sesión
app.post("/login", async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ message: "Correo y contraseña son obligatorios." });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute("SELECT * FROM usuarios WHERE correo = ?", [correo]);

    await connection.end();

    if (rows.length === 0) {
      return res.status(401).json({ message: "Correo no registrado." });
    }

    const usuario = rows[0];
    const isPasswordValid = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Contraseña incorrecta." });
    }

    const isSuperuser = usuario.rol === "admin"; // Cambia este correo al correo oficial de la compañía

    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      isSuperuser,
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ message: "Error al iniciar sesión." });
  }
});


app.get("/usuarios", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT id, nombre, correo, rol FROM usuarios");
    await connection.end();

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
});

app.delete("/usuarios/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute("DELETE FROM usuarios WHERE id = ?", [id]);
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.json({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error al eliminar usuario." });
  }
});

app.post('/peticiones', async (req, res) => {
  const { descripcion, cliente_id } = req.body;
  try {
      const connection = await mysql.createConnection(dbConfig);
      await connection.execute(
          "INSERT INTO peticiones (descripcion, cliente_id) VALUES (?, ?)",
          [descripcion, cliente_id]
      );
      await connection.end();
      res.status(201).json({ message: 'Petición creada exitosamente.' });
  } catch (error) {
      console.error("Error al crear petición:", error);
      res.status(500).json({ message: 'Error al crear petición.' });
  }
});


app.get('/peticiones', async (req, res) => {
  try {
      const connection = await mysql.createConnection(dbConfig);
      const [rows] = await connection.execute(
          "SELECT * FROM peticiones WHERE estado = 'pendiente'"
      );
      await connection.end();
      res.json(rows);
  } catch (error) {
      console.error("Error al obtener peticiones:", error);
      res.status(500).json({ message: 'Error al obtener peticiones.' });
  }
});


app.post('/peticiones/:id/aceptar', async (req, res) => {
  const { id } = req.params;
  try {
      const connection = await mysql.createConnection(dbConfig);
      await connection.execute(
          "UPDATE peticiones SET estado = 'aceptada' WHERE id = ?",
          [id]
      );
      await connection.end();
      res.json({ message: 'Petición aceptada.' });
  } catch (error) {
      console.error("Error al aceptar petición:", error);
      res.status(500).json({ message: 'Error al aceptar petición.' });
  }
});


app.get('/clientes/:id/historial', async (req, res) => {
  const { id } = req.params;

  try {
      const connection = await mysql.createConnection(dbConfig);
      const [rows] = await connection.execute(
          "SELECT * FROM historial_pedidos WHERE cliente_id = ? ORDER BY fecha DESC",
          [id]
      );
      await connection.end();

      res.json(rows);
  } catch (error) {
      console.error("Error al obtener historial:", error);
      res.status(500).json({ message: "Error al obtener historial." });
  }
});

app.post('/peticiones/:id/completar', async (req, res) => {
  const { id } = req.params;

  try {
      const connection = await mysql.createConnection(dbConfig);

      // Obtener la petición
      const [peticion] = await connection.execute("SELECT * FROM peticiones WHERE id = ?", [id]);

      if (peticion.length === 0) {
          return res.status(404).json({ message: "Petición no encontrada." });
      }

      // Mover la petición al historial
      await connection.execute(
          "INSERT INTO historial_pedidos (cliente_id, descripcion, estado, archivo_url) VALUES (?, ?, ?, ?)",
          [peticion[0].cliente_id, peticion[0].descripcion, 'completado', null]
      );

      // Eliminar la petición de la tabla de peticiones
      await connection.execute("DELETE FROM peticiones WHERE id = ?", [id]);

      await connection.end();

      res.json({ message: "Petición completada y movida al historial." });
  } catch (error) {
      console.error("Error al completar petición:", error);
      res.status(500).json({ message: "Error al completar petición." });
  }
});



// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
