from __future__ import annotations

from collections import Counter, deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PRIMARY_SOURCE = ROOT / 'public' / 'coach-assets' / 'visian-pro.png'
FALLBACK_SOURCE = ROOT / 'public' / 'coach-assets' / 'test.png'
POSE_OUTPUT = ROOT / 'public' / 'coach-assets' / 'pose' / 'visian-clean.png'
THUMB_OUTPUT = ROOT / 'public' / 'coach-assets' / 'visian-thumb.png'

BACKGROUND_TOLERANCE = 18
POSE_TOP_PADDING = 18
POSE_SIDE_PADDING = 14
POSE_BOTTOM_PADDING = 0
THUMB_SIZE = 256


def color_distance(left: tuple[int, int, int, int], right: tuple[int, int, int, int]) -> int:
    return sum(abs(left[index] - right[index]) for index in range(3))


def extract_background_colors(image: Image.Image) -> list[tuple[int, int, int, int]]:
    width, height = image.size
    border_pixels: list[tuple[int, int, int, int]] = []

    for x in range(width):
        border_pixels.append(image.getpixel((x, 0)))
        border_pixels.append(image.getpixel((x, height - 1)))

    for y in range(height):
        border_pixels.append(image.getpixel((0, y)))
        border_pixels.append(image.getpixel((width - 1, y)))

    ranked_colors = [
        color for color, _count in Counter(border_pixels).most_common(4)
        if color[3] > 240
    ]

    if not ranked_colors:
        raise RuntimeError('Could not infer background colors from test.png border.')

    return ranked_colors[:2]


def remove_checkerboard_background(image: Image.Image) -> Image.Image:
    rgba = image.copy().convert('RGBA')
    pixels = rgba.load()
    width, height = rgba.size
    background_colors = extract_background_colors(rgba)
    queue: deque[tuple[int, int]] = deque()
    visited: set[tuple[int, int]] = set()

    def is_background(color: tuple[int, int, int, int]) -> bool:
        if color[3] < 32:
            return True
        return any(color_distance(color, background) <= BACKGROUND_TOLERANCE for background in background_colors)

    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))

    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        if (x, y) in visited:
            continue
        visited.add((x, y))

        color = pixels[x, y]
        if not is_background(color):
            continue

        pixels[x, y] = (0, 0, 0, 0)

        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx = x + dx
            ny = y + dy
            if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                queue.append((nx, ny))

    return rgba


def crop_pose(image: Image.Image) -> Image.Image:
    bbox = image.getbbox()
    if bbox is None:
        raise RuntimeError('Pose image became fully transparent after cleanup.')

    cropped = image.crop(bbox)
    pose_width = cropped.width + (POSE_SIDE_PADDING * 2)
    pose_height = cropped.height + POSE_TOP_PADDING + POSE_BOTTOM_PADDING
    canvas = Image.new('RGBA', (pose_width, pose_height), (0, 0, 0, 0))
    canvas.alpha_composite(cropped, (POSE_SIDE_PADDING, POSE_TOP_PADDING))
    return canvas


def create_thumb(image: Image.Image) -> Image.Image:
    canvas = Image.new('RGBA', (THUMB_SIZE, THUMB_SIZE), (0, 0, 0, 0))
    max_height = int(THUMB_SIZE * 0.88)
    scale = max_height / image.height
    thumb_width = max(1, round(image.width * scale))
    thumb_height = max(1, round(image.height * scale))
    resized = image.resize((thumb_width, thumb_height), Image.Resampling.LANCZOS)
    x = (THUMB_SIZE - thumb_width) // 2
    y = max(0, THUMB_SIZE - thumb_height - 12)
    canvas.alpha_composite(resized, (x, y))
    return canvas


def main() -> None:
    source = PRIMARY_SOURCE if PRIMARY_SOURCE.exists() else FALLBACK_SOURCE
    if not source.exists():
        raise FileNotFoundError(
            f'Missing source pose sample: {PRIMARY_SOURCE} or {FALLBACK_SOURCE}'
        )

    cleaned = remove_checkerboard_background(Image.open(source))
    pose = crop_pose(cleaned)
    thumb = create_thumb(pose)

    POSE_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    THUMB_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    pose.save(POSE_OUTPUT)
    thumb.save(THUMB_OUTPUT)

    print(f'Using source {source}')
    print(f'Wrote {POSE_OUTPUT}')
    print(f'Wrote {THUMB_OUTPUT}')


if __name__ == '__main__':
    main()
