#!/usr/bin/env python3
"""
Genera js/products.js desde los archivos crudos de ImportProvee.

    cd ~/Downloads/rhode-shoes-proyecto-completo
    python3 _backup/generar-catalogo.py

Fuentes (formato  nombre|/uploads/archivo.jpg|36.37.38 ):
    _backup/importprovee-raw.txt       -> categoría Zapatillas
Para sumar una categoría nueva, agregala a FUENTES.
"""
import re, unicodedata, json, urllib.parse, os, sys
from collections import Counter

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FUENTES = [('Zapatillas', '_backup/importprovee-raw.txt')]
# Los botines se sacaron: eran 2 y sólo en talle 44. Para volver a sumarlos,
# agregá ('Botines', '_backup/importprovee-botines.txt') a la lista.

BRANDS = [
    ('Jordan', ['jordan']),
    ('Nike', ['nike','air max','air vapor','vapor max','af1','air force','dunk','shox',
              'tn plus','nocta','p-6000','dn ','air more uptempo','initiador','offcourt','calm']),
    ('Adidas', ['adidas','samba','superstar','campus','adistar','adizero','forum','bonega',
                'adi2000','yeezy','trenza','delux','moncler x adidas','predator','predstrike','maxpro']),
    ('Louis Vuitton', ['louis vuitton','louis vuittion']),
    ('Off-White', ['off white']), ('New Balance', ['new balance']), ('Asics', ['asics']),
    ('Amiri', ['amiri']), ('MLB', ['mlb']), ('Dior', ['dior']),
    ('Alexander McQueen', ['alexander']), ('Balenciaga', ['balenciaga']),
    ('Versace', ['versace']), ('Valentino', ['valentino']), ('Vans', ['vans']),
    ('On', ['cloudleap']), ('Furyosa', ['furyosa']),
]

def slug(t):
    t = unicodedata.normalize('NFKD', t).encode('ascii', 'ignore').decode()
    t = re.sub(r'[^a-zA-Z0-9]+', '-', t).strip('-').lower()
    return re.sub(r'-+', '-', t)[:60]

def brand(name):
    low = name.lower()
    if low.startswith('nike'): return 'Nike'
    for b, keys in BRANDS:
        if any(k in low for k in keys): return b
    return 'Otras'

rows, seen = [], set()
for cat, rel in FUENTES:
    path = os.path.join(BASE, rel)
    if not os.path.exists(path):
        print('  (falta %s, la salteo)' % rel); continue
    for line in open(path, encoding='utf-8'):
        line = line.rstrip('\n')
        if not line.strip(): continue
        name, file, sz = line.split('|')
        name = name.strip()
        m = re.match(r'^(.*?)\s*"(.+?)"\s*$', name)
        model, variant = (m.group(1).strip(), m.group(2).strip()) if m else (name, '')
        sizes = sorted({int(x) for x in sz.split('.') if x.strip().isdigit()})
        s = slug(name); i = 2
        while s in seen: s = slug(name) + '-%d' % i; i += 1
        seen.add(s)
        remote = ('https://importprovee.com/_next/image?url='
                  + urllib.parse.quote(file, safe='') + '&w=640&q=75') if file else ''
        rows.append(dict(c=cat, b=brand(name), n=model or name, v=variant,
                         img=s, s=sizes, remote=remote))

# sin stock al final; después por categoría, marca y nombre
rows.sort(key=lambda r: (len(r['s']) == 0, r['c'] != 'Zapatillas', r['b'], r['n']))

def js(r):
    tag = 'Último par' if len(r['s']) == 1 else ('Nuevo' if len(r['s']) >= 6 else '')
    j = lambda v: json.dumps(v, ensure_ascii=False)
    return ('  {c:%s, b:%s, n:%s, v:%s, img:%s, s:%s, out:[], tag:%s, remote:%s}'
            % (j(r['c']), j(r['b']), j(r['n']), j(r['v']), j(r['img']),
               j(r['s']), j(tag), j(r['remote'])))

head = '''/* ============================================================
   RHODE SHOES — catálogo
   GENERADO AUTOMÁTICAMENTE. No lo edites a mano: se pisa.
   Para regenerarlo:  python3 _backup/generar-catalogo.py
   ------------------------------------------------------------
     c       categoría (Zapatillas | Botines)
     b       marca
     n       modelo
     v       colorway / variante
     img     archivo local sin extensión, en assets/products/
     s       talles CON stock
     out     talles sin stock (se muestran tachados)
     tag     "Nuevo" | "Último par" | "Ícono" | ""
     remote  foto del proveedor, si todavía no bajaste la local
   ============================================================ */
window.RHODE_PRODUCTS = [
'''
out = os.path.join(BASE, 'js/products.js')
open(out, 'w', encoding='utf-8').write(head + ',\n'.join(js(r) for r in rows) + '\n];\n')

c = Counter(r['c'] for r in rows); b = Counter(r['b'] for r in rows)
print('%d productos  ·  %s' % (len(rows), dict(c)))
print('marcas:', dict(b.most_common()))
print('sin stock:', sum(1 for r in rows if not r['s']))
print('->', out)
