import networkx as nx
import json
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from pathlib import Path
from flask import Flask, render_template, request

GRAPH_PATH = Path(__file__).resolve().parent.parent / "data" / "graph" / "graph.json"

data = None
with open(GRAPH_PATH) as f:
	data = json.load(f)

H = nx.node_link_graph(data, edges="links")

nodes_names = H.nodes
nodes = [
	{"name":n, "type":H.nodes.get(n)["type"]} for i, n in enumerate(nodes_names)
]

edg = list(H.edges(data=True))
edt = ['type','_last_edited_by','_last_edited_date','_date_added','_raw_source','_algorithm','_articleid']
dt = []

for i,e in enumerate(edg):
	d = {}
	d['source'] = e[0]
	d['target'] = e[1]
	for k in edt:
		try:
			d[k] = e[2][k]
		except:
			d[k] = None
		dt.append(d)

# df = df.loc[(df['target'] == 'SouthSeafood Express Corp')|(df['source'] == 'SouthSeafood Express Corp')]
# df = df.loc[(df['_algorithm'] == 'BassLine') & (df['target'].isin(all_companies))& (df['source'].isin(sources))]
# df = df.loc[(df['_algorithm'] == 'BassLine') & (df['target'].isin(sources)) & (df['source'].isin(all_companies))]
# df = df.loc[(df['target']=='Jones Group')& (df['source'].isin(sources))]
# df = df.drop_duplicates(subset=['source', 'target', 'type'], keep='last')
# return render_template('index.html', nodes=nodes, edges=df.to_dict('records'))


app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def main():
	return render_template('index.html', nodes=nodes, edges=[])

@app.route('/filter', methods=['GET', 'POST'])
def filter():
	df = pd.DataFrame.from_dict(dt)
	# df['_last_edited_date'] = pd.to_datetime(df['_last_edited_date'], format='%Y-%m-%dT%H:%M:%S')
	# df['_date_added'] = pd.to_datetime(df['_date_added'], format='%Y-%m-%dT%H:%M:%S')

	params = request.get_json()
	edge_agg = params.get('edge_agg')
	edge_types = params.get('edge_types')
	alg_used = params.get('alg_used')
	human_reviewer = params.get('human_reviewer')
	companies = params.get('companies')
	# filter edge types
	if edge_types:
		df = df.loc[df['type'].isin(edge_types)]
	# filter algorithm used
	if alg_used == 'None':
		df = df.loc[(df['_algorithm'].isna())]
	else:
		if alg_used != 'Both':
			# print(alg_used)
			# print(df)
			# print(df['_algorithm'].value_counts())
			df = df.loc[(df['_algorithm'] == alg_used)]
			# print(df['_algorithm'].value_counts())
		else:
			df = df.loc[(df['_algorithm'].isin(['BassLine', 'ShadGPT']))]
	# filter human reviewer
	if human_reviewer == 'None':
		df = df.loc[(df['_last_edited_by'].isna())]
	else:
		if human_reviewer != 'All':
			# print(human_reviewer)
			# print(df)
			# print(df['_last_edited_by'].value_counts())
			df = df.loc[(df['_last_edited_by'] == human_reviewer)]
			# print(df['_last_edited_by'].value_counts())
	
	# filter companies
	if companies:
		df = df.loc[(df['source'].isin(companies) | df['target'].isin(companies))]
	# filter edge aggregation
	if edge_agg != 'frequent':
		df = df.drop_duplicates(subset=['source', 'target', 'type'], keep=edge_agg)
	else:
		df = df.drop_duplicates(subset=['source', 'target', 'type'], keep='last')
	print(companies)
	print(df[['source','target','type','_algorithm','_last_edited_by', '_raw_source']])
	edges_filter = df.to_dict('records')
	return edges_filter

# main driver function
if __name__ == '__main__':
    app.run()
