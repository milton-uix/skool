with open(r'C:/Users/milto/.gemini/antigravity/brain/c03c548f-e210-4b6e-b313-b0cb641cdf5f/.system_generated/steps/41/output.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

idx = text.find('id="102:1862"')
print('=== Header vector 102:1862 ===')
print(text[idx-100:idx+300])

