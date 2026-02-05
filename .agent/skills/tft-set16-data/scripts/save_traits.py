import json
from urllib.request import urlopen, Request

url = "https://raw.communitydragon.org/latest/cdragon/tft/en_us.json"
print(f"Fetching {url}...")
try:
    req = Request(url, headers={'User-Agent': 'Bot'})
    data = json.loads(urlopen(req).read())
    
    if 'sets' in data and '16' in data['sets']:
        traits = data['sets']['16']['traits']
        
        # Filter for Set 16 traits if needed, but '16' key implies they are Set 16.
        # However, check apiName just in case
        set16_traits = [t for t in traits if t.get('apiName', '').startswith('TFT16_')]
        
        print(f"Saving {len(set16_traits)} traits...")
        
        output_path = r'd:\TFT-hoho\src\data\set16_traits.json'
        with open(output_path, 'w') as f:
            json.dump(set16_traits, f, indent=2)
            
        print(f"Saved to {output_path}")
    else:
        print("Set 16 traits not found")

except Exception as e:
    print(f"Error: {e}")
