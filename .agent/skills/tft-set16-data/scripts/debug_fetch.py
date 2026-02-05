import json
import sys
from urllib.request import urlopen, Request

url = "https://raw.communitydragon.org/latest/cdragon/tft/en_us.json"
print(f"Fetching {url}...")
try:
    req = Request(url, headers={'User-Agent': 'Bot'})
    data = json.loads(urlopen(req).read())
    print("Top Level Keys:", list(data.keys()))
    
    if 'sets' in data:
        print("Sets Keys:", list(data['sets'].keys()))
        if '16' in data['sets']:
            print("Set 16 found in 'sets'!")
            s16 = data['sets']['16']
            print("Set 16 keys:", list(s16.keys()))
            if 'traits' in s16:
                print(f"Found {len(s16['traits'])} traits in Set 16")
                # Save just traits to check structure
                with open('set16_traits_debug.json', 'w') as f:
                    json.dump(s16['traits'][:2], f, indent=2) 
        else:
            print("Set 16 NOT found in 'sets'")
    else:
        print("No 'sets' key found")

except Exception as e:
    print(f"Error: {e}")
