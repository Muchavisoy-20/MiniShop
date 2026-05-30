const { getProductById } = require("../controllers/product.controller");

function crearMockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

function verificar(descripcion, condicion) {
  if (condicion) {
    console.log(`   PASÓ: ${descripcion}`);
  } else {
    console.error(`   FALLÓ: ${descripcion}`);
    process.exitCode = 1;
  }
}

async function caso1_ProductoEncontrado() {
  console.log("\n CASO 1: Producto encontrado → debe retornar 200");

  const productoFalso = { id: "42", nombre: "Laptop Gamer", precio: 2500000 };

  const req = { params: { id: "42" } };

  const ProductModel = {
    findById: async (id) => (id === "42" ? productoFalso : null),
  };

  const res = crearMockRes();
  await getProductById(req, res, ProductModel);

  verificar("El status debe ser 200", res.statusCode === 200);
  verificar("success debe ser true", res.body.success === true);
  verificar("data debe contener el producto", res.body.data === productoFalso);
  verificar(
    'data.nombre debe ser "Laptop Gamer"',
    res.body.data.nombre === "Laptop Gamer",
  );
}

async function caso2_ProductoNoEncontrado() {
  console.log("\n🔍 CASO 2: Producto no encontrado → debe retornar 404");

  const req = { params: { id: "999" } };

  const ProductModel = {
    findById: async () => null,
  };

  const res = crearMockRes();
  await getProductById(req, res, ProductModel);

  verificar("El status debe ser 404", res.statusCode === 404);
  verificar("success debe ser false", res.body.success === false);
  verificar(
    'message debe decir "Producto no encontrado"',
    res.body.message === "Producto no encontrado",
  );
}

async function caso3_ErrorDelServidor() {
  console.log("\n CASO 3: Error del servidor → debe retornar 500");

  const req = { params: { id: "1" } };

  const ProductModel = {
    findById: async () => {
      throw new Error("Conexión rechazada por la base de datos");
    },
  };

  const res = crearMockRes();
  await getProductById(req, res, ProductModel);

  verificar("El status debe ser 500", res.statusCode === 500);
  verificar("success debe ser false", res.body.success === false);
  verificar(
    'message debe decir "Error interno del servidor"',
    res.body.message === "Error interno del servidor",
  );
  verificar(
    "error debe contener el mensaje de la excepción",
    res.body.error === "Conexión rechazada por la base de datos",
  );
}

async function ejecutarPruebas() {
  console.log("=".repeat(55));
  console.log(" PRUEBAS MANUALES — Función 3: Get Product by ID");
  console.log("=".repeat(55));

  await caso1_ProductoEncontrado();
  await caso2_ProductoNoEncontrado();
  await caso3_ErrorDelServidor();

  console.log("\n" + "=".repeat(55));
  console.log(
    process.exitCode === 1
      ? "   Algunas pruebas FALLARON"
      : "  Todas las pruebas PASARON",
  );
  console.log("=".repeat(55) + "\n");
}

ejecutarPruebas();
