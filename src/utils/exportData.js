
/**
 * Utilitaire pour exporter des données météo en CSV ou Excel (format XML compatible)
 */

export const exportToCSV = (data, stationName = 'meteo-export') => {
    if (!data || data.length === 0) return;

    // Définition des colonnes
    const headers = ['Date', 'Température (°C)', 'Humidité (%)', 'Point de Rosée (°C)', 'Précipitations (mm)', 'Pression (hPa)', 'Vent (km/h)', 'Rafales (km/h)', 'Direction (°)'];

    // Construction des lignes
    const rows = data.map(obs => [
        new Date(obs.time).toLocaleString('fr-FR'),
        obs.temp?.toString().replace('.', ','),
        obs.hum,
        obs.dewpoint?.toString().replace('.', ','),
        obs.rain?.toString().replace('.', ','),
        obs.pressure,
        obs.wind?.toString().replace('.', ','),
        obs.gust?.toString().replace('.', ','),
        obs.dir
    ]);

    // Assemblage du CSV (séparateur point-virgule pour Excel FR)
    const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.join(';'))
    ].join('\n');

    // Création du lien de téléchargement
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `${stationName}_${timestamp}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
