/**
 * Vehicle Environmental Impact Calculator
 * Application UI Handler & Chart Visualizer
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements Cache
    const elements = {
        calculatorForm: document.getElementById('calculator-form'),
        startLocation: document.getElementById('start-location'),
        destinationLocation: document.getElementById('destination-location'),
        distanceInput: document.getElementById('distance-input'),
        distanceBadge: document.getElementById('distance-badge'),
        btnFetchRoute: document.getElementById('btn-fetch-route'),
        
        vehicleTypeSelect: document.getElementById('vehicle-type'),
        fuelTypeSelect: document.getElementById('fuel-type'),
        efficiencyInput: document.getElementById('efficiency-input'),
        efficiencyLabel: document.getElementById('efficiency-label'),
        efficiencyUnitBadge: document.getElementById('efficiency-unit-badge'),
        efficiencyHelpText: document.getElementById('efficiency-help-text'),
        
        btnCalculate: document.getElementById('btn-calculate'),
        btnReset: document.getElementById('btn-reset'),
        errorContainer: document.getElementById('error-container'),
        errorMessage: document.getElementById('error-message'),
        
        // Results Dashboard
        resultsSection: document.getElementById('results-dashboard'),
        resultJourney: document.getElementById('res-journey'),
        resultDistance: document.getElementById('res-distance'),
        resultVehicleFuel: document.getElementById('res-vehicle-fuel'),
        resultConsumption: document.getElementById('res-consumption'),
        resultConsumptionUnit: document.getElementById('res-consumption-unit'),
        resultCo2e: document.getElementById('res-co2e'),
        resultTreeDays: document.getElementById('res-tree-days'),
        resultFactorSource: document.getElementById('res-factor-source'),
        
        // Comparison Cards & Container
        comparisonContainer: document.getElementById('comparison-cards-container'),
        
        // Canvas Elements for Chart.js
        mainChartCanvas: document.getElementById('main-impact-chart'),
        comparisonChartCanvas: document.getElementById('comparison-chart')
    };

    // Chart.js Instances
    let mainChartInstance = null;
    let comparisonChartInstance = null;

    let currentDistanceSource = 'preset';

    /**
     * INITIALIZATION
     */
    function init() {
        // Pre-fill initial sample journey so calculator works immediately
        if (elements.startLocation && !elements.startLocation.value) {
            elements.startLocation.value = "London";
        }
        if (elements.destinationLocation && !elements.destinationLocation.value) {
            elements.destinationLocation.value = "Oxford";
        }
        if (elements.distanceInput && !elements.distanceInput.value) {
            elements.distanceInput.value = 92;
        }

        populateFuelOptions();
        updateEfficiencyPreset();
        setupEventListeners();

        // Perform initial calculation on load so dashboard is visible immediately!
        setTimeout(() => {
            handleCalculate();
        }, 100);
    }

    /**
     * Update Fuel Select options based on Vehicle Type compatibility
     */
    function populateFuelOptions() {
        if (!elements.vehicleTypeSelect || !elements.fuelTypeSelect) return;
        const selectedVehicle = elements.vehicleTypeSelect.value || 'car';
        
        const compatibilityMap = (typeof window !== 'undefined' && window.vehicleFuelCompatibility)
            ? window.vehicleFuelCompatibility 
            : (typeof vehicleFuelCompatibility !== 'undefined' ? vehicleFuelCompatibility : {});

        const validFuels = compatibilityMap[selectedVehicle] || compatibilityMap['car'] || [
            { id: "petrol", label: "Petrol" },
            { id: "diesel", label: "Diesel" },
            { id: "cng", label: "CNG" },
            { id: "electric", label: "Electric" }
        ];
        
        elements.fuelTypeSelect.innerHTML = '';
        validFuels.forEach(fuel => {
            const option = document.createElement('option');
            option.value = fuel.id;
            option.textContent = fuel.label;
            elements.fuelTypeSelect.appendChild(option);
        });
    }

    /**
     * Update labels, units, and prefilled average mileage preset when vehicle or fuel changes
     */
    function updateEfficiencyPreset() {
        if (!elements.vehicleTypeSelect || !elements.fuelTypeSelect) return;
        const vehicle = elements.vehicleTypeSelect.value || 'car';
        const fuel = elements.fuelTypeSelect.value || 'petrol';

        const presetsMap = (typeof window !== 'undefined' && window.defaultVehiclePresets)
            ? window.defaultVehiclePresets 
            : (typeof defaultVehiclePresets !== 'undefined' ? defaultVehiclePresets : {});

        const preset = (presetsMap[vehicle] && presetsMap[vehicle][fuel])
            ? presetsMap[vehicle][fuel]
            : { value: 15.0, unit: "km/l", label: "Fuel Efficiency" };

        if (elements.efficiencyLabel) elements.efficiencyLabel.textContent = preset.label;
        if (elements.efficiencyUnitBadge) elements.efficiencyUnitBadge.textContent = preset.unit;
        if (elements.efficiencyInput && (!elements.efficiencyInput.value || parseFloat(elements.efficiencyInput.value) <= 0)) {
            elements.efficiencyInput.value = preset.value;
        }

        if (elements.efficiencyHelpText) {
            if (fuel === 'electric') {
                elements.efficiencyHelpText.textContent = "Energy consumed per kilometer (typical EV car: ~0.16 kWh/km)";
            } else if (fuel === 'cng') {
                elements.efficiencyHelpText.textContent = "Kilometers traveled per kg of CNG fuel (typical car: ~20 km/kg)";
            } else {
                elements.efficiencyHelpText.textContent = `Kilometers traveled per litre of ${fuel} (typical average: ~${preset.value} km/l)`;
            }
        }
    }

    /**
     * Setup UI Event Listeners
     */
    function setupEventListeners() {
        // Form submit (handles Enter key or Submit button)
        if (elements.calculatorForm) {
            elements.calculatorForm.addEventListener('submit', handleCalculate);
        }

        // Vehicle type change
        if (elements.vehicleTypeSelect) {
            elements.vehicleTypeSelect.addEventListener('change', () => {
                populateFuelOptions();
                updateEfficiencyPreset();
            });
        }

        // Fuel type change
        if (elements.fuelTypeSelect) {
            elements.fuelTypeSelect.addEventListener('change', () => {
                updateEfficiencyPreset();
            });
        }

        // Distance input manual editing
        if (elements.distanceInput) {
            elements.distanceInput.addEventListener('input', () => {
                currentDistanceSource = 'user';
                if (elements.distanceBadge) {
                    elements.distanceBadge.textContent = 'User-provided distance';
                    elements.distanceBadge.className = 'badge badge-outline-secondary';
                }
            });
        }

        // Preset journey buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const origin = e.currentTarget.getAttribute('data-from');
                const dest = e.currentTarget.getAttribute('data-to');
                const dist = e.currentTarget.getAttribute('data-distance');

                if (elements.startLocation) elements.startLocation.value = origin;
                if (elements.destinationLocation) elements.destinationLocation.value = dest;
                if (elements.distanceInput) elements.distanceInput.value = dist;
                
                currentDistanceSource = 'preset';
                if (elements.distanceBadge) {
                    elements.distanceBadge.textContent = 'Preset Route Distance';
                    elements.distanceBadge.className = 'badge badge-outline-info';
                }
                hideError();
                handleCalculate();
            });
        });

        // Fetch Route Distance via OSRM API button
        if (elements.btnFetchRoute) {
            elements.btnFetchRoute.addEventListener('click', handleFetchRouteDistance);
        }

        // Calculate Button
        if (elements.btnCalculate) {
            elements.btnCalculate.addEventListener('click', handleCalculate);
        }

        // Reset Button
        if (elements.btnReset) {
            elements.btnReset.addEventListener('click', handleReset);
        }
    }

    /**
     * Handle Async Route Distance Fetching
     */
    async function handleFetchRouteDistance() {
        const origin = elements.startLocation ? elements.startLocation.value.trim() : '';
        const destination = elements.destinationLocation ? elements.destinationLocation.value.trim() : '';

        if (!origin || !destination) {
            showError("Please enter both Starting Point and Destination to calculate route distance.");
            return;
        }

        hideError();
        const originalBtnHtml = elements.btnFetchRoute.innerHTML;
        elements.btnFetchRoute.disabled = true;
        elements.btnFetchRoute.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Finding Route...`;

        try {
            const CalcClass = (typeof window !== 'undefined' && window.VehicleImpactCalculator) ? window.VehicleImpactCalculator : VehicleImpactCalculator;
            const routeResult = await CalcClass.fetchRouteDistanceOSRM(origin, destination);
            if (elements.distanceInput) elements.distanceInput.value = routeResult.distanceKm;
            currentDistanceSource = 'api';
            if (elements.distanceBadge) {
                elements.distanceBadge.textContent = 'API Route Distance (OSRM)';
                elements.distanceBadge.className = 'badge badge-outline-success';
            }
            handleCalculate();
        } catch (err) {
            showError(`Route calculation info: ${err.message}`);
        } finally {
            elements.btnFetchRoute.disabled = false;
            elements.btnFetchRoute.innerHTML = originalBtnHtml;
        }
    }

    /**
     * Ensure sensible fallbacks for empty fields so calculation NEVER fails
     */
    function ensureFallbackInputs() {
        if (elements.startLocation && !elements.startLocation.value.trim()) {
            elements.startLocation.value = "Point A";
        }
        if (elements.destinationLocation && !elements.destinationLocation.value.trim()) {
            elements.destinationLocation.value = "Point B";
        }
        if (elements.distanceInput && (!elements.distanceInput.value || parseFloat(elements.distanceInput.value) <= 0)) {
            elements.distanceInput.value = 100;
        }
        if (elements.vehicleTypeSelect && !elements.vehicleTypeSelect.value) {
            elements.vehicleTypeSelect.value = "car";
            populateFuelOptions();
        }
        if (elements.fuelTypeSelect && !elements.fuelTypeSelect.value) {
            elements.fuelTypeSelect.value = "petrol";
        }
        if (elements.efficiencyInput && (!elements.efficiencyInput.value || parseFloat(elements.efficiencyInput.value) <= 0)) {
            const fuel = elements.fuelTypeSelect.value || 'petrol';
            elements.efficiencyInput.value = fuel === 'electric' ? 0.16 : 15.0;
        }
    }

    /**
     * Handle Calculation & UI Dashboard Updates
     */
    function handleCalculate(e) {
        if (e) e.preventDefault();

        // Ensure default fallbacks if user clicks calculate on empty inputs
        ensureFallbackInputs();
        hideError();

        const distance = parseFloat(elements.distanceInput.value) || 100;
        const vehicle = elements.vehicleTypeSelect.value || 'car';
        const fuel = elements.fuelTypeSelect.value || 'petrol';
        const efficiency = parseFloat(elements.efficiencyInput.value) || 15.0;
        const origin = elements.startLocation.value.trim() || "Point A";
        const destination = elements.destinationLocation.value.trim() || "Point B";

        const CalcClass = (typeof window !== 'undefined' && window.VehicleImpactCalculator) ? window.VehicleImpactCalculator : VehicleImpactCalculator;

        // Perform calculation
        const result = CalcClass.calculateJourneyImpact(distance, efficiency, fuel);
        const treeMetric = CalcClass.calculateTreeEquivalent(result.co2eEmissionsKg);
        const comparisonList = CalcClass.calculateVehicleComparison(distance);

        // Update Dashboard Text Elements
        if (elements.resultJourney) elements.resultJourney.textContent = `${origin} → ${destination}`;
        if (elements.resultDistance) elements.resultDistance.textContent = `${result.distance} km`;
        
        const vehicleNameFormatted = vehicle.charAt(0).toUpperCase() + vehicle.slice(1);
        if (elements.resultVehicleFuel) elements.resultVehicleFuel.textContent = `${result.fuelName} (${vehicleNameFormatted})`;
        
        if (elements.resultConsumption) elements.resultConsumption.textContent = result.consumption;
        if (elements.resultConsumptionUnit) elements.resultConsumptionUnit.textContent = result.consumptionUnit;
        if (elements.resultCo2e) elements.resultCo2e.textContent = `${result.co2eEmissionsKg} kg CO₂e`;
        if (elements.resultTreeDays) elements.resultTreeDays.textContent = `${treeMetric.treeDays} tree-days`;
        
        if (elements.resultFactorSource) {
            elements.resultFactorSource.textContent = `${result.factorSource} (${result.factorValue} ${result.factorUnit})`;
        }

        // Render Comparison Cards
        renderComparisonCards(comparisonList);

        // Make Results Section Visible & Smooth Scroll BEFORE Charts
        if (elements.resultsSection) {
            elements.resultsSection.style.display = 'block';
            if (e) {
                elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        // Safe Chart Rendering
        try {
            renderMainImpactChart(result);
            renderComparisonChart(comparisonList);
        } catch (chartErr) {
            console.warn("Chart rendering skipped or limited:", chartErr);
        }
    }

    /**
     * Render Vehicle Comparison Cards
     */
    function renderComparisonCards(comparisonList) {
        if (!elements.comparisonContainer) return;
        elements.comparisonContainer.innerHTML = '';

        comparisonList.forEach(item => {
            const card = document.createElement('div');
            card.className = 'comparison-card';
            
            card.innerHTML = `
                <div class="comparison-card-header">
                    <div class="icon-bubble">
                        <i class="fas ${item.icon}"></i>
                    </div>
                    <h4>${item.name}</h4>
                </div>
                <div class="comparison-card-body">
                    <div class="metric-row">
                        <span class="label">Efficiency:</span>
                        <span class="value">${item.efficiency} ${item.efficiencyUnit}</span>
                    </div>
                    <div class="metric-row">
                        <span class="label">Energy/Fuel Used:</span>
                        <span class="value">${item.consumption} ${item.consumptionUnit}</span>
                    </div>
                    <div class="metric-row main-metric">
                        <span class="label">CO₂e Emissions:</span>
                        <span class="emissions-tag">${item.co2eEmissionsKg} kg</span>
                    </div>
                </div>
            `;
            elements.comparisonContainer.appendChild(card);
        });
    }

    /**
     * Render Main Journey Impact Chart (Chart.js)
     */
    function renderMainImpactChart(result) {
        if (!elements.mainChartCanvas || typeof Chart === 'undefined') return;

        if (mainChartInstance) {
            mainChartInstance.destroy();
        }

        const ctx = elements.mainChartCanvas.getContext('2d');
        mainChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [`Fuel/Energy Consumed (${result.consumptionUnit})`, 'Estimated CO₂e Emissions (kg)'],
                datasets: [{
                    label: 'Journey Breakdown',
                    data: [result.consumption, result.co2eEmissionsKg],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.75)',
                        'rgba(16, 185, 129, 0.85)'
                    ],
                    borderColor: [
                        'rgba(37, 99, 235, 1)',
                        'rgba(5, 150, 105, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.raw} ${context.dataIndex === 0 ? result.consumptionUnit : 'kg CO₂e'}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(226, 232, 240, 0.6)' },
                        ticks: { font: { family: 'Plus Jakarta Sans, sans-serif' } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: 'Plus Jakarta Sans, sans-serif', weight: '600' } }
                    }
                }
            }
        });
    }

    /**
     * Render Vehicle Comparison Chart (Chart.js)
     */
    function renderComparisonChart(comparisonList) {
        if (!elements.comparisonChartCanvas || typeof Chart === 'undefined') return;

        if (comparisonChartInstance) {
            comparisonChartInstance.destroy();
        }

        const labels = comparisonList.map(c => c.name);
        const dataValues = comparisonList.map(c => c.co2eEmissionsKg);

        const ctx = elements.comparisonChartCanvas.getContext('2d');
        comparisonChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Estimated CO₂e Emissions (kg)',
                    data: dataValues,
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.75)',
                        'rgba(245, 158, 11, 0.75)',
                        'rgba(59, 130, 246, 0.75)',
                        'rgba(16, 185, 129, 0.85)'
                    ],
                    borderColor: [
                        'rgba(220, 38, 38, 1)',
                        'rgba(217, 119, 6, 1)',
                        'rgba(37, 99, 235, 1)',
                        'rgba(5, 150, 105, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.raw} kg CO₂e`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: { display: true, text: 'CO₂e Emissions (kg CO₂e)' },
                        grid: { color: 'rgba(226, 232, 240, 0.6)' }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { font: { family: 'Plus Jakarta Sans, sans-serif', weight: '600' } }
                    }
                }
            }
        });
    }

    /**
     * UI Error Message Display Helpers
     */
    function showError(msg) {
        if (!elements.errorMessage || !elements.errorContainer) return;
        elements.errorMessage.textContent = msg;
        elements.errorContainer.style.display = 'flex';
        elements.errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function hideError() {
        if (!elements.errorContainer) return;
        elements.errorContainer.style.display = 'none';
        if (elements.errorMessage) elements.errorMessage.textContent = '';
    }

    /**
     * Handle Reset Calculator
     */
    function handleReset() {
        if (elements.calculatorForm) elements.calculatorForm.reset();
        
        if (elements.startLocation) elements.startLocation.value = '';
        if (elements.destinationLocation) elements.destinationLocation.value = '';
        if (elements.distanceInput) elements.distanceInput.value = '';
        
        currentDistanceSource = 'user';
        if (elements.distanceBadge) {
            elements.distanceBadge.textContent = 'User-provided distance';
            elements.distanceBadge.className = 'badge badge-outline-secondary';
        }
        
        if (elements.vehicleTypeSelect) elements.vehicleTypeSelect.value = 'car';
        populateFuelOptions();
        if (elements.fuelTypeSelect) elements.fuelTypeSelect.value = 'petrol';
        updateEfficiencyPreset();

        hideError();
        if (elements.resultsSection) elements.resultsSection.style.display = 'none';

        if (mainChartInstance) {
            mainChartInstance.destroy();
            mainChartInstance = null;
        }

        if (comparisonChartInstance) {
            comparisonChartInstance.destroy();
            comparisonChartInstance = null;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Run Initialization
    init();
});
