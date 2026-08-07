import numpy as np

points = [
    {"name": "62050", "x": 158.0, "y": 217.0, "lat": 50.00, "lon": -4.40},
    {"name": "62103", "x": 210.0, "y": 225.0, "lat": 49.90, "lon": -2.90},
    {"name": "62107", "x": 100.0, "y": 206.0, "lat": 50.10, "lon": -6.10},
    {"name": "6100001", "x": 630.0, "y": 566.0, "lat": 43.38, "lon": 7.83},
    {"name": "62305", "x": 311.0, "y": 201.0, "lat": 50.40, "lon": 0.00},
    {"name": "6200001", "x": 116.0, "y": 477.0, "lat": 45.23, "lon": -5.00}
]

# Quadratic model:
# lat = A*x^2 + B*y^2 + C*x*y + D*x + E*y + F
# lon = G*x^2 + H*y^2 + I*x*y + J*x + K*y + L

A_matrix = []
b_lat = []
b_lon = []

for pt in points:
    x = pt["x"]
    y = pt["y"]
    A_matrix.append([x**2, y**2, x*y, x, y, 1.0])
    b_lat.append(pt["lat"])
    b_lon.append(pt["lon"])

A_matrix = np.array(A_matrix)
b_lat = np.array(b_lat)
b_lon = np.array(b_lon)

coef_lat, _, _, _ = np.linalg.lstsq(A_matrix, b_lat, rcond=None)
coef_lon, _, _, _ = np.linalg.lstsq(A_matrix, b_lon, rcond=None)

print("Latitude coefficients (x^2, y^2, xy, x, y, 1):", list(coef_lat))
print("Longitude coefficients (x^2, y^2, xy, x, y, 1):", list(coef_lon))

print("\nPredictions and Errors (Quadratic):")
for pt in points:
    x = pt["x"]
    y = pt["y"]
    pred_lat = coef_lat[0]*x**2 + coef_lat[1]*y**2 + coef_lat[2]*x*y + coef_lat[3]*x + coef_lat[4]*y + coef_lat[5]
    pred_lon = coef_lon[0]*x**2 + coef_lon[1]*y**2 + coef_lon[2]*x*y + coef_lon[3]*x + coef_lon[4]*y + coef_lon[5]
    
    error_lat = pred_lat - pt["lat"]
    error_lon = pred_lon - pt["lon"]
    
    print(f"{pt['name']}:")
    print(f"  Lat: True={pt['lat']:.2f}, Pred={pred_lat:.2f}, Error={error_lat:.4f}")
    print(f"  Lon: True={pt['lon']:.2f}, Pred={pred_lon:.2f}, Error={error_lon:.4f}")
