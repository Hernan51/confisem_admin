const bcrypt = require("bcrypt");

(async () => {
  const contrasena = "MesifNoc+"; // Cambia esta por la contraseña deseada
  const hashedPassword = await bcrypt.hash(contrasena, 10);
  console.log("Contraseña cifrada:", hashedPassword);
})();
