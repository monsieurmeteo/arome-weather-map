import numpy as np

# Control points (x, y) on Meteociel map and their (lat, lon) coordinates
points = [
    {"name": "62050", "x": 158.0, "y": 217.0, "lat": 50.00, "lon": -4.40},
    {"name": "62103", "x": 210.0, "y": 225.0, "lat": 49.90, "lon": -2.90},
    {"name": "62107", "x": 100.0, "y": 206.0, "lat": 50.10, "lon": -6.10},
    {"name": "6100001", "x": 630.0, "y": 566.0, "lat": 43.38, "lon": 7.83},
    {"name": "62305", "x": 311.0, "y": 201.0, "lat": 50.40, "lon": 0.00},
    {"name": "6200001", "x": 116.0, "y": 477.0, "lat": 45.23, "lon": -5.00}
]

# We want to fit:
# lat = A * x + B * y + C
# lon = D * x + E * y + F
# Let's use numpy least squares.

A_matrix = []
b_lat = []
b_lon = []

for pt in points:
    A_matrix.append([pt["x"], pt["y"], 1.0])
    b_lat.append(pt["lat"])
    b_lon.append(pt["lon"])

A_matrix = np.array(A_matrix)
b_lat = np.array(b_lat)
b_lon = np.array(b_lon)

# Fit latitude
coef_lat, residuals_lat, rank_lat, s_lat = np.linalg.lstsq(A_matrix, b_lat, rcond=None)
# Fit longitude
coef_lon, residuals_lon, rank_lon, s_lon = np.linalg.lstsq(A_matrix, b_lon, rcond=None)

print("Latitude coefficients (A, B, C):", coef_lat)
print("Longitude coefficients (D, E, F):", coef_lon)

# Check errors
print("\nPredictions and Errors:")
for pt in points:
    pred_lat = coef_lat[0] * pt["x"] + coef_lat[1] * pt["y"] + coef_lat[2]
    pred_lon = coef_lon[0] * pt["x"] + coef_lon[1] * pt["y"] + coef_lon[2]
    
    error_lat = pred_lat - pt["lat"]
    error_lon = pred_lon - pt["lon"]
    
    print(f"{pt['name']}:")
    print(f"  Lat: True={pt['lat']:.2f}, Pred={pred_lat:.2f}, Error={error_lat:.4f}")
    print(f"  Lon: True={pt['lon']:.2f}, Pred={pred_lon:.2f}, Error={error_lon:.4f}")
