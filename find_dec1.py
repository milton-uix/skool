with open(r'C:/Users/milto/.gemini/antigravity/brain/c03c548f-e210-4b6e-b313-b0cb641cdf5f/.system_generated/steps/41/output.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

idx = text.find('name="Dec 1"')
if idx == -1:
    idx = text.find('Dec 1')
print('=== Dec 1 in Figma ===')
print(text[idx-200:idx+400])

