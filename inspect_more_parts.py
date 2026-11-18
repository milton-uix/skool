with open(r'C:/Users/milto/.gemini/antigravity/brain/c03c548f-e210-4b6e-b313-b0cb641cdf5f/.system_generated/steps/41/output.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

idx = text.find('id="102:1862"')
print('=== 102:1862 (Right icon in Frame 102 header) ===')
print(text[idx-200:idx+400])

idx2 = text.find('id="49:3364"')
print('=== 49:3364 (Frame 19 in list/cal) ===')
print(text[idx2:idx2+800])

