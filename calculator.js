/**
 * Vehicle Environmental Impact Calculator
 * Calculation Engine & Routing Integration
 */

var VehicleImpactCalculator = class VehicleImpactCalculator {

    static getFactors() {
        return (typeof window !== 'undefined' && window.emissionFactors) 
            ? window.emissionFactors 
            : (typeof emissionFactors !== 'undefined' ? emissionFactors : {});
    }

    static getPresets() {
        return (typeof window !== 'undefined' && window.defaultVehiclePresets) 
            ? window.defaultVehiclePresets 
            : (typeof defaultVehiclePresets !== 'undefined' ? defaultVehiclePresets : {});
    }

    static calculateConsumption(distance, efficiency, fuelType) {
        const dist = parseFloat(distance) || 0;
        const eff = parseFloat(efficiency) || 1;
        if (dist <= 0 || eff <= 0) return 0;

        if (fuelType === 'electric') {
            return dist * eff;
        } else {
            return dist / eff;
        }
    }

    static calculateJourneyImpact(distance, efficiency, fuelType) {
        const factors = this.getFactors();
        const factorObj = factors[fuelType] || factors['petrol'] || { value: 2.31, name: 'Petrol (Gasoline)', unit: 'kg CO2e/litre', source: 'UK DEFRA / US EPA' };

        const consumption = this.calculateConsumption(distance, efficiency, fuelType);
        const co2eEmissions = consumption * factorObj.value;

        let unitName = 'litres';
        if (fuelType === 'cng') unitName = 'kg';
        if (fuelType === 'electric') unitName = 'kWh';

        return {
            distance: Number(parseFloat(distance || 0).toFixed(2)),
            efficiency: Number(parseFloat(efficiency || 0).toFixed(3)),
            fuelType: fuelType,
            fuelName: factorObj.name,
            consumption: Number(consumption.toFixed(2)),
            consumptionUnit: unitName,
            co2eEmissionsKg: Number(co2eEmissions.toFixed(2)),
            factorValue: factorObj.value,
            factorUnit: factorObj.unit,
            factorSource: factorObj.source
        };
    }

    static calculateVehicleComparison(distance) {
        const dist = parseFloat(distance) || 100;
        const presets = this.getPresets();

        const comparisonSpecs = [
            { id: 'petrol_car', name: 'Petrol Car', vehicle: 'car', fuel: 'petrol', efficiency: 15.0, icon: 'fa-car' },
            { id: 'diesel_car', name: 'Diesel Car', vehicle: 'car', fuel: 'diesel', efficiency: 18.0, icon: 'fa-car-side' },
            { id: 'motorcycle', name: 'Motorcycle (Petrol)', vehicle: 'motorcycle', fuel: 'petrol', efficiency: 40.0, icon: 'fa-motorcycle' },
            { id: 'electric_car', name: 'Electric Vehicle (EV)', vehicle: 'car', fuel: 'electric', efficiency: 0.16, icon: 'fa-bolt' }
        ];

        return comparisonSpecs.map(spec => {
            const impact = this.calculateJourneyImpact(dist, spec.efficiency, spec.fuel);
            let unit = 'km/l';
            try {
                unit = presets[spec.vehicle][spec.fuel].unit;
            } catch (e) {
                unit = spec.fuel === 'electric' ? 'kWh/km' : 'km/l';
            }

            return {
                id: spec.id,
                name: spec.name,
                vehicleType: spec.vehicle,
                fuelType: spec.fuel,
                icon: spec.icon,
                efficiency: spec.efficiency,
                efficiencyUnit: unit,
                consumption: impact.consumption,
                consumptionUnit: impact.consumptionUnit,
                co2eEmissionsKg: impact.co2eEmissionsKg
            };
        });
    }

    static calculateTreeEquivalent(co2eKg) {
        const kg = parseFloat(co2eKg) || 0;
        const dailyAbsorptionPerTreeKg = 21.77 / 365.25;
        const treeDaysRequired = Math.round(kg / dailyAbsorptionPerTreeKg);
        const treesForOneYear = (kg / 21.77).toFixed(1);

        return {
            treeDays: treeDaysRequired,
            yearlyTrees: treesForOneYear
        };
    }

    static async fetchRouteDistanceOSRM(originName, destinationName) {
        if (!originName || !destinationName) {
            throw new Error("Please enter both starting point and destination.");
        }

        const geocode = async (locationStr) => {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationStr)}&limit=1`;
            const response = await fetch(url, {
                headers: { 'User-Agent': 'VehicleEnvironmentalCalculator/1.0' }
            });
            if (!response.ok) throw new Error("Geocoding service unavailable.");
            const data = await response.json();
            if (!data || data.length === 0) throw new Error(`Location not found: "${locationStr}".`);
            return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), displayName: data[0].display_name };
        };

        const origin = await geocode(originName);
        const destination = await geocode(destinationName);

        const routeUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=false`;
        const routeResponse = await fetch(routeUrl);
        if (!routeResponse.ok) throw new Error("Routing service unavailable.");
        const routeData = await routeResponse.json();
        if (!routeData.routes || routeData.routes.length === 0) throw new Error("Unable to compute road distance.");

        const distanceKm = routeData.routes[0].distance / 1000;
        return {
            distanceKm: Number(distanceKm.toFixed(1)),
            originName: origin.displayName.split(',')[0],
            destinationName: destination.displayName.split(',')[0]
        };
    }
};

if (typeof window !== 'undefined') {
    window.VehicleImpactCalculator = VehicleImpactCalculator;
}
