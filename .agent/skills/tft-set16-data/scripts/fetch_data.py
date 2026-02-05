#!/usr/bin/env python3
"""
TFT Set 16 Data Fetcher

Fetches champion, trait, item, and augment data for TFT Set 16 from Community Dragon API.
"""

import argparse
import json
import sys
from typing import Dict, List, Optional
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError


# API Endpoints
COMMUNITY_DRAGON_URL = "https://raw.communitydragon.org/latest/cdragon/tft/en_us.json"

# Set 16 identifier - update this if the naming convention differs
SET_16_PREFIX = "TFT16_"


class TFTDataFetcher:
    """Fetches and filters TFT Set 16 data from Community Dragon API."""
    
    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.raw_data: Optional[Dict] = None
    
    def log(self, message: str):
        """Print message if verbose mode is enabled."""
        if self.verbose:
            print(f"[INFO] {message}", file=sys.stderr)
    
    def fetch_raw_data(self) -> Dict:
        """Fetch raw TFT data from Community Dragon API."""
        self.log(f"Fetching data from {COMMUNITY_DRAGON_URL}...")
        
        try:
            req = Request(COMMUNITY_DRAGON_URL, headers={'User-Agent': 'TFT-Set16-Data-Fetcher/1.0'})
            with urlopen(req, timeout=30) as response:
                data = json.loads(response.read().decode('utf-8'))
                self.log(f"Successfully fetched {len(str(data))} bytes of data")
                self.raw_data = data
                return data
        except HTTPError as e:
            raise RuntimeError(f"HTTP Error {e.code}: {e.reason}")
        except URLError as e:
            raise RuntimeError(f"URL Error: {e.reason}")
        except Exception as e:
            raise RuntimeError(f"Failed to fetch data: {str(e)}")
    
    def filter_set16_items(self, items: List[Dict]) -> List[Dict]:
        """Filter items list to only include Set 16 entries."""
        if not items:
            return []

        set16_items = [
            item for item in items
            if item.get('apiName', '').startswith(SET_16_PREFIX)
        ]

        self.log(f"Filtered {len(set16_items)} Set 16 items from {len(items)} total items")
        return set16_items

    def filter_equipment_items(self, items: List[Dict]) -> List[Dict]:
        """
        Filter items to only include actual equipment items.
        Excludes: ChampionItem (star level data), Augments, Consumables, etc.
        Includes: Component items, Combined items, Ornn items, Radiant items, Trait emblems.
        """
        if not items:
            return []

        # Blacklist patterns - these are NOT equipment items
        blacklist_patterns = [
            'ChampionItem',    # Champion star level data (not equipment)
            'Augment',         # Augments (separate category)
            'Encounter',       # Encounter rewards
            'Consumable',      # Consumable items
            'Admin',           # Admin/debug items
            'HyperRoll',       # Hyper Roll specific
            'TFT_Assist_',     # Assist items
            'MapSurface',      # Map items
            'Debug',           # Debug items
            'Tutorial',        # Tutorial items
            '_Tooltip',        # Tooltip items
            '_UI_',            # UI elements
        ]

        # Whitelist patterns - these ARE equipment items
        whitelist_patterns = [
            'TFT_Item_',           # Standard component and combined items
            'TFT4_Item_Ornn',      # Ornn/Artifact items
            'TFT5_Item_Radiant',   # Radiant items
            'TFT9_Item_',          # Support items
            'TFT10_Item_',         # Set 10 items that may carry over
            'TFT16_Item_',         # Set 16 specific items
        ]

        filtered = []
        for item in items:
            api_name = item.get('apiName', '')
            name = item.get('name', '')

            # Skip if matches any blacklist pattern
            if any(pattern in api_name for pattern in blacklist_patterns):
                continue
            if any(pattern in name for pattern in blacklist_patterns):
                continue

            # Include if matches any whitelist pattern
            if any(api_name.startswith(pattern) for pattern in whitelist_patterns):
                filtered.append(item)
                continue

            # Also include Set 16 trait emblems (usually TFT16_Item_*)
            if api_name.startswith('TFT16_') and 'Item' in api_name:
                filtered.append(item)

        self.log(f"Filtered {len(filtered)} equipment items from {len(items)} total items")
        return filtered
    
    def get_set16_data(self) -> Dict:
        """Extract Set 16 specific data from raw API response."""
        if not self.raw_data:
            self.fetch_raw_data()
        
        # 1. Get Champions and Traits from sets['16']
        set16_data = self.raw_data.get('sets', {}).get('16', {})
        
        if not set16_data:
            self.log("WARNING: Set 16 data not found in 'sets' dictionary.")
            # Verify if maybe the key changed (e.g. 'Set16', 'TFTSet16')
            sets_keys = self.raw_data.get('sets', {}).keys()
            self.log(f"Available sets: {list(sets_keys)}")
            return {'champions': [], 'traits': [], 'items': [], 'augments': []}

        # Filter champions to ONLY include Set 16 (exclude training dummies, neutral units, and mixed set data)
        raw_champions = set16_data.get('champions', [])
        champions = [
            c for c in raw_champions 
            if c.get('apiName', '').startswith(SET_16_PREFIX)
        ]

        # Filter traits ensuring strictly Set 16
        raw_traits = set16_data.get('traits', [])
        traits = [
            t for t in raw_traits 
            if t.get('apiName', '').startswith(SET_16_PREFIX)
        ]
        
        self.log(f"Found {len(champions)} champions and {len(traits)} traits in Set 16 data (filtered from {len(raw_champions)}/{len(raw_traits)})")

        # 2. Get Items and Augments from global 'items' list
        all_items = self.raw_data.get('items', [])

        # Extract augments (Set 16 only)
        set16_augments = [
            item for item in all_items
            if item.get('apiName', '').startswith(SET_16_PREFIX)
            and ('Augment' in item.get('apiName', '') or 'augment' in item.get('apiName', '').lower())
        ]

        # Extract equipment items (component, combined, ornn, radiant, emblems)
        # Use both Set 16 specific and standard items that are valid equipment
        equipment_items = self.filter_equipment_items(all_items)

        # Also include standard items (not set-specific) that are equipment
        standard_items = [
            item for item in equipment_items
            if item.get('apiName', '').startswith('TFT_Item_')
            or item.get('apiName', '').startswith('TFT4_Item_Ornn')
            or item.get('apiName', '').startswith('TFT5_Item_Radiant')
        ]

        # Set 16 specific items
        set16_specific_items = [
            item for item in equipment_items
            if item.get('apiName', '').startswith(SET_16_PREFIX)
        ]

        # Combine: standard items + set 16 specific items (deduplicated)
        seen_ids = set()
        items = []
        for item in standard_items + set16_specific_items:
            api_name = item.get('apiName', '')
            if api_name not in seen_ids:
                seen_ids.add(api_name)
                items.append(item)

        augments = set16_augments

        return {
            'champions': champions,
            'traits': traits,
            'items': items,
            'augments': augments
        }

    
    def get_champions(self) -> List[Dict]:
        """Get all Set 16 champions with their stats."""
        data = self.get_set16_data()
        champions = data.get('champions', [])
        self.log(f"Retrieved {len(champions)} champions")
        return champions
    
    def get_traits(self) -> List[Dict]:
        """Get all Set 16 traits."""
        data = self.get_set16_data()
        traits = data.get('traits', [])
        self.log(f"Retrieved {len(traits)} traits")
        return traits
    
    def get_items(self) -> List[Dict]:
        """Get all Set 16 items."""
        data = self.get_set16_data()
        items = data.get('items', [])
        self.log(f"Retrieved {len(items)} items")
        return items
    
    def get_augments(self) -> List[Dict]:
        """Get all Set 16 augments."""
        data = self.get_set16_data()
        augments = data.get('augments', [])
        self.log(f"Retrieved {len(augments)} augments")
        return augments


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(description='Fetch TFT Set 16 data from Community Dragon API')
    parser.add_argument('--output', '-o', help='Output JSON file path')
    parser.add_argument('--champions', action='store_true', help='Fetch only champions')
    parser.add_argument('--traits', action='store_true', help='Fetch only traits')
    parser.add_argument('--items', action='store_true', help='Fetch only items')
    parser.add_argument('--augments', action='store_true', help='Fetch only augments')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose logging')
    parser.add_argument('--test-connection', action='store_true', help='Test API connection')
    parser.add_argument('--validate-set16', action='store_true', help='Validate data is Set 16 only')
    
    args = parser.parse_args()
    
    try:
        fetcher = TFTDataFetcher(verbose=args.verbose)
        
        if args.test_connection:
            fetcher.fetch_raw_data()
            print("✓ API connection successful")
            return 0
        
        # Determine what data to fetch
        fetch_all = not any([args.champions, args.traits, args.items, args.augments])
        
        result = {}
        
        if fetch_all or args.champions:
            result['champions'] = fetcher.get_champions()
        
        if fetch_all or args.traits:
            result['traits'] = fetcher.get_traits()
        
        if fetch_all or args.items:
            result['items'] = fetcher.get_items()
        
        if fetch_all or args.augments:
            result['augments'] = fetcher.get_augments()
        
        # Validation
        if args.validate_set16:
            # Check that all items have Set 16 prefix
            all_items = []
            for category in result.values():
                if isinstance(category, list):
                    all_items.extend(category)
            
            non_set16 = [
                item.get('apiName', 'unknown') 
                for item in all_items 
                if not item.get('apiName', '').startswith(SET_16_PREFIX)
            ]
            
            if non_set16:
                print(f"✗ Found {len(non_set16)} non-Set 16 items:", file=sys.stderr)
                for name in non_set16[:5]:  # Show first 5
                    print(f"  - {name}", file=sys.stderr)
                return 1
            else:
                print("✓ All items validated as Set 16")
                return 0
        
        # Output results
        output_json = json.dumps(result, indent=2, ensure_ascii=False)
        
        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(output_json)
            print(f"✓ Data written to {args.output}")
        else:
            print(output_json)
        
        return 0
        
    except Exception as e:
        print(f"✗ Error: {str(e)}", file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
