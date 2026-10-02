/**
 * Vehicle Environmental Impact Calculator
 * Emission Factors & Default Benchmarks Configuration
 * 
 * Sources:
 * - UK DEFRA (Department for Environment, Food & Rural Affairs) GHG Conversion Factors (2023)
 * - US EPA (Environmental Protection Agency) Greenhouse Gas Inventory Emission Factors
 * - IEA (International Energy Agency) Global Average Carbon Intensity of Electricity
 */

var emissionFactors = {
    petrol: {
        name: "Petrol (Gasoline)",
        value: 2.31,
        unit: "kg CO2e/litre",
        source: "UK DEFRA & US EPA Greenhouse Gas Inventory Guidelines (2023)",
++        description: "Direct greenhouse gas emissions per litre of motor petrol combusted."
    },
    diesel: {
        name: "Diesel",
        value: 2.68,
        unit: "kg CO2e/litre",
        source: "UK DEFRA & US EPA Greenhouse Gas Inventory Guidelines (2023)",
        description: "Direct greenhouse gas emissions per litre of diesel fuel combusted."
    },
    cng: {
        name: "CNG (Compressed Natural Gas)",
        value: 2.75,
        unit: "kg CO2e/kg",
        source: "DEFRA & US EPA Compressed Natural Gas Emission Factors",
        description: "Direct greenhouse gas emissions per kilogram of CNG consumed."
    },
    electricity: {
        name: "Electricity (Grid Average)",
        value: 0.42,
        unit: "kg CO2e/kWh",
        source: "IEA Global Average Carbon Intensity of Electricity Generation",
        description: "Estimated indirect emissions per kWh generated on average electricity power grid."
    }
};

var defaultVehiclePresets = {
    car: {
        petrol: { value: 15.0, unit: "km/l", label: "Fuel Efficiency" },
        diesel: { value: 18.0, unit: "km/l", label: "Fuel Efficiency" },
        cng: { value: 20.0, unit: "km/kg", label: "Fuel Efficiency" },
        electric: { value: 0.16, unit: "kWh/km", label: "Energy Efficiency" }
    },
    motorcycle: {
        petrol: { value: 40.0, unit: "km/l", label: "Fuel Efficiency" },
        electric: { value: 0.05, unit: "kWh/km", label: "Energy Efficiency" }
    },
    bus: {
        diesel: { value: 4.0, unit: "km/l", label: "Fuel Efficiency" },
        cng: { value: 3.5, unit: "km/kg", label: "Fuel Efficiency" },
        electric: { value: 1.20, unit: "kWh/km", label: "Energy Efficiency" }
    },
    truck: {
        diesel: { value: 3.2, unit: "km/l", label: "Fuel Efficiency" },
        cng: { value: 3.0, unit: "km/kg", label: "Fuel Efficiency" },
        electric: { value: 1.50, unit: "kWh/km", label: "Energy Efficiency" }
    }
};

var vehicleFuelCompatibility = {
    car: [
        { id: "petrol", label: "Petrol" },
        { id: "diesel", label: "Diesel" },
        { id: "cng", label: "CNG" },
        { id: "electric", label: "Electric" }
    ],
    motorcycle: [
        { id: "petrol", label: "Petrol" },
        { id: "electric", label: "Electric" }
    ],
    bus: [
        { id: "diesel", label: "Diesel" },
        { id: "cng", label: "CNG" },
        { id: "electric", label: "Electric" }
    ],
    truck: [
        { id: "diesel", label: "Diesel" },
        { id: "cng", label: "CNG" },
        { id: "electric", label: "Electric" }
    ]
};

if (typeof window !== 'undefined') {
    window.emissionFactors = emissionFactors;
    window.defaultVehiclePresets = defaultVehiclePresets;
    window.vehicleFuelCompatibility = vehicleFuelCompatibility;
}
