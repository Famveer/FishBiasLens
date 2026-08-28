# FishBiasLens

Work presented for the IEEE Visual Analytics Science and Technology (VAST) Challenge 2024. [Paper](https://resume.fmorenovr.com/documents/articles/workshops/2024_VAST.pdf).

# Requirements

- **Python**>=3.12

# Installation and running

```
  cd visualization
  pip install -r requirements.txt
  python main.py
```

Then open `http://127.0.0.1:5000`.

# Docker installation

Build and run locally:

```
  docker-compose up --build -d
```

Or pull the image published by CI on every push to `main` (see
`.github/workflows/docker-publish.yml`) and run it on a server:

```
  docker-compose -f docker-compose.prod.yml up -d
```

# FishBiasLens navigation

* `/` — Main graph explorer: node-link view of all companies/entities, filterable by extraction algorithm (BassLine, ShadGPT, or Both) and by human analyst.
* `/graph` — Extended graph explorer that also includes our own GPT extraction (`OwnExtraction`); clicking a node adds a weighted-edge-sum timeline and an edge-count barchart per journal below the graph.
* `/article_publications` — Side-by-side comparison of article-level extractions across analysts and companies, split into positive/negative edge sets.
* `/police_records` — Visualizes which companies were mentioned vs. omitted by each of the three journals in the police citation reports, to surface reporting bias.
  
# Citation

```
@inproceedings{diaz2024fishbiaslens,
  title={FishBiasLens: Integrating Large Language Models and Visual Analytics for Bias Detection},
  author={Diaz, Dany and Moreno-Vera, Felipe and Heredia, Juanpablo and Venturim, Fabr{\'\i}cio and Poco, Jorge},
  booktitle={2024 IEEE Visual Analytics Science and Technology VAST Challenge},
  pages={17--18},
  year={2024},
  organization={IEEE}
}
```

# Contact us  
For any issue please kindly email to `felipe [dot] moreno [at] fgv [dot] br`

