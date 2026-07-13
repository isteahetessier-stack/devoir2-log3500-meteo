// ============================================================
// Sélection des éléments du DOM
// ============================================================
const form = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const errorMessage = document.getElementById('error-message');
const loadingIndicator = document.getElementById('loading-indicator');
const weatherCard = document.getElementById('weather-card');
const apiError = document.getElementById('api-error');
const apiErrorText = document.getElementById('api-error-text');
const suggestionsContainer = document.getElementById('suggestions-container');
const suggestionsList = document.getElementById('suggestions-list');

// ============================================================
// Map des codes météo (WMO)
// ============================================================
const weatherCodeMap = {
    0: 'Ciel dégagé',
    1: 'Principalement dégagé',
    2: 'Partiellement nuageux',
    3: 'Nuageux',
    45: 'Brouillard',
    48: 'Brouillard givrant',
    51: 'Bruine légère',
    53: 'Bruine modérée',
    55: 'Bruine dense',
    56: 'Bruine verglaçante légère',
    57: 'Bruine verglaçante dense',
    61: 'Pluie légère',
    63: 'Pluie modérée',
    65: 'Pluie forte',
    66: 'Pluie verglaçante légère',
    67: 'Pluie verglaçante forte',
    71: 'Neige légère',
    73: 'Neige modérée',
    75: 'Neige forte',
    77: 'Grains de neige',
    80: 'Averses de pluie légères',
    81: 'Averses de pluie modérées',
    82: 'Averses de pluie fortes',
    85: 'Averses de neige légères',
    86: 'Averses de neige fortes',
    95: 'Orage',
    96: 'Orage avec grêle légère',
    99: 'Orage avec grêle forte'
};

// ============================================================
// Fonctions utilitaires (UI)
// ============================================================

function decodeWeatherCode(code) {
    return weatherCodeMap[code] || 'Inconnu';
}

function showLoading(isLoading) {
    if (isLoading) {
        loadingIndicator.classList.remove('hidden');
        weatherCard.classList.add('hidden');
        apiError.classList.add('hidden');
        suggestionsContainer.classList.add('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
    }
}

function showApiError(message) {
    apiErrorText.textContent = message;
    apiError.classList.remove('hidden');
    weatherCard.classList.add('hidden');
    loadingIndicator.classList.add('hidden');
    suggestionsContainer.classList.add('hidden');
}

// Gestion des erreurs de formulaire (a11y)
function setErrorState(message) {
    cityInput.setAttribute('aria-invalid', 'true');
    errorMessage.textContent = message;
}

function resetErrorState() {
    cityInput.removeAttribute('aria-invalid');
    errorMessage.textContent = '';
}

// Détection de la saisie pour réinitialiser l'erreur
cityInput.addEventListener('input', function () {
    if (this.value.trim() !== '') {
        resetErrorState();
    }
});

// ============================================================
// Affichage des suggestions
// ============================================================
function displaySuggestions(results, searchTerm) {
    // Vider la liste
    suggestionsList.innerHTML = '';

    // Afficher le conteneur
    suggestionsContainer.classList.remove('hidden');
    weatherCard.classList.add('hidden');
    apiError.classList.add('hidden');
    loadingIndicator.classList.add('hidden');

    results.forEach(result => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.setAttribute('tabindex', '0');

        // Drapeau (si country_code disponible)
        if (result.country_code && result.country_code.length === 2) {
            const flagImg = document.createElement('img');
            flagImg.className = 'suggestion-flag';
            flagImg.src = `https://flagsapi.com/${result.country_code.toUpperCase()}/flat/32.png`;
            flagImg.alt = `Drapeau de ${result.country || ''}`;
            flagImg.loading = 'lazy';
            flagImg.onerror = function () { this.style.display = 'none'; };
            li.appendChild(flagImg);
        }

        // Nom de la ville
        const nameSpan = document.createElement('span');
        nameSpan.className = 'suggestion-name';
        nameSpan.textContent = result.name;
        li.appendChild(nameSpan);

        // Pays
        const countrySpan = document.createElement('span');
        countrySpan.className = 'suggestion-country';
        countrySpan.textContent = result.country || 'Pays inconnu';
        li.appendChild(countrySpan);

        // Ajouter un petit indicateur (coordonnées) pour debug éventuel
        // Mais pas nécessaire

        // Événement de clic pour sélectionner cette ville
        li.addEventListener('click', function () {
            // On relance la recherche avec les coordonnées de ce résultat
            fetchWeatherForCoordinates(result.latitude, result.longitude, result.name, result.country, result.country_code);
        });

        // Accessibilité : gestion du clavier (Entrée)
        li.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                li.click();
            }
        });

        suggestionsList.appendChild(li);
    });
}

// ============================================================
// Fonction pour récupérer la météo à partir de coordonnées
// (appelée lorsqu'on clique sur une suggestion)
// ============================================================
async function fetchWeatherForCoordinates(lat, lon, cityName, country, countryCode) {
    try {
        showLoading(true);
        weatherCard.classList.add('hidden');
        apiError.classList.add('hidden');
        suggestionsContainer.classList.add('hidden');

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error(`Erreur HTTP ${weatherResponse.status}`);
        }

        const weatherData = await weatherResponse.json();

        if (!weatherData.current_weather) {
            throw new Error('Données météo non disponibles pour cette localisation.');
        }

        const current = weatherData.current_weather;

        const weatherInfo = {
            city: cityName,
            country: country,
            country_code: countryCode,
            temperature: current.temperature,
            windspeed: current.windspeed,
            weathercode: current.weathercode,
            population: 'Non disponible'
        };

        displayWeatherData(weatherInfo);
        showLoading(false);
        weatherCard.classList.remove('hidden');

    } catch (error) {
        console.error('Erreur météo :', error);
        showApiError('Impossible de récupérer la météo pour cette ville.');
        showLoading(false);
        weatherCard.classList.add('hidden');
    }
}

// ============================================================
// Affichage des données météo (inchangé)
// ============================================================
function displayWeatherData(data) {
    weatherCard.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'weather-header';

    const cityName = document.createElement('span');
    cityName.className = 'city-name';
    cityName.textContent = data.city || 'Ville inconnue';
    header.appendChild(cityName);

    if (data.country_code && data.country_code.length === 2) {
        const flagImg = document.createElement('img');
        flagImg.className = 'flag';
        flagImg.src = `https://flagsapi.com/${data.country_code.toUpperCase()}/flat/64.png`;
        flagImg.alt = `Drapeau de ${data.country || ''}`;
        flagImg.loading = 'lazy';
        flagImg.onerror = function () { this.style.display = 'none'; };
        header.insertBefore(flagImg, cityName);
    }

    weatherCard.appendChild(header);

    const countryName = document.createElement('p');
    countryName.className = 'country-name';
    countryName.textContent = data.country ? `📍 ${data.country}` : '🌍 Pays non spécifié';
    weatherCard.appendChild(countryName);

    const grid = document.createElement('div');
    grid.className = 'weather-grid';

    const createWeatherItem = (iconHtml, label, value) => {
        const item = document.createElement('div');
        item.className = 'weather-item';
        const labelSpan = document.createElement('span');
        labelSpan.className = 'label';
        labelSpan.innerHTML = iconHtml + ' ' + label;
        const valueSpan = document.createElement('span');
        valueSpan.className = 'value';
        valueSpan.textContent = value !== undefined && value !== null ? value : 'N/A';
        item.appendChild(labelSpan);
        item.appendChild(valueSpan);
        return item;
    };

    grid.appendChild(createWeatherItem('<i class="fas fa-thermometer-half"></i>', 'Température', data.temperature !== undefined ? `${data.temperature}°C` : 'N/A'));
    grid.appendChild(createWeatherItem('<i class="fas fa-wind"></i>', 'Vent', data.windspeed !== undefined ? `${data.windspeed} km/h` : 'N/A'));
    grid.appendChild(createWeatherItem('<i class="fas fa-cloud-sun"></i>', 'Conditions', data.weathercode !== undefined ? decodeWeatherCode(data.weathercode) : 'Inconnu'));
    grid.appendChild(createWeatherItem('<i class="fas fa-users"></i>', 'Population', data.population || 'Non disponible'));

    weatherCard.appendChild(grid);
}

// ============================================================
// Gestionnaire principal de la recherche (async/await)
// ============================================================
async function handleSearch(event) {
    event.preventDefault();

    const cityName = cityInput.value.trim();
    resetErrorState();

    if (cityName === '') {
        setErrorState('Veuillez saisir un nom de ville.');
        return;
    }

    try {
        showLoading(true);
        weatherCard.classList.add('hidden');
        apiError.classList.add('hidden');
        suggestionsContainer.classList.add('hidden');

        // --- Géocodage avec plusieurs résultats ---
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=5&language=fr`;
        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            throw new Error(`Erreur HTTP ${geoResponse.status}`);
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('Aucun résultat trouvé pour cette recherche. Veuillez vérifier l\'orthographe.');
        }

        // Si un seul résultat, on l'utilise directement
        if (geoData.results.length === 1) {
            const result = geoData.results[0];
            // Appel direct à la météo
            await fetchWeatherForCoordinates(result.latitude, result.longitude, result.name, result.country, result.country_code);
        } else {
            // Plusieurs résultats : afficher les suggestions
            displaySuggestions(geoData.results, cityName);
            showLoading(false);
        }

    } catch (error) {
        console.error('Erreur lors de la recherche :', error);
        let userMessage = 'Connexion impossible. Veuillez vérifier votre accès à internet.';
        if (error.message.includes('Aucun résultat')) {
            userMessage = 'Aucun résultat trouvé pour cette recherche. Veuillez vérifier l\'orthographe.';
        } else if (error.message.includes('Erreur HTTP')) {
            userMessage = 'Une erreur est survenue lors de la communication avec le serveur.';
        }
        showApiError(userMessage);
        showLoading(false);
        weatherCard.classList.add('hidden');
    }
}

// ============================================================
// Branchement de l'événement submit
// ============================================================
form.addEventListener('submit', handleSearch);