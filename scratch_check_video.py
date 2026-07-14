with open('generate_video_bulletin.py', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'VIGILANCE PAYSAGE' in line or 'VIGILANCE PORTRAIT' in line:
        # Print 5 lines before and after
        start = max(0, idx - 10)
        end = min(len(lines), idx + 10)
        print(f"=== Match at line {idx+1} ===")
        for i in range(start, end):
            print(f"{i+1}: {lines[i].strip()}")
