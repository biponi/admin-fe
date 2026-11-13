#!/usr/bin/env python3
"""
Brand Assets Generator
Generates full suite of production-ready favicons, PWA icons, Apple Touch icons,
and in-app brand logos from the source Bumblebee icon set.
"""

import os
import io
import base64
import zipfile
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICON_SET_DIR = os.path.join(BASE_DIR, 'src', 'assets', 'icon-set')
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')
BRAND_ASSETS_DIR = os.path.join(BASE_DIR, 'src', 'assets', 'brand')
SRC_ASSETS_DIR = os.path.join(BASE_DIR, 'src', 'assets')

def main():
    print("🚀 Generating Brand & PWA Assets from Bumblebee icon set...")

    fav_zip_path = os.path.join(ICON_SET_DIR, 'icons8-bumblebee-glassmorphism-favicons.zip')
    base_zip_path = os.path.join(ICON_SET_DIR, 'icons8-bumblebee-glassmorphism.zip')

    z_fav = zipfile.ZipFile(fav_zip_path)
    z_main = zipfile.ZipFile(base_zip_path)

    # 1. Unpack source images
    src_fav_dir = os.path.join(ICON_SET_DIR, 'source', 'favicons')
    src_base_dir = os.path.join(ICON_SET_DIR, 'source', 'base')
    os.makedirs(src_fav_dir, exist_ok=True)
    os.makedirs(src_base_dir, exist_ok=True)

    z_fav.extractall(src_fav_dir)
    z_main.extractall(src_base_dir)

    # Load high quality source images
    fav_16 = Image.open(os.path.join(src_fav_dir, 'web', 'icons8-bumblebee-glassmorphism-16.png')).convert('RGBA')
    fav_32 = Image.open(os.path.join(src_fav_dir, 'web', 'icons8-bumblebee-glassmorphism-32.png')).convert('RGBA')
    fav_57 = Image.open(os.path.join(src_fav_dir, 'web', 'icons8-bumblebee-glassmorphism-57.png')).convert('RGBA')
    fav_60 = Image.open(os.path.join(src_fav_dir, 'web', 'icons8-bumblebee-glassmorphism-60.png')).convert('RGBA')
    fav_70 = Image.open(os.path.join(src_fav_dir, 'web', 'icons8-bumblebee-glassmorphism-70.png')).convert('RGBA')
    fav_72 = Image.open(os.path.join(src_fav_dir, 'web', 'icons8-bumblebee-glassmorphism-72.png')).convert('RGBA')
    fav_76 = Image.open(os.path.join(src_fav_dir, 'web', 'icons8-bumblebee-glassmorphism-76.png')).convert('RGBA')
    fav_96 = Image.open(os.path.join(src_fav_dir, 'web', 'icons8-bumblebee-glassmorphism-96.png')).convert('RGBA')

    base_48 = Image.open(os.path.join(src_base_dir, 'icons8-bumblebee-48.png')).convert('RGBA')
    base_100 = Image.open(os.path.join(src_base_dir, 'icons8-bumblebee-100.png')).convert('RGBA')

    # Scaled variants from base_100
    img_64 = base_100.resize((64, 64), Image.Resampling.LANCZOS)
    img_120 = base_100.resize((120, 120), Image.Resampling.LANCZOS)
    img_152 = base_100.resize((152, 152), Image.Resampling.LANCZOS)
    img_180 = base_100.resize((180, 180), Image.Resampling.LANCZOS)
    img_192 = base_100.resize((192, 192), Image.Resampling.LANCZOS)
    img_512 = base_100.resize((512, 512), Image.Resampling.LANCZOS)

    def make_maskable(base_img, size, scale=0.75):
        canvas = Image.new('RGBA', (size, size), (255, 255, 255, 255))
        icon_s = int(size * scale)
        scaled = base_img.resize((icon_s, icon_s), Image.Resampling.LANCZOS)
        offset = ((size - icon_s) // 2, (size - icon_s) // 2)
        canvas.paste(scaled, offset, scaled)
        return canvas

    maskable_192 = make_maskable(base_100, 192)
    maskable_512 = make_maskable(base_100, 512)

    os.makedirs(PUBLIC_DIR, exist_ok=True)
    os.makedirs(BRAND_ASSETS_DIR, exist_ok=True)

    # 1. Favicons
    fav_16.save(os.path.join(PUBLIC_DIR, 'favicon-16x16.png'))
    fav_32.save(os.path.join(PUBLIC_DIR, 'favicon-32x32.png'))
    base_48.save(os.path.join(PUBLIC_DIR, 'favicon-48x48.png'))

    # Multi-resolution ICO in public and src/assets/brand
    ico_img = base_100.resize((64, 64), Image.Resampling.LANCZOS)
    ico_img.save(os.path.join(PUBLIC_DIR, 'favicon.ico'), format='ICO', sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64)])
    ico_img.save(os.path.join(BRAND_ASSETS_DIR, 'favicon.ico'), format='ICO', sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64)])

    # 2. Apple Touch Icons
    img_180.save(os.path.join(PUBLIC_DIR, 'apple-touch-icon.png'))
    img_180.save(os.path.join(PUBLIC_DIR, 'apple-touch-icon-180x180.png'))
    img_152.save(os.path.join(PUBLIC_DIR, 'apple-touch-icon-152x152.png'))
    img_120.save(os.path.join(PUBLIC_DIR, 'apple-touch-icon-120x120.png'))
    fav_76.save(os.path.join(PUBLIC_DIR, 'apple-touch-icon-76x76.png'))
    fav_60.save(os.path.join(PUBLIC_DIR, 'apple-touch-icon-60x60.png'))

    # 3. PWA Icons
    img_64.save(os.path.join(PUBLIC_DIR, 'pwa-64x64.png'))
    img_192.save(os.path.join(PUBLIC_DIR, 'pwa-192x192.png'))
    img_512.save(os.path.join(PUBLIC_DIR, 'pwa-512x512.png'))
    maskable_192.save(os.path.join(PUBLIC_DIR, 'pwa-maskable-192x192.png'))
    maskable_512.save(os.path.join(PUBLIC_DIR, 'pwa-maskable-512x512.png'))

    # 4. Push notifications and SW
    img_192.save(os.path.join(PUBLIC_DIR, 'logo192.png'))
    img_512.save(os.path.join(PUBLIC_DIR, 'logo512.png'))

    # 5. SVGs
    buf_512 = io.BytesIO()
    img_512.save(buf_512, format='PNG')
    b64_512 = base64.b64encode(buf_512.getvalue()).decode('ascii')

    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,{b64_512}" width="512" height="512" />
</svg>'''

    for svg_path in [
        os.path.join(PUBLIC_DIR, 'favicon.svg'),
        os.path.join(PUBLIC_DIR, 'masked-icon.svg'),
        os.path.join(BRAND_ASSETS_DIR, 'logo.svg'),
        os.path.join(SRC_ASSETS_DIR, 'Biponi.svg'),
        os.path.join(SRC_ASSETS_DIR, 'Biponi2.svg'),
        os.path.join(BASE_DIR, 'src', 'logo.svg'),
    ]:
        with open(svg_path, 'w') as f:
            f.write(svg_content)

    # 6. src/assets/brand/
    img_512.save(os.path.join(BRAND_ASSETS_DIR, 'logo.png'))
    img_512.save(os.path.join(BRAND_ASSETS_DIR, 'logo-lg.png'))
    img_192.save(os.path.join(BRAND_ASSETS_DIR, 'logo-md.png'))
    fav_96.save(os.path.join(BRAND_ASSETS_DIR, 'logo-sm.png'))
    base_48.save(os.path.join(BRAND_ASSETS_DIR, 'logo-xs.png'))

    # 7. Legacy aliases in src/assets/
    base_100.save(os.path.join(SRC_ASSETS_DIR, 'Biponi-lg.png'))
    img_512.save(os.path.join(SRC_ASSETS_DIR, 'Biponi-lg2.png'))
    base_100.save(os.path.join(SRC_ASSETS_DIR, 'Biponi-lg4.png'))
    img_512.save(os.path.join(SRC_ASSETS_DIR, 'Biponi-lgdfd.png'))
    base_100.save(os.path.join(SRC_ASSETS_DIR, 'Biponi-lg-v2.png'))

    print("✅ Successfully generated all brand, PWA, and favicon assets!")

if __name__ == '__main__':
    main()
