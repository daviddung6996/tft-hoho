# Coach Pose Asset Spec

Paste hero PNG files into:

- `public/coach-assets/pose/visian-clean.png`
- `public/coach-assets/pose/dit-sap-clean.png`
- `public/coach-assets/pose/1by1-clean.png`
- `public/coach-assets/pose/buffalow-clean.png`
- `public/coach-assets/pose/tftiseasy-clean.png`

Recommended hero canvas:

- Size: `960 x 1280 px`
- Ratio: `3:4`
- Format: transparent `PNG`
- Subject alignment: centered horizontally
- Bottom contact: lowest visible pixel should sit within `0-4 px` of canvas bottom
- Top padding: keep head clearance around `12-24 px`
- Side padding: keep shoulders inside canvas with about `12-24 px` breathing room

Current UI tuning:

- Hero max render width: `420 px`
- Default scale: `1.04`
- Default vertical offset: `-8 px`
- Bottom overlap with UI floor: `2 px`

What works best:

- Torso or half-body esports pose
- Transparent background only
- No checkerboard baked into pixels
- No card frame or rounded rectangle around the subject
- Body should already be tightly cropped before export

Current carousel thumbnails are separate from hero pose PNGs. Do not replace the existing thumbnail files unless you also want to redesign the bottom coach carousel.
