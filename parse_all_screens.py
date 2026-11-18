with open(r'C:/Users/milto/.gemini/antigravity/brain/c03c548f-e210-4b6e-b313-b0cb641cdf5f/.system_generated/steps/41/output.txt', 'r', encoding='utf-8', errors='ignore') as f:
    for line in f:
        line_s = line.strip()
        if line_s.startswith('<frame') and any(name in line_s for name in ['Login', 'Calendar', 'List', 'Detail', 'More']):
            print(line_s[:120])

