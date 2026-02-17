#!/usr/bin/env python3
"""
Script para extraer imágenes del catálogo PDF
"""
import os
import sys
from pathlib import Path

try:
    from pdf2image import convert_from_path
    from PIL import Image
except ImportError:
    print("❌ Instalando dependencias necesarias...")
    os.system("pip3 install pdf2image Pillow")
    from pdf2image import convert_from_path
    from PIL import Image

def extract_images_from_pdf(pdf_path, output_dir, dpi=150):
    """
    Extrae imágenes del PDF convirtiéndolo a imágenes por página

    Args:
        pdf_path: Ruta al archivo PDF
        output_dir: Directorio donde guardar las imágenes
        dpi: Resolución de las imágenes (default: 150)
    """
    print(f"📄 Procesando: {pdf_path}")
    print(f"📁 Guardando en: {output_dir}")

    # Crear directorio si no existe
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    try:
        # Convertir PDF a imágenes (una por página)
        print(f"🔄 Convirtiendo PDF a imágenes (DPI: {dpi})...")
        images = convert_from_path(
            pdf_path,
            dpi=dpi,
            fmt='png',
            thread_count=4
        )

        print(f"✅ Se encontraron {len(images)} páginas")

        # Guardar cada imagen
        for i, image in enumerate(images, start=1):
            filename = f"catalogo_pagina_{i:03d}.png"
            filepath = os.path.join(output_dir, filename)

            # Optimizar imagen
            image.save(filepath, 'PNG', optimize=True)
            print(f"  ✓ Guardada: {filename}")

        print(f"\n✨ ¡Completado! {len(images)} imágenes extraídas")
        return len(images)

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return 0

if __name__ == "__main__":
    # Rutas
    pdf_path = "/Users/pablocisneros/Desktop/EDESA VENTAS/CATALOGO 2026 .pdf"
    output_dir = "/Users/pablocisneros/Desktop/EDESA VENTAS/edesa-ventas/public/images/catalog"

    # Extraer imágenes
    count = extract_images_from_pdf(pdf_path, output_dir, dpi=150)

    if count > 0:
        print(f"\n📸 Las imágenes están en: {output_dir}")
        print("\n💡 Próximo paso: Recorta las imágenes de productos individuales")
    else:
        print("\n⚠️  No se pudieron extraer imágenes")
        sys.exit(1)
