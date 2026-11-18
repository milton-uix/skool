with open(r'C:/Users/milto/.gemini/antigravity/brain/c03c548f-e210-4b6e-b313-b0cb641cdf5f/.system_generated/steps/41/output.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'id=\"49:3469\"', text)]
if matches:
    idx = matches[0]
    titles = re.findall(r'name=\"([^\"]+)\"', text[idx:idx+40000])
    for t in titles:
        if any(w in t.lower() for w in ['day', 'trip', 'festival', 'exam', 'book', 'lights', 'sports', 'closed', 'tell']):
            print(t)

