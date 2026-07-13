# Tableau de Bord Météo Dynamique
Application web qui affiche la météo actuelle d'une ville via les API Open-Meteo
(géocodage + prévisions), réalisée dans le cadre du Devoir 2 — LOG3500 (ISTEAH, Été 2026).
## Fonctionnement
1. L'utilisateur saisit le nom d'une ville.
2. L'application géocode la ville (Open-Meteo Geocoding API).
3. Elle récupère ensuite la météo actuelle aux coordonnées trouvées (Open-Meteo Forecast API).
4. Le code météo (weathercode) est décodé en texte clair selon la norme WMO.
## Structure
- index.html — structure sémantique
- css/style.css — mise en page Flexbox/Grid + responsive
- js/app.js — logique fetch/async-await, validation, gestion d'erreurs
## Accessibilité
Validation du formulaire avec aria-invalid et aria-describedby ; aucune donnée API
injectée via innerHTML (uniquement textContent).
## Validation W3C
HTML et CSS validés sans erreur — voir rapport PDF joint sur Moodle.
## Auteur
Endrick — ISTEAH, DUT/Licence