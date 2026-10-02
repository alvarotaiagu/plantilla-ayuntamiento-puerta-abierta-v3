"""fotos.py — prepara las fotos de media/ con una gradación común.

Las fotos de un pueblo llegan de mil sitios (la web del Ayuntamiento, Commons,
el móvil del concejal) y cada una tiene su dominante. Aquí se igualan con la
receta de la memoria «food photo consistency», no con filtros de moda:

  1. dominante fuera: el blanco de la cal y el gris del cielo se llevan a neutro
     (a medias, para no dejar la foto muerta);
  2. cielos neutros: el azul del cielo pierde saturación;
  3. cal limpia: lo casi blanco y poco saturado se aclara y se desatura;
  4. saturación contenida en toda la foto y una curva suave de contraste.

Además recorta (las fechas naranjas impresas de algunas fotos de Commons, la
franja de texto de un cartel) y reduce: <nombre>.jpg a 1600 px de lado largo y
<nombre>-800.jpg para móvil.

  python scripts/fotos.py --lote media/_lote.json     todas las del encargo
  python scripts/fotos.py origen.jpg media/plaza.jpg [--recorte 0,0,1,0.85]

_lote.json: [{"origen": "...", "salida": "plaza", "recorte": [x0, y0, x1, y1]}]
(el recorte en fracciones del ancho y el alto; la ruta de origen, relativa a la
carpeta del lote o absoluta).
"""
import json, os, sys
import numpy as np
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LADO = 1600
LADO_MOVIL = 800


def rgb_a_hsv(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = a.max(-1); mn = a.min(-1); d = mx - mn
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)
    h = np.zeros_like(mx)
    m = d > 1e-6
    rr = (mx == r) & m; gg = (mx == g) & m & ~rr; bb = m & ~rr & ~gg
    h[rr] = ((g - b)[rr] / d[rr]) % 6
    h[gg] = (b - r)[gg] / d[gg] + 2
    h[bb] = (r - g)[bb] / d[bb] + 4
    return h * 60, s, mx


def gradar(im):
    a = np.asarray(im.convert('RGB')).astype(np.float32) / 255
    h, s, v = rgb_a_hsv(a)

    # 1. dominante: media de los píxeles claros y poco saturados (cal, nubes)
    neutros = (v > 0.62) & (s < 0.22)
    if neutros.sum() > a.shape[0] * a.shape[1] * 0.01:
        media = a[neutros].mean(0)
        gris = media.mean()
        ganancia = 1 + 0.55 * (gris / np.maximum(media, 1e-3) - 1)
        a = np.clip(a * ganancia, 0, 1)

    # 2-4. trabajar en «luma + croma»: croma = diferencia con el gris
    luma = (a * np.array([0.2126, 0.7152, 0.0722])).sum(-1, keepdims=True)
    croma = a - luma
    h, s, v = rgb_a_hsv(a)
    factor = np.full(v.shape, 0.86, np.float32)                  # saturación contenida
    cielo = (h > 185) & (h < 250) & (v > 0.45)
    factor[cielo] = 0.66                                          # cielos neutros
    cal = (v > 0.78) & (s < 0.18) & ~cielo
    factor[cal] = 0.5                                            # cal limpia
    croma = croma * factor[..., None]

    # curva suave: un poco más de cuerpo en los medios, blancos limpios sin quemar
    l = luma
    l = l + 0.06 * np.sin(np.pi * l) * (l - 0.5) * 2              # contraste suave
    l = np.where(l > 0.82, l + (l - 0.82) * 0.08, l)                # cal más limpia
    out = np.clip(l + croma, 0, 1)
    return Image.fromarray((out * 255 + 0.5).astype(np.uint8))


def preparar(origen, salida, recorte=None):
    im = Image.open(origen).convert('RGB')
    if recorte:
        x0, y0, x1, y1 = recorte
        w, h = im.size
        im = im.crop((round(x0 * w), round(y0 * h), round(x1 * w), round(y1 * h)))
    im = gradar(im)
    base = os.path.splitext(salida)[0]
    os.makedirs(os.path.dirname(base) or '.', exist_ok=True)
    grande = im.copy(); grande.thumbnail((LADO, LADO), Image.LANCZOS)
    grande.save(base + '.jpg', quality=82, optimize=True, progressive=True)
    movil = im.copy(); movil.thumbnail((LADO_MOVIL, LADO_MOVIL), Image.LANCZOS)
    movil.save(base + '-800.jpg', quality=80, optimize=True, progressive=True)
    print('%s.jpg  %dx%d  (+ -800)' % (os.path.relpath(base, RAIZ).replace('\\', '/'), grande.width, grande.height))


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    args = sys.argv[1:]
    if args[:1] == ['--lote']:
        ruta = os.path.abspath(args[1])
        carpeta = os.path.dirname(ruta)
        for t in json.load(open(ruta, encoding='utf-8')):
            origen = t['origen'] if os.path.isabs(t['origen']) else os.path.join(carpeta, t['origen'])
            preparar(origen, os.path.join(RAIZ, 'media', t['salida']), t.get('recorte'))
    elif len(args) >= 2:
        rec = None
        if '--recorte' in args:
            rec = [float(x) for x in args[args.index('--recorte') + 1].split(',')]
        preparar(args[0], args[1], rec)
    else:
        print(__doc__)
