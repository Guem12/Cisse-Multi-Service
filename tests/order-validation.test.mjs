import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeOrderDetails } from "../lib/order-validation.js";

test("order details require an address and a supported payment method", () => {
  assert.throws(
    () => normalizeOrderDetails({ deliveryAddress: "ACI 2000" }),
    /Mode de paiement invalide/,
  );
  assert.throws(
    () => normalizeOrderDetails({ deliveryAddress: "   ", paymentMethod: "Espèces" }),
    /adresse de livraison/,
  );
});

test("order details are trimmed and reject overlong addresses", () => {
  assert.deepEqual(
    normalizeOrderDetails({ deliveryAddress: "  ACI 2000  ", paymentMethod: "Orange Money" }),
    { deliveryAddress: "ACI 2000", paymentMethod: "Orange Money" },
  );
  assert.throws(
    () => normalizeOrderDetails({ deliveryAddress: "x".repeat(121), paymentMethod: "Espèces" }),
    /120 caractères/,
  );
});
