"""marca-desde-escudo.py — saca los esmaltes del escudo y propone los colores.

  python scripts/marca-desde-escudo.py                 escribe marca/marca.json → colores
  python scripts/marca-desde-escudo.py --solo-ver      solo enseña lo que haría
  python scripts/marca-desde-escudo.py --principal sinople --motivo "…"   fuerza el esmalte
  python scripts/marca-desde-escudo.py --dir pruebas/segura-de-leon/marca

Cómo decide:
  1. Lee los colores exactos del SVG (fill) si hay escudo.svg; si solo hay PNG,
     usa la mediana de los píxeles de cada esmalte.
  2. Cuenta el área de cada esmalte en escudo-480.png (sale de scripts/escudo.mjs).
     Cada píxel opaco se clasifica en sinople, gules, azur, oro, plata, sable,
     púrpura o «natural» (marrones, carnaciones) por su matiz y luminosidad OKLCH.
  3. El principal es el esmalte con más área QUITANDO la plata (el campo suele ser
     plata y no dice nada), el sable, lo «natural» y el oro (que va siempre a la
     decoración; el gules va además a las alertas). Si el escudo no tiene oro o
     gules, se usan los de reserva.
     Si gana el gules, la marca pasa al siguiente esmalte: el gules es el de las
     alertas y un aviso urgente no puede parecer un botón cualquiera.
     El área no lo sabe todo: en Ribera gana el azur de la campaña, pero la pieza
     que da nombre al pueblo es el fresno de sinople. Para eso está --principal,
     y el motivo queda escrito en marca.json («principal_motivo»).
  4. Los tokens de texto (la marca oscurecida hasta AA, el apagado, etc.) NO se
     calculan aquí: los calcula scripts/aplicar.mjs, que se niega a escribir la
     web si algo no llega a AA.
"""
import json, math, os, re, sys
import numpy as np
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESERVA = {'oro': '#EAC102', 'gules': '#C8102E'}
NO_PRINCIPAL = {'plata', 'natural', 'sable', 'oro'}   # el oro es siempre decoración: nunca llega a AA como texto


def hex_a_rgb(h):
    h = h.lstrip('#')
    if len(h) == 3: h = ''.join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def oklch(rgb):
    a = np.asarray(rgb, dtype=np.float64) / 255
    a = np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    l = np.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
    m = np.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
    s = np.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
    L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
    A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
    B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    C = np.hypot(A, B)
    H = (np.degrees(np.arctan2(B, A)) + 360) % 360
    return L, C, H


def esmalte(L, C, H):
    """Vectorizado: devuelve un array de nombres de esmalte."""
    out = np.full(L.shape, 'natural', dtype=object)
    gris = C < 0.04
    out[gris & (L >= 0.6)] = 'plata'
    out[gris & (L < 0.6)] = 'sable'
    col = ~gris
    out[col & ((H < 40) | (H >= 345))] = 'gules'
    out[col & ((H >= 320) | (H < 15)) & (C < 0.12) & (L < 0.62)] = 'purpura'   # malvas: el púrpura heráldico suele pintarse apagado
    marron = col & (H >= 40) & (H < 85) & (L < 0.62)
    out[col & (H >= 40) & (H < 85) & ~marron] = 'oro'
    out[col & (H >= 85) & (H < 120)] = 'oro'
    out[marron] = 'natural'
    out[col & (H >= 120) & (H < 190)] = 'sinople'
    out[col & (H >= 190) & (H < 285)] = 'azur'
    out[col & (H >= 285) & (H < 345)] = 'purpura'
    return out


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    args = sys.argv[1:]
    d = os.path.join(RAIZ, args[args.index('--dir') + 1]) if '--dir' in args else os.path.join(RAIZ, 'marca')
    png = os.path.join(d, 'escudo-480.png')
    if not os.path.exists(png):
        raise SystemExit('✗ Falta %s: ejecuta antes node scripts/escudo.mjs' % png)

    im = np.asarray(Image.open(png).convert('RGBA')).astype(np.float64)
    opaco = im[..., 3] > 200
    rgb = im[..., :3][opaco]

    # colores exactos del SVG, si lo hay
    svg = os.path.join(d, 'escudo.svg')
    exactos = {}
    fills_svg = []
    if os.path.exists(svg):
        txt = open(svg, encoding='utf-8', errors='replace').read()
        fills = re.findall(r'fill\s*[:=]\s*"?\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})\b', txt)
        cuenta = {}
        for f in fills:
            f = f.upper() if len(f) == 7 else '#' + ''.join(c * 2 for c in f[1:]).upper()
            cuenta[f] = cuenta.get(f, 0) + 1
        for f in cuenta:
            l, c, h = oklch(np.array([hex_a_rgb(f)]))
            e = esmalte(l, c, h)[0]
            # el del esmalte que más se repite en el SVG
            if e not in exactos or cuenta[f] > cuenta[exactos[e]]:
                exactos[e] = f
        fills_svg = list(cuenta)

    if fills_svg:
        # cada píxel se clasifica por su color; si sale un esmalte que el SVG no
        # tiene (un borde suavizado entre dos esmaltes), cuenta para el fill más
        # cercano en OKLab
        clase = esmalte(*oklch(rgb))
        clase_fill = esmalte(*oklch(np.array([hex_a_rgb(f) for f in fills_svg])))
        raros = ~np.isin(clase, list(set(clase_fill)))
        if raros.any():
            lab = lambda a: np.stack([a[0], a[1] * np.cos(np.radians(a[2])), a[1] * np.sin(np.radians(a[2]))], -1)
            P = lab(oklch(rgb[raros]))
            F = lab(oklch(np.array([hex_a_rgb(f) for f in fills_svg])))
            clase[raros] = clase_fill[np.argmin(((P[:, None, :] - F[None, :, :]) ** 2).sum(-1), 1)]
    else:
        clase = esmalte(*oklch(rgb))
    total = len(clase)
    areas = {e: float((clase == e).sum()) / total for e in set(clase)}
    representantes = {}
    for e in areas:
        if e in exactos:
            representantes[e] = exactos[e]
        else:
            px = rgb[clase == e]
            representantes[e] = '#%02X%02X%02X' % tuple(int(round(v)) for v in np.median(px, 0))

    candidatos = sorted([e for e in areas if e not in NO_PRINCIPAL and areas[e] > 0.01], key=lambda e: -areas[e])
    forzado = '--principal' in args
    principal = args[args.index('--principal') + 1] if forzado else (candidatos[0] if candidatos else None)
    if not forzado and principal == 'gules' and len(candidatos) > 1:
        # el gules es el color de las alertas (franja urgente, 112): si también fuera
        # la marca, un aviso urgente se confundiría con un botón cualquiera
        print('  · Gana el gules, pero es el color de las alertas: la marca pasa a %s (--principal gules lo fuerza).' % candidatos[1])
        principal = candidatos[1]
    motivo = args[args.index('--motivo') + 1] if '--motivo' in args else ''
    if not principal or principal not in representantes:
        raise SystemExit('✗ No hay un esmalte de color con área suficiente. Usa --principal <esmalte> o pon los colores a mano en marca.json.')

    print('Esmaltes del escudo (área sobre lo opaco):')
    for e in sorted(areas, key=lambda e: -areas[e]):
        if areas[e] >= 0.005:
            print('  %-8s %5.1f %%  %s%s' % (e, areas[e] * 100, representantes[e], '  ← principal' if e == principal else ''))

    ruta = os.path.join(d, 'marca.json')
    conf = json.load(open(ruta, encoding='utf-8')) if os.path.exists(ruta) else {}
    colores = conf.get('colores', {})
    colores.update({
        'papel': colores.get('papel', '#FAF9F5'),
        'superficie': colores.get('superficie', '#FFFFFF'),
        'tinta': colores.get('tinta', '#1A1E1B'),
        'marca': representantes[principal],
        'oro': representantes.get('oro', RESERVA['oro']),
        'alerta': representantes.get('gules', RESERVA['gules'])
    })
    conf['colores'] = colores
    conf['esmaltes'] = {e: representantes[e] for e in sorted(representantes) if areas[e] >= 0.005}
    conf['principal'] = principal
    if forzado and candidatos and candidatos[0] != principal:
        conf['principal_motivo'] = motivo or ('elegido a mano; por área ganaría %s' % candidatos[0])
        print('  · Por área ganaría %s; se usa %s porque se ha pedido con --principal.' % (candidatos[0], principal))
    else:
        conf.pop('principal_motivo', None)
    for falta in ('oro', 'gules'):
        if falta not in representantes:
            print('  · El escudo no tiene %s: se usa el de reserva %s' % (falta, RESERVA[falta]))
    if '--solo-ver' in args:
        print(json.dumps(conf['colores'], indent=2, ensure_ascii=False))
        return
    with open(ruta, 'w', encoding='utf-8') as f:
        f.write(json.dumps(conf, indent=2, ensure_ascii=False) + '\n')
    print('✓ %s → colores (marca = %s %s). Ahora: node scripts/aplicar.mjs' % (os.path.relpath(ruta, RAIZ).replace('\\', '/'), principal, representantes[principal]))


if __name__ == '__main__':
    main()
