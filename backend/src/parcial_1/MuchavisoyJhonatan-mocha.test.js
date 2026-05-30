const { expect } = require("chai");
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

describe("Función 3 — Controlador: getProductById", function () {
  // ----------------------------------------------------------
  // CASO 1: Producto encontrado → HTTP 200
  // ----------------------------------------------------------
  describe("Cuando el producto SÍ existe en la base de datos", function () {
    let res;
    const productoFalso = { id: "42", nombre: "Laptop Gamer", precio: 2500000 };

    // beforeEach: se ejecuta ANTES de cada prueba dentro de este describe
    beforeEach(async function () {
      const req = { params: { id: "42" } };
      const ProductModel = {
        findById: async (id) => (id === "42" ? productoFalso : null),
      };
      res = crearMockRes();
      await getProductById(req, res, ProductModel);
    });

    it("debe responder con status HTTP 200", function () {
      expect(res.statusCode).to.equal(200);
    });

    it("debe retornar success: true en el cuerpo", function () {
      expect(res.body).to.have.property("success", true);
    });

    it("debe retornar el producto dentro de data", function () {
      expect(res.body).to.have.property("data");
      expect(res.body.data).to.deep.equal(productoFalso);
    });

    it("debe retornar el nombre correcto del producto", function () {
      expect(res.body.data.nombre).to.equal("Laptop Gamer");
    });

    it("debe retornar el precio correcto del producto", function () {
      expect(res.body.data.precio).to.equal(2500000);
    });
  });

  // ----------------------------------------------------------
  // CASO 2: Producto NO encontrado → HTTP 404
  // ----------------------------------------------------------
  describe("Cuando el producto NO existe en la base de datos", function () {
    let res;

    beforeEach(async function () {
      const req = { params: { id: "999" } };
      const ProductModel = {
        findById: async () => null, // simula que no encontró nada
      };
      res = crearMockRes();
      await getProductById(req, res, ProductModel);
    });

    it("debe responder con status HTTP 404", function () {
      expect(res.statusCode).to.equal(404);
    });

    it("debe retornar success: false", function () {
      expect(res.body).to.have.property("success", false);
    });

    it('debe retornar el mensaje "Producto no encontrado"', function () {
      expect(res.body).to.have.property("message", "Producto no encontrado");
    });

    it("no debe retornar ningún dato de producto", function () {
      expect(res.body).to.not.have.property("data");
    });
  });

  // ----------------------------------------------------------
  // CASO 3: Error del servidor → HTTP 500
  // ----------------------------------------------------------
  describe("Cuando ocurre un error interno del servidor", function () {
    let res;
    const mensajeError = "Conexión rechazada por la base de datos";

    beforeEach(async function () {
      const req = { params: { id: "1" } };
      const ProductModel = {
        findById: async () => {
          throw new Error(mensajeError); // simula falla de BD
        },
      };
      res = crearMockRes();
      await getProductById(req, res, ProductModel);
    });

    it("debe responder con status HTTP 500", function () {
      expect(res.statusCode).to.equal(500);
    });

    it("debe retornar success: false", function () {
      expect(res.body).to.have.property("success", false);
    });

    it('debe retornar el mensaje "Error interno del servidor"', function () {
      expect(res.body).to.have.property(
        "message",
        "Error interno del servidor",
      );
    });

    it("debe incluir el detalle del error en la propiedad error", function () {
      expect(res.body).to.have.property("error", mensajeError);
    });
  });
});
