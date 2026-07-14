# -*- coding: utf-8 -*-
"""
update_daily_obs.py
───────────────────
Phase 1 : Alimentation de la base SQLite depuis Météociel national.

Utilise scrape_national_archive() de meteo_core.py qui scrape en parallèle
les 4 classements Météociel (tmax, tmin, precip, gust) avec records mensuels
et absolus pour toutes les stations de France.

USAGE :
  python update_daily_obs.py                   → hier (J-1)
  python update_daily_obs.py --date 20260711   → date spécifique
  python update_daily_obs.py --force           → rescrape même si données existantes
"""

import sys
import os
import argparse
import sqlite3
from datetime import date, timedelta

# Ajout du chemin des scripts meteo
METEO_SCRIPTS = r"C:\Users\grego\.gemini\config\skills\meteo\scripts"
sys.path.insert(0, METEO_SCRIPTS)

from meteo_core import scrape_national_archive, get_conn

def count_obs(date_str):
    """Compte les observations avec records pour une date donnée."""
    conn = get_conn()
    c = conn.cursor()
    c.execute(
        "SELECT COUNT(*), COUNT(tmax_rec_m), COUNT(tmax_rec_a) FROM observations WHERE date = ?",
        (date_str,)
    )
    row = c.fetchone()
    conn.close()
    return row  # (total, avec_rec_m, avec_rec_a)

def main():
    parser = argparse.ArgumentParser(description="Alimentation Météociel → SQLite (Phase 1)")
    parser.add_argument("--date",  default=None, help="Date YYYYMMDD (défaut: hier)")
    parser.add_argument("--force", action="store_true", help="Rescrape même si données existantes")
    args = parser.parse_args()

    if args.date:
        date_str = args.date.replace("-", "")
    else:
        date_str = (date.today() - timedelta(days=1)).strftime("%Y%m%d")

    print("═" * 60)
    print(f"  PHASE 1 — Collecte Météociel pour le {date_str[:4]}-{date_str[4:6]}-{date_str[6:]}")
    print("═" * 60)

    # Vérification si données déjà présentes
    total, rec_m, rec_a = count_obs(date_str)
    print(f"\n  DB actuelle : {total} stations · {rec_m} avec rec_mensuel · {rec_a} avec rec_absolu")

    if total > 0 and rec_m > 0 and not args.force:
        print(f"\n  ✅ Données déjà présentes avec records. Utilisez --force pour rescraper.")
        print(f"     → Prêt pour la Phase 2 (generate_meteociel_obs_maps.py)")
        return

    if total > 0 and not args.force:
        print(f"\n  ⚠️  Données présentes SANS records (scraping partiel précédent).")
        print(f"     Lancement du scraping complet avec records...")
    elif args.force:
        print(f"\n  🔄 --force : rescraping forcé.")
    else:
        print(f"\n  📡 Aucune donnée. Lancement du scraping...")

    print()

    # Scraping national (4 paramètres en parallèle via meteo_core)
    obs_map = scrape_national_archive(date_str)

    # Rapport final
    print()
    total2, rec_m2, rec_a2 = count_obs(date_str)
    print("═" * 60)
    print(f"  RÉSULTAT")
    print(f"  Stations enregistrées : {total2}")
    print(f"  Avec record mensuel   : {rec_m2}")
    print(f"  Avec record absolu    : {rec_a2}")
    print()

    # Affiche les records détectés
    conn = get_conn()
    c = conn.cursor()
    c.execute("""
        SELECT o.station_code, s.name, s.dept,
               o.tmax, o.tmax_rec_m, o.tmax_rec_m_date, o.tmax_rec_a, o.tmax_rec_a_date,
               o.tmin, o.tmin_rec_m, o.tmin_rec_m_date, o.tmin_rec_a, o.tmin_rec_a_date,
               o.precip, o.precip_rec_m, o.precip_rec_m_date,
               o.gust, o.gust_rec_m, o.gust_rec_m_date
        FROM observations o
        LEFT JOIN stations s ON o.station_code = s.code
        WHERE o.date = ?
        AND (
            (o.tmax IS NOT NULL AND o.tmax_rec_m IS NOT NULL AND o.tmax >= o.tmax_rec_m)
            OR (o.tmax IS NOT NULL AND o.tmax_rec_a IS NOT NULL AND o.tmax >= o.tmax_rec_a)
            OR (o.tmin IS NOT NULL AND o.tmin_rec_m IS NOT NULL AND o.tmin <= o.tmin_rec_m)
            OR (o.tmin IS NOT NULL AND o.tmin_rec_a IS NOT NULL AND o.tmin <= o.tmin_rec_a)
            OR (o.precip IS NOT NULL AND o.precip_rec_m IS NOT NULL AND o.precip >= o.precip_rec_m)
            OR (o.gust IS NOT NULL AND o.gust_rec_m IS NOT NULL AND o.gust >= o.gust_rec_m)
        )
        ORDER BY s.dept
    """, (date_str,))
    records_detected = c.fetchall()
    conn.close()

    if records_detected:
        print(f"  🏆 RECORDS DÉTECTÉS : {len(records_detected)} stations")
        print()
        for r in records_detected:
            code, name, dept = r[0], r[1] or r[0], r[2] or "??"
            tmax, tmax_rec_m, tmax_rec_m_date, tmax_rec_a, tmax_rec_a_date = r[3], r[4], r[5], r[6], r[7]
            tmin, tmin_rec_m, tmin_rec_m_date, tmin_rec_a, tmin_rec_a_date = r[8], r[9], r[10], r[11], r[12]
            precip, precip_rec_m, precip_rec_m_date = r[13], r[14], r[15]
            gust, gust_rec_m, gust_rec_m_date = r[16], r[17], r[18]

            flags = []
            if tmax and tmax_rec_a and tmax >= tmax_rec_a:
                flags.append(f"Tmax={tmax}° > R.ABS={tmax_rec_a}° ({tmax_rec_a_date})")
            elif tmax and tmax_rec_m and tmax >= tmax_rec_m:
                flags.append(f"Tmax={tmax}° > R.MENS={tmax_rec_m}° ({tmax_rec_m_date})")
            if tmin and tmin_rec_a and tmin <= tmin_rec_a:
                flags.append(f"Tmin={tmin}° < R.ABS={tmin_rec_a}° ({tmin_rec_a_date})")
            elif tmin and tmin_rec_m and tmin <= tmin_rec_m:
                flags.append(f"Tmin={tmin}° < R.MENS={tmin_rec_m}° ({tmin_rec_m_date})")
            if precip and precip_rec_m and precip >= precip_rec_m:
                flags.append(f"Précip={precip}mm > R.MENS={precip_rec_m}mm ({precip_rec_m_date})")
            if gust and gust_rec_m and gust >= gust_rec_m:
                flags.append(f"Rafales={gust}km/h > R.MENS={gust_rec_m}km/h ({gust_rec_m_date})")

            for f in flags:
                print(f"  [{dept}] {name:<30} {f}")
    else:
        print("  ℹ️  Aucun record détecté pour cette date.")

    print()
    print(f"  → Prêt pour la Phase 2 : python generate_meteociel_obs_maps.py --date {date_str}")
    print("═" * 60)

if __name__ == "__main__":
    main()
