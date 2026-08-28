import pandas as pd
import networkx as nx
# import matplotlib.pyplot as plt
import json
import math
from flask import Flask, render_template, request

# df = pd.read_csv('../outputs/visualization/data_clean2.json')
"""
transactions = pd.read_csv('../outputs/visualization/transactions2.csv')
	
df = df.drop_duplicates(subset=['source', 'type', 'target', '_weight', '_date', '_journal'])# , '_algorithm'])

set1 = set(
	df.loc[df['source_type'].isin(['Entity.Organization.Company', 'Entity.Organization.LogisticsCompany', 'Entity.Organization.FishingCompany'])]['source'].unique()
)
set2 = set(
	df.loc[df['target_type'].isin(['Entity.Organization.Company', 'Entity.Organization.LogisticsCompany', 'Entity.Organization.FishingCompany'])]['target'].unique()
)

set3 = list(set1.union(set2))
"""

# read regular edges
df = None
with open('../outputs/visualization/data_clean2.json') as f:
    df = json.load(f)
df = pd.DataFrame(df)

# read companies
comp = None
with open('../outputs/visualization/comp.json') as f:
    comp = json.load(f)

no_tr_cf_comp = None
with open('../outputs/visualization/no_tr_cf_comp.json') as f:
    no_tr_cf_comp = json.load(f)

print('no tr')
print(len(no_tr_cf_comp))
# merge companies and assign global id
all_companies = no_tr_cf_comp + comp
all_companies = sorted(all_companies)

global_ids = dict()
for i, s in enumerate(all_companies):
	global_ids[s] = i

# read transactions
transactions = None
with open('../outputs/visualization/transactions_final.json') as f:
    transactions = json.load(f)

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def main():
	df = pd.read_csv('../outputs/visualization/data_final.csv')
	transactions = pd.read_csv('../outputs/visualization/transactions2.csv')
	companies_0 = []
	companies = []
	positions = []

	with open('../outputs/visualization/companies_0.json') as f:
	    companies_0 = json.load(f)

	with open('../outputs/visualization/companies.json') as f:
	    companies = json.load(f)

	with open('../outputs/visualization/positions4.json') as f:
	    positions = json.load(f)

	for i, p in enumerate(positions):
		positions[i]['id'] = i # global_ids[positions[i]['name']]

	df = df.drop_duplicates(subset=['source', 'type', 'target', '_weight', '_date', '_journal', '_algorithm'])
	# df = df[['source', 'type', 'target', '_weight', '_date', '_journal', '_last_edited_by']]
	df = df[['source', 'type', 'target', '_weight', '_date', '_journal', '_last_edited_by', '_algorithm']]
	timesteps = list(df['_date'].unique())
	journals = list(df['_journal'].unique())
	return render_template('index.html',
		data=df.to_dict('records'),
		transactions=transactions.to_dict('records'),
		positions=positions,
		timesteps=timesteps,
		journals=journals
    )

@app.route('/graph', methods=['GET', 'POST'])
def graph():
	global df
	global transactions
	# df = pd.read_csv('../outputs/visualization/data_final.csv')
	# transactions = pd.read_csv('../outputs/visualization/transactions2.csv')
	
	# df = df.drop_duplicates(subset=['source', 'type', 'target', '_weight', '_date', '_journal', '_algorithm'])
	"""
	set1 = set(
		df.loc[df['source_type'].isin(['Entity.Organization.Company', 'Entity.Organization.LogisticsCompany', 'Entity.Organization.FishingCompany'])]['source'].unique()
	)
	set2 = set(
		df.loc[df['target_type'].isin(['Entity.Organization.Company', 'Entity.Organization.LogisticsCompany', 'Entity.Organization.FishingCompany'])]['target'].unique()
	)

	set3 = list(set1.union(set2))
	"""
	# Create the graph
	G = nx.Graph()
	
	# Add nodes
	G.add_nodes_from(comp)
	
	# for _, row in transactions.iterrows():
	# G.add_edge(row['node1'], row['node2'], weight=row['count'])
	for key, value in transactions.items():
		for key2, value2 in value.items():
			G.add_edge(key, key2, weight=value2)

	pos = nx.kamada_kawai_layout(G) 
	
	positions = []
	for key, value in pos.items():
		positions.append({
			'id': global_ids[key],
			'name': key,
			'x': value[0],
			'y': value[1]
		})

	min_x = min([x['x'] for x in positions])
	max_x = max([x['x'] for x in positions])
	min_y = min([x['y'] for x in positions])
	max_y = max([x['y'] for x in positions])

	max_x = min_x
	min_x = max_x - 1

	cols = 3
	rows = 13

	x_step = ((max_x - min_x)/cols)
	y_step = ((max_y - min_y)/rows)

	x = min_x
	y = max_y + y_step

	i = 0
	for c in no_tr_cf_comp:
		if i % cols == 0:
			y -= y_step
			x = min_x
		positions.append({
			'id': global_ids[c],
			'name': c,
			'x': x,
			'y': y
		})
		x += x_step
		i += 1

	# df = df[['source', 'type', 'target', '_weight', '_date', '_journal', '_last_edited_by']]
	# df = df[['source', 'type', 'target', '_weight', '_date', '_journal', '_last_edited_by', '_algorithm']]
	timesteps = list(df['_date'].unique())
	journals = list(df['_journal'].unique())

	# read original graph
	data_felipe = None
	with open('../outputs/visualization/article_publications/data_felipe.json') as f:
	    data_felipe = json.load(f)

	edge_weights = {
    	'Event.Invest': 1,
    	'Event.Aid': 1,
    	'Event.Fishing.SustainableFishing': 1,
    	'Event.Fishing': 0.5,
    	'Event.Applaud': 1,
    	'Event.CertificateIssued': 1,
    	'Event.Communication.Conference': 0,
    	'Event.Transaction': 0,
    	'Event.Owns.PartiallyOwns': 0,
    	'Event.Fishing.OverFishing': -1,
    	'Event.Criticize': -1,
    	'Event.CertificateIssued.Summons': -1,
    	'Event.Convicted': -1
	}

	for i in range(len(data_felipe)):
		w = data_felipe[i]['type']
		if isinstance(w, list):
			w = w[0]

		data_felipe[i]['type'] = w
		data_felipe[i]['_weight'] = edge_weights[w]
		data_felipe[i]['_journal'] = data_felipe[i]['_raw_source']
		data_felipe[i]['_date'] = '2035-07-30'

	return render_template('graph.html',
		data=df.to_dict('records'),
		transactions=transactions,
		positions=positions,
		timesteps=timesteps,
		journals=journals,
		data_felipe=data_felipe
    )

@app.route('/get_nodes', methods=['GET', 'POST'])
def get_nodes():
	global df
	global transactions
	params = request.get_json()
	node = params['name']

	"""
	linked = transactions.loc[(transactions['node1'] == node) | (transactions['node2'] == node)]
	linked = set(list(linked['node1'].unique())).union().union(set(list(linked['node2'].unique())))
	linked = list(linked)
	linked.remove(node)
	"""
	linked = transactions[node].keys()

	if len(linked) == 0:
		return []
	
	positions = []

	positions.append({
			'id': global_ids[node],
			'name': node,
			'x': 0,
			'y': 0
	})

	nodes_higher = []
	journals = list(df['_journal'].unique())

	for l in linked:
		highest_score = -300
		highest_journal = 'None'
		for j in journals:
			tmp = df.loc[((df['source'] == l) | (df['target'] == l))&(df['_journal'] == j)]
			tmp = tmp.loc[~tmp['type'].isin(['Event.Communication.Conference', 'Event.Transaction', 'Event.Fishing'])]
			tmp = list(tmp['_weight'])
			if len(tmp) == 0:
				# print(l, j, tmp)
				continue
			s = sum(tmp)
			# print(l, j, s)
			if s > highest_score:
				highest_score = s
				highest_journal = j
		nodes_higher.append((l, highest_journal))

	nodes_higher = sorted(nodes_higher, key = lambda x:x[1])
	# print(nodes_higher)
	nodes_higher = [x[0] for x in nodes_higher]

	radius = 2
	angle_increment = 2 * math.pi / len(linked)  # Divide the circle into n parts
	j = 1
	for i in range(len(nodes_higher)):
		angle = i * angle_increment
		x = radius * math.cos(angle)
		y = radius * math.sin(angle)
		positions.append({'id': global_ids[nodes_higher[i]], 'name': nodes_higher[i], 'x': x, 'y': y })
		j = j + 1
	
	remaining = list(set(all_companies) - set(linked))
	remaining.remove(node)

	remaining = list(set(remaining) - set(no_tr_cf_comp))

	radius = 3
	angle_increment = 2 * math.pi / len(remaining)  # Divide the circle into n parts
	for i in range(len(remaining)):
		angle = i * angle_increment
		x = radius * math.cos(angle)
		y = radius * math.sin(angle)
		positions.append({'id': global_ids[remaining[i]], 'name': remaining[i], 'x': x, 'y': y })
		j = j+1

	"""
	radius = 4
	angle_increment = 2 * math.pi / len(companies_2)  # Divide the circle into n parts
	for i in range(len(companies_2)):
		angle = i * angle_increment
		x = radius * math.cos(angle)
		y = radius * math.sin(angle)
		if companies_2[i] in global_ids:
			positions.append({'id': global_ids[companies_2[i]], 'name': companies_2[i], 'x': x, 'y': y })
			j = j+1
		# else:
		# 	print(companies_2[i])
	"""
	min_x = min([x['x'] for x in positions])
	max_x = max([x['x'] for x in positions])
	min_y = min([x['y'] for x in positions])
	max_y = max([x['y'] for x in positions])

	max_x = min_x
	min_x = max_x - 2

	cols = 3
	rows = 13

	x_step = ((max_x - min_x)/cols)
	y_step = ((max_y - min_y)/rows)

	x = min_x
	y = max_y + y_step

	i = 0
	for c in no_tr_cf_comp:
		if i % cols == 0:
			y -= y_step
			x = min_x
		positions.append({
			'id': global_ids[c],
			'name': c,
			'x': x,
			'y': y
		})
		x += x_step
		i += 1
	return positions

@app.route('/article_publications', methods=['GET', 'POST'])
def article_publications():
	# read data
	data = pd.read_csv('../outputs/visualization/article_publications/article_publications_data.csv')

	# read companies
	companies = None
	with open('../outputs/visualization/article_publications/article_publications_allcomps.json') as f:
		companies = json.load(f)

	# positive
	positive = None
	with open('../outputs/visualization/article_publications/article_publications_positive.json') as f:
		positive = json.load(f)

	# negative
	negative = None
	with open('../outputs/visualization/article_publications/article_publications_negative.json') as f:
		negative = json.load(f)

	# read original graph
	data_felipe = None
	with open('../outputs/visualization/article_publications/data_felipe.json') as f:
	    data_felipe = json.load(f)

	analysts = sorted(list(df['_last_edited_by'].unique())) + ['Felipe']
	companies = sorted(companies)

	edge_types=[
		'Event.Invest','Event.Aid','Event.Fishing.SustainableFishing','Event.Fishing','Event.Applaud','Event.CertificateIssued',
		'Event.Fishing.OverFishing','Event.Criticize','Event.CertificateIssued.Summons','Event.Convicted']

	final_data = data.to_dict('records') + data_felipe

	print(data['_raw_source'])
	return render_template('article_publications.html', data=final_data,
		positive=positive, negative=negative,
		companies=companies, analysts=analysts,
		edge_types=edge_types
	)

@app.route('/police_records', methods=['GET', 'POST'])
def police_records():
	pr = pd.read_excel("../data/csv/reports_omitted.ods", engine="odf")

	all_companies = list(pr['entity'].unique())
	favored_companies = []

	for company in all_companies:
		pr_temp = pr.loc[(pr['entity'] == company) & (pr['mentioned'] == 0)]
		if len(pr_temp) > 0:
			favored_companies.append((company, len(pr_temp)))

	favored_companies = sorted(favored_companies, key = lambda x:x[1])

	journals = ['The News Buoy', 'Lomark Daily','Haacklee Herald']
	journals_steps = [-1.5, 0, 1.5]

	positions = []

	x_start = 0
	y_start = 1.5
	x_step = 1
	y_step = 5

	companies = []
	for i, company in enumerate(favored_companies):
		for j, journal in enumerate(journals):
			pr_total = pr.loc[(pr['entity'] == company[0]) & (pr['available_to'] == journal)]
			pr_omitted = pr.loc[(pr['entity'] == company[0]) & (pr['available_to'] == journal) & (pr['mentioned'] == 0)]
			len_omitted = len(pr_omitted)
			len_remaining = len(pr_total) - len_omitted

			x = x_start
			for k in range(len_remaining):
				positions.append({
					'x': x,
					'y': y_start + journals_steps[j] + y_step*i,
					'type': 'mentioned',
					'journal': journal,
					'company': company
				})
				x += x_step

			for k in range(len_omitted):
				positions.append({
					'x': x,
					'y': y_start + journals_steps[j] + y_step*i,
					'type': 'omitted',
					'journal': journal,
					'company': company
				})
				x += x_step

		companies.append({'name': company[0], 'y': y_start + y_step*i , 'x': -1})

	return render_template('police_records.html', data=positions, journals=journals, companies=companies)

# main driver function
if __name__ == '__main__':
    app.run()