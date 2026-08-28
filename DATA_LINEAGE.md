# Trazabilidad de datos

## `data/` — entrada cruda / provista por el challenge (nada se genera aquí)

| Archivo | Origen |
|---|---|
| `data/articles/*.txt` (338 archivos) | Provisto por el VAST Challenge 2024 (artículos de noticias + reportes policiales `*_Police.txt`) |
| `data/csv/graph.csv` | Provisto por el challenge — grafo base (14201 filas) |
| `data/csv/police_bias.ods` | Provisto por el challenge — citaciones policiales, formato crudo |
| `data/csv/reports_omitted.ods` | Mismo dataset que `police_bias.ods` (233 registros), pero recolumnado (`id, source, date, time, location, entity, citation_id, action, available_to, mentioned, valid`). No hay script en el repo que haga esta transformación — se movió tal cual desde `visualization/` donde vivía suelto. |
| `data/graph/graph.json` | Provisto por el challenge — mismo grafo que `graph.csv` en formato node-link JSON |
| `data/Oceanus Information/*` | Material de referencia provisto por el challenge (mapas, org chart) |

## `outputs/csv/` — generado por `notebooks/`

| Archivo | Generador |
|---|---|
| `graph.csv` | `notebooks/1_LLM_chatGPT.ipynb`, celda 27 — extracción cruda vía GPT sobre `data/articles/*.txt` |
| `graph_modified.csv` | `notebooks/3_Bias_Analysis.ipynb`, celda 70 — enriquece `graph.csv` (categoría de sentimiento + fuzzy-match de nombres contra `data/csv/graph.csv`) |
| `bassLine_editions.csv` | `notebooks/3_Bias_Analysis.ipynb`, celda 31 — filas de `data/csv/graph.csv` con `_algorithm=="BassLine"` editadas por un humano |
| `shadGPT_editions.csv` | `notebooks/3_Bias_Analysis.ipynb`, celda 30 — ídem para `_algorithm=="ShadGPT"` |

## `outputs/visualization/` — consumido por `visualization/main.py`

| Archivo | Generador |
|---|---|
| `article_publications/data_felipe.json` | `visualization/proc_felipe.py` (regenerable — ejecutar `python proc_felipe.py` desde `visualization/`). Combina `data/graph/graph.json` + `outputs/csv/graph_modified.csv` + `data/csv/reports_omitted.ods`. |
| `data_final.csv`, `data_clean2.json`, `article_publications/article_publications_data.csv` | Derivados de `data/csv/graph.csv` (mismas filas/esquema + columnas `_weight`, `_journal` añadidas). **Sin script generador en el repo actual** — el que los produjo ya no existe. |
| `comp.json`, `companies.json`, `companies_0.json`, `no_tr_cf_comp.json`, `article_publications/article_publications_allcomps.json` | Listas de entidades clasificadas por `source_type`/`target_type` de `data/csv/graph.csv`. **Sin script generador en el repo actual.** |
| `article_publications/article_publications_positive.json`, `article_publications/article_publications_negative.json` | Subconjuntos por sentimiento de evento del mismo origen. **Sin script generador.** |
| `transactions2.csv`, `transactions_final.json`, `positions4.json` | Agregación de transacciones y coordenadas de layout. **Sin script generador.** |

## `visualization/` — código de la app (sin datos)

`main.py` (Flask, 5 rutas), `proc_felipe.py` (regenera `data_felipe.json`), `templates/index{,2,3,4}.html`, `static/{css,js}/*` — todo consume desde `../data/` y `../outputs/` vía rutas relativas.
