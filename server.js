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

app.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params; // El ID del usuario a actualizar
  const { nombre, correo, rol } = req.body; // Los nuevos datos enviados en el cuerpo de la solicitud

  if (!nombre || !correo || !rol) {
    return res.status(400).json({ message: "Todos los campos son requeridos." });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      "UPDATE usuarios SET nombre = ?, correo = ?, rol = ? WHERE id = ?",
      [nombre, correo, rol, id]
    );
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.json({ message: "Usuario actualizado correctamente." });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error al actualizar usuario." });
  }
});


app.post('/peticiones', async (req, res) => {
  const { descripcion, cliente_id } = req.body;
  
  if (!descripcion || !cliente_id) {
    return res.status(400).json({ message: "Descripción y cliente_id son obligatorios." });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      "INSERT INTO peticiones (descripcion, cliente_id, estado) VALUES (?, ?, 'pendiente')",
      [descripcion, cliente_id]
    );
    await connection.end();
    res.status(201).json({ message: 'Petición creada exitosamente.' });
  } catch (error) {
    console.error("Error al crear petición:", error);
    res.status(500).json({ message: 'Error al crear petición.' });
  }
});


app.post('/peticiones/:id/aceptar', async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Cambiar estado de la petición
    await connection.execute(
      "UPDATE peticiones SET estado = 'trabajando' WHERE id = ?",
      [id]
    );

    await connection.end();
    res.status(200).json({ message: 'Petición aceptada y movida a tareas pendientes.' });
  } catch (error) {
    console.error("Error al aceptar petición:", error);
    res.status(500).json({ message: 'Error al aceptar petición.' });
  }
});




app.get('/tareas', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [tareas] = await connection.execute(
      `SELECT * FROM tareas WHERE estado = 'pendiente'` // CORRECTO
    );
    await connection.end();
    res.json(tareas);
  } catch (error) {
    console.error('Error al obtener tareas pendientes:', error);
    res.status(500).json({ message: 'Error al obtener las tareas' });
  }
});



app.post("/tareas/:id/completar", async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute("UPDATE tareas SET estado = 'completada' WHERE id = ?", [id]);
    await connection.end();

    res.status(200).json({ message: "Tarea completada" });
  } catch (error) {
    console.error("Error al completar tarea:", error);
    res.status(500).json({ message: "Error al completar tarea" });
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

app.post('/peticiones/:id/aceptar', async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Cambiar estado de la petición a "trabajando"
    await connection.execute("UPDATE peticiones SET estado = 'trabajando' WHERE id = ?", [id]);

    await connection.end();
    res.status(200).json({ message: 'Petición aceptada y movida a trabajando.' });
  } catch (error) {
    console.error("Error al aceptar petición:", error);
    res.status(500).json({ message: 'Error al aceptar petición.' });
  }
});

app.post('/peticiones/:id/completar', async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Cambiar estado de la petición a "completado"
    await connection.execute("UPDATE peticiones SET estado = 'completado' WHERE id = ?", [id]);

    await connection.end();
    res.status(200).json({ message: 'Petición marcada como completada.' });
  } catch (error) {
    console.error("Error al completar petición:", error);
    res.status(500).json({ message: 'Error al completar petición.' });
  }
});


app.get('/peticiones/pendientes', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT * FROM peticiones WHERE estado = 'pendiente'");
    await connection.end();

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener peticiones pendientes:", error);
    res.status(500).json({ message: 'Error al obtener peticiones pendientes.' });
  }
});

app.get('/peticiones/trabajando', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT * FROM peticiones WHERE estado = 'trabajando'");
    await connection.end();

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener peticiones en progreso:", error);
    res.status(500).json({ message: 'Error al obtener peticiones en progreso.' });
  }
});


app.post("/chat", async (req, res) => {
  const { cliente_id, peticion_id, mensaje, archivo_url, emisor } = req.body;

  if (!cliente_id || !peticion_id || !mensaje || !emisor) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      "INSERT INTO mensajes (cliente_id, peticion_id, mensaje, archivo_url, emisor) VALUES (?, ?, ?, ?, ?)",
      [cliente_id, peticion_id, mensaje, archivo_url || null, emisor]
    );

    await connection.end();

    res.status(201).json({ message: "Mensaje enviado correctamente." });
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    res.status(500).json({ message: "Error al enviar mensaje." });
  }
});

app.get("/chat/:cliente_id/:peticion_id", async (req, res) => {
  const { cliente_id, peticion_id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      "SELECT * FROM mensajes WHERE cliente_id = ? AND peticion_id = ? ORDER BY fecha_envio",
      [cliente_id, peticion_id]
    );

    await connection.end();

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    res.status(500).json({ message: "Error al obtener mensajes." });
  }
});

app.get("/peticiones/:cliente_id", async (req, res) => {
  const { cliente_id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      "SELECT * FROM peticiones WHERE cliente_id = ? ORDER BY fecha_creacion DESC",
      [cliente_id]
    );

    await connection.end();

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener peticiones:", error);
    res.status(500).json({ message: "Error al obtener peticiones." });
  }
});

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
