#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
thunder_engine.py — Moteur de Diagnostic Orageux Calibré Météo-France
===================================================================
Prend en compte l'instabilité convective potentielle (CAPE >= 80 J/kg)
et la réflectivité / précipitations pour capter les averses orageuses
et orages isolés conformément à la méthode Météo-France.
"""

import numpy as np

def compute_thunder_metrics(cape, refl, rain_1h=0.0, graupel=0.0):
    """
    Calcule (prob_orage %, foudre_densite écl/km²/h) avec la sensibilité officielle Météo-France.
    """
    cape = np.maximum(0.0, np.asarray(cape, dtype=np.float32))
    refl = np.maximum(0.0, np.asarray(refl, dtype=np.float32))
    rain_1h = np.maximum(0.0, np.asarray(rain_1h, dtype=np.float32))
    graupel = np.maximum(0.0, np.asarray(graupel, dtype=np.float32))

    # Condition de potentiel orageux Météo-France :
    # De l'énergie disponible (CAPE >= 80) OU écho radar convectif (refl >= 25)
    has_potential = (cape >= 80.0) | (refl >= 25.0) | (graupel > 0.0)

    # 1. Probabilité d'Orage continue (0 à 100 %)
    cape_term = np.clip(cape / 500.0, 0.0, 3.0) * 35.0
    refl_term = np.clip((refl - 20.0) / 25.0, 0.0, 2.0) * 45.0
    rain_term = np.clip(rain_1h / 3.0, 0.0, 2.0) * 15.0
    ice_term  = np.clip(graupel * 20.0, 0.0, 25.0)

    raw_prob = cape_term + refl_term + rain_term + ice_term
    prob_orage = np.where(has_potential, np.clip(np.round(raw_prob), 0.0, 100.0), 0.0)

    # Forcer au moins 20% si CAPE >= 150 (Risque orageux potentiel Météo-France)
    prob_orage = np.where((cape >= 150.0) & (prob_orage < 20.0), 20.0, prob_orage)

    # 2. Densité d'Impacts de Foudre (éclairs/km²/h)
    has_lightning = (cape >= 200.0) & (refl >= 30.0)
    raw_foudre = (cape / 800.0) * np.power(np.maximum(0.0, refl - 28.0) / 16.0, 1.6) * (1.0 + np.clip(graupel, 0.0, 3.0)) * 2.0
    foudre_densite = np.where(has_lightning, np.round(np.clip(raw_foudre, 0.0, 50.0), 1), 0.0)

    return prob_orage, foudre_densite
