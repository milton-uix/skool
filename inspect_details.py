with open(r'C:/Users/milto/.gemini/antigravity/brain/c03c548f-e210-4b6e-b313-b0cb641cdf5f/.system_generated/steps/41/output.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

def show_frame(fid, length=1200):
    idx = text.find(f'id="{fid}"')
    if idx != -1:
        print(f'=== {fid} ===')
        print(text[idx:idx+length])
    else:
        print(f'=== {fid} NOT FOUND ===')

show_frame('94:1826', 1000)
show_frame('74:1347', 1000) # Conflict Callout Box
show_frame('90:596', 1000) # Frame 83 Mark as complete
show_frame('49:3173', 800) # Frame 19 in calendar
show_frame('49:3775', 600) # Polygon 1 in list view

