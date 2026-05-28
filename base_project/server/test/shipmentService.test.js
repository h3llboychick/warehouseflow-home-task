import assert from "node:assert/strict"; 
import { describe, it, beforeEach } from "node:test";
import { createShipmentService } from "../src/services/shipmentService.js";
import * as shipmentEntity from "../src/entities/shipmentEntity.js";

describe("shipmentService.allocateShipment", () => {
    let shipmentRepository;
    let shipmentService;

    beforeEach(() => {
        shipmentRepository = {
            findShipmentLinesByShipmentId: async (_pool, _id) => [],
            findBinsBySkus: async (_pool, _skus) => [],
            incrementBinReservedQuantity: async (_pool, _binId, _qty) => {},
            incrementShipmentLineAllocation: async (_pool, _lineId, _qty) => {}
        };

        shipmentService = createShipmentService({ pool: null, shipmentRepository, shipmentEntity });
    });

    it("allocates from the first bin that has available stock", async () => {
        shipmentRepository.findShipmentLinesByShipmentId = async () => [
            { id: 1, sku: "SKU-100", requested_quantity: 10, allocated_quantity: 3 }
        ];
        shipmentRepository.findBinsBySkus = async () => [
            { id: 1, code: "A-01-01", sku: "SKU-100", on_hand_quantity: 10, reserved_quantity: 4 },
            { id: 2, code: "A-01-02", sku: "SKU-100", on_hand_quantity: 10, reserved_quantity: 10 }
        ];

        const result = await shipmentService.allocateShipment(1);

        assert.deepEqual(result, [{ lineId: 1, binCode: "A-01-01", allocated: 6 }]);
    });

    it("skips bins with no available stock", async () => {
        shipmentRepository.findShipmentLinesByShipmentId = async () => [
            { id: 1, sku: "SKU-100", requested_quantity: 5, allocated_quantity: 0 }
        ];
        shipmentRepository.findBinsBySkus = async () => [
            { id: 1, code: "A-01-01", sku: "SKU-100", on_hand_quantity: 10, reserved_quantity: 10 },
            { id: 2, code: "A-01-02", sku: "SKU-100", on_hand_quantity: 8, reserved_quantity: 3 }
        ];

        const result = await shipmentService.allocateShipment(1);

        assert.deepEqual(result, [{ lineId: 1, binCode: "A-01-02", allocated: 5 }]);
    });

    it("returns empty array when line is already fully allocated", async () => {
        shipmentRepository.findShipmentLinesByShipmentId = async () => [
            { id: 1, sku: "SKU-100", requested_quantity: 5, allocated_quantity: 5 }
        ];
        shipmentRepository.findBinsBySkus = async () => [
            { id: 1, code: "A-01-01", sku: "SKU-100", on_hand_quantity: 10, reserved_quantity: 0 }
        ];

        const result = await shipmentService.allocateShipment(1);

        assert.deepEqual(result, []);
    });

    it("splits allocation across multiple bins when one bin cannot fulfil the remainder", async () => {
        shipmentRepository.findShipmentLinesByShipmentId = async () => [
            { id: 1, sku: "SKU-100", requested_quantity: 10, allocated_quantity: 0 }
        ];
        shipmentRepository.findBinsBySkus = async () => [
            { id: 1, code: "A-01-01", sku: "SKU-100", on_hand_quantity: 6, reserved_quantity: 0 },
            { id: 2, code: "A-01-02", sku: "SKU-100", on_hand_quantity: 10, reserved_quantity: 4 }
        ];

        const result = await shipmentService.allocateShipment(1);

        assert.deepEqual(result, [
            { lineId: 1, binCode: "A-01-01", allocated: 6 },
            { lineId: 1, binCode: "A-01-02", allocated: 4 }
        ]);
    });
});