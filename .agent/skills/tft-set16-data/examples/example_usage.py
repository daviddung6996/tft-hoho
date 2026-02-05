#!/usr/bin/env python3
"""
Example usage of TFT Set 16 Data Fetcher

Demonstrates how to fetch and use TFT Set 16 data in your application.
"""

import sys
import os

# Add scripts directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))

from fetch_data import TFTDataFetcher


def main():
    print("=== TFT Set 16 Data Fetcher - Example Usage ===\n")
    
    # Initialize fetcher with verbose mode
    fetcher = TFTDataFetcher(verbose=True)
    
    print("\n1. Fetching all Set 16 champions...")
    print("-" * 50)
    champions = fetcher.get_champions()
    
    if champions:
        print(f"\nFound {len(champions)} champions")
        print("\nFirst 5 champions:")
        for champ in champions[:5]:
            name = champ.get('name', 'Unknown')
            cost = champ.get('cost', '?')
            traits = champ.get('traits', [])
            print(f"  • {name} (Cost: {cost}) - Traits: {', '.join(traits)}")
    else:
        print("  ⚠ No champions found - API structure may have changed")
    
    print("\n\n2. Fetching all Set 16 traits...")
    print("-" * 50)
    traits = fetcher.get_traits()
    
    if traits:
        print(f"\nFound {len(traits)} traits")
        print("\nFirst 5 traits:")
        for trait in traits[:5]:
            name = trait.get('name', 'Unknown')
            print(f"  • {name}")
    else:
        print("  ⚠ No traits found - API structure may have changed")
    
    print("\n\n3. Fetching all Set 16 items...")
    print("-" * 50)
    items = fetcher.get_items()
    
    if items:
        print(f"\nFound {len(items)} items")
        # Items might be a mix of dicts and strings, filter to dicts only
        item_dicts = [item for item in items if isinstance(item, dict)]
        print(f"\n First 5 items (from {len(item_dicts)} usable items):")
        for item in item_dicts[:5]:
            name = item.get('name', 'Unknown')
            print(f"  • {name}")
    else:
        print("  ⚠ No items found - API structure may have changed")
    
    print("\n\n4. Fetching all Set 16 augments...")
    print("-" * 50)
    augments = fetcher.get_augments()
    
    if augments:
        print(f"\nFound {len(augments)} augments")
        # Augments might be a mix of dicts and strings, filter to dicts only
        aug_dicts = [aug for aug in augments if isinstance(aug, dict)]
        print(f"\nFirst 5 augments (from {len(aug_dicts)} usable augments):")
        for aug in aug_dicts[:5]:
            name = aug.get('name', 'Unknown')
            print(f"  • {name}")
    else:
        print("  ⚠ No augments found - API structure may have changed")
    
    print("\n\n=== Example Complete ===\n")
    
    # Example: Filter champions by cost
    if champions:
        print("\nBonus: 1-cost champions:")
        one_cost = [c for c in champions if c.get('cost') == 1]
        for champ in one_cost:
            print(f"  • {champ.get('name', 'Unknown')}")


if __name__ == '__main__':
    main()
