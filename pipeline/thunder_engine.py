#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
thunder_engine.py — Moteur Scientifique de Diagnostic d'Orages & Foudre AROME
=============================================================================
Calcule la probabilité d'orage (0-100%) et la densité d'éclairs (éclairs/km²/h)
d'après la formulation convective LPI & Flash Rate Parameterization :
  - CAPE   : Énergie convective disponible (J/kg)
  - Refl   : Réflectivité radar simulée (dBZ)
  - Rain1h : Précipitations horaires (mm)
  - Graupel: Précipitations de graupel/grêle (mm)
"""

import numpy as np

def compute_thunder_metrics(cape, refl, rain_1h=0.0, graupel=0.0):
    """
    Calcule (prob_orage %, foudre_densite éclairs/km²/h) pour un point ou tableau numpy.
    """
    cape = np.maximum(0.0, np.asarray(cape, dtype=np.float32))
    refl = np.maximum(0.0, np.asarray(refl, dtype=np.float32))
    rain_1h = np.maximum(0.0, np.asarray(rain_1h, dtype=np.float32))
    graupel = np.maximum(0.0, np.asarray(graupel, dtype=np.float32))

    # Condition convective minimale
    has_convection = (refl >= 35.0) & (cape >= 150.0)

    # 1. Probabilité d'Orage (0 à 100 %)
    cape_term = np.power(np.clip(cape / 700.0, 0.0, 4.0), 0.6)
    refl_term = np.power(np.clip(refl / 38.0, 0.0, 2.0), 1.4)
    rain_term = 1.0 + np.clip(rain_1h / 4.0, 0.0, 3.0)

    raw_prob = cape_term * refl_term * rain_term * 75.0
    prob_orage = np.where(has_convection, np.clip(np.round(raw_prob), 0.0, 100.0), 0.0)

    # 2. Densité d'Impacts de Foudre (éclairs/km²/h)
    cape_foudre = np.clip(cape / 800.0, 0.0, 4.0)
    refl_foudre = np.power(np.maximum(0.0, refl - 36.0) / 14.0, 1.8)
    ice_foudre = 1.0 + np.clip(graupel, 0.0, 3.0)

    raw_foudre = cape_foudre * refl_foudre * ice_foudre * 2.2
    foudre_densite = np.where(has_convection & (refl >= 38.0), np.round(np.clip(raw_foudre, 0.0, 50.0), 1), 0.0)

    return prob_orage, foudre_densite
