"""Bake the face decals worn by the hall's figures.

Each figure's head is a plain skin-toned ellipsoid. What makes it read as a
particular person is a photograph of that person's face, cropped and masked,
projected onto the front of the skull. The photograph is the same licensed
portrait credited in CREDITS.md — nothing here is generated or invented.

Crop boxes came from an OpenCV Haar cascade over the portraits and were then
checked by eye; the cascade locked onto Tesla's hand rather than his face, so
his box is set by hand. Boxes are fractions of the source image (x0,y0,x1,y1).

    python tools/bake_faces.py

Writes public/portraits/face/<id>.webp.
"""
from PIL import Image, ImageFilter
import numpy as np
import os

ROOT = os.path.join(os.path.dirname(__file__), '..', 'public', 'portraits')
OUT = os.path.join(ROOT, 'face')
SIZE = 384

BOXES = {
    'albert-einstein':   (0.4523, 0.1502, 0.7491, 0.3735),
    'charlie-chaplin':   (0.3177, 0.2170, 0.8104, 0.6104),
    'cristiano-ronaldo': (0.1048, 0.0103, 0.8087, 0.4626),
    'leonardo-da-vinci': (0.2418, 0.0693, 1.0000, 0.5743),
    'lionel-messi':      (0.2107, 0.0600, 0.8664, 0.5107),
    'marilyn-monroe':    (0.3078, 0.0565, 0.6494, 0.5292),
    'michael-jackson':   (0.3138, 0.2359, 0.9383, 0.7883),
    'muhammad-ali':      (0.0921, 0.2008, 0.8683, 0.8334),
    'nikola-tesla':      (0.4300, 0.1900, 0.8500, 0.5120),
    'steve-jobs':        (0.0894, 0.1039, 0.6803, 0.7324),
}

# The figures' skin tones, mirrored from FIGURES in src/world/humanoid.ts. A
# face has to sit on a neck of the same colour or the join gives it away.
SKIN = {
    'michael-jackson': '#b98a63', 'cristiano-ronaldo': '#c08b62',
    'albert-einstein': '#cfa07e', 'leonardo-da-vinci': '#cb9d79',
    'steve-jobs': '#c99b79', 'marilyn-monroe': '#e0b294',
    'muhammad-ali': '#7a5237', 'lionel-messi': '#cfa079',
    'nikola-tesla': '#cfa989', 'charlie-chaplin': '#d2ae91',
}


def oval_alpha(s):
    """Feathered oval. A hard rectangle edge is what makes a projected face
    look like a sticker; fading it out over the cheekbones does not."""
    yy, xx = np.mgrid[0:s, 0:s]
    nx = (xx - s / 2) / (s * 0.40)
    ny = (yy - s * 0.505) / (s * 0.46)
    d = np.sqrt(nx * nx + ny * ny)
    a = np.clip((1.0 - d) / 0.30, 0, 1)
    a = a * a * (3 - 2 * a)
    blur = ImageFilter.GaussianBlur(s / 85.0)
    return np.array(Image.fromarray((a * 255).astype(np.uint8)).filter(blur))


def main():
    os.makedirs(OUT, exist_ok=True)
    alpha = oval_alpha(SIZE)
    for key, (x0, y0, x1, y1) in BOXES.items():
        src = Image.open(os.path.join(ROOT, key + '.jpg'))
        w, h = src.size
        mono = src.mode == 'L'
        box = (int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h))
        im = src.convert('RGB').crop(box).resize((SIZE, SIZE), Image.LANCZOS)
        a = np.asarray(im, dtype=np.float64)
        skin = np.array([int(SKIN[key][i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float64)
        if mono:
            # A monochrome plate left grey reads as a mask bolted to a coloured
            # body, so remap luminance through the figure's own skin tone.
            t = (a @ np.array([0.299, 0.587, 0.114]) / 255.0)[..., None]
            shadow = skin * 0.22
            a = shadow + (skin * 1.18 - shadow) * t
        else:
            # Partial cast correction only. Push all the way to the target and
            # the person stops looking like themselves.
            a = a + (skin - a.reshape(-1, 3).mean(0)) * 0.42
        a = np.clip((a - 128.0) * 1.08 + 134.0, 0, 255).astype(np.uint8)
        rgba = Image.fromarray(np.dstack([a, alpha]).astype(np.uint8), 'RGBA')
        path = os.path.join(OUT, key + '.webp')
        rgba.save(path, 'WEBP', quality=90, method=6)
        print('%-20s %-12s %6.1f kB' % (key, 'mono' if mono else 'colour',
                                        os.path.getsize(path) / 1024))


if __name__ == '__main__':
    main()
