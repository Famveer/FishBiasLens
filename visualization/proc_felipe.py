import pandas as pd
import networkx as nx
# import matplotlib.pyplot as plt
import json

def proc():
	# read original graph
	mc1 = None
	with open('../data/graph/graph.json') as f:
	    mc1 = json.load(f)

	H = nx.node_link_graph(mc1, edges="links")
	H_nodes = list(H.nodes)
	# H_nodes = [x[0] for x in H_nodes]
	H_nodes_lower = [x.lower() for x in H_nodes]

	df_felipe = pd.read_csv('../outputs/csv/graph_modified.csv', sep='\t')

	# print('sources')
	# print(df_felipe['source'].unique())
	# print('targets')
	# print(df_felipe['target'].unique())
	# print('close source')
	# print(df_felipe['close_source_name'].unique())
	# print('close target')
	# print(df_felipe['close_target_name'].unique())
	# print(df_felipe.columns)
	# print(df_felipe['type'].value_counts())

	df_felipe_data = []
	edge_types=[
		'Event.Invest','Event.Aid','Event.Fishing.SustainableFishing','Event.Fishing','Event.Applaud','Event.CertificateIssued',
		'Event.Fishing.OverFishing','Event.Criticize','Event.CertificateIssued.Summons','Event.Convicted']

	edge_types_lower = [x.lower() for x in edge_types]

	for index, row in df_felipe.iterrows():
		n_source = None
		n_target = None
		n_type = None
		if row['source'] not in H_nodes_lower:
			if row['close_source_name'] not in H_nodes_lower:
				continue
			else:
				n_source = row['close_source_name']
		else:
			n_source = row['source']

		if row['target'] not in H_nodes_lower:
			if row['close_target_name'] not in H_nodes_lower:
				continue
			else:
				n_target = row['close_target_name']
		else:
			n_target = row['target']

		if row['type'].lower() not in edge_types_lower:
			continue
		else:
			n_type = row['type'].lower()

		f_source = H_nodes[H_nodes_lower.index(n_source)]
		f_target = H_nodes[H_nodes_lower.index(n_target)]
		f_type = edge_types[edge_types_lower.index(n_type)]

		raw_source = None
		if 'Haacklee Herald' in row['_articleid']:
			raw_source = 'Haacklee Herald'

		if 'Lomark Daily' in row['_articleid']:
			raw_source = 'Lomark Daily'

		if 'The News Buoy' in row['_articleid']:
			raw_source = 'The News Buoy'

		df_felipe_data.append({
			'source': f_source,
			'target': f_target,
			'type': f_type,
			'_algorithm': 'OwnExtraction',
			'_last_edited_by': 'Felipe',
			'_articleid': row['_articleid'],
			'_raw_source': raw_source
		})

	print(len(df_felipe_data))
	police_reports = pd.read_excel("../data/csv/reports_omitted.ods", engine="odf")
	police_reports = police_reports.drop_duplicates(subset=['citation_id'])
	print(list(police_reports['action'].unique()))
	print(len(police_reports))
	action_dict = {
		'Summons Issued': ['Event.CertificateIssued.Summons'],
		'Summons and Convicted': ['Event.CertificateIssued.Summons', 'Event.Convicted'],
		'Convicted':['Event.Convicted'],
		'Multiple Summonses Issued':['Event.CertificateIssued.Summons'],
		'Summonses Issued, No Conviction':['Event.CertificateIssued.Summons'],
		'Summonses and Conviction':['Event.CertificateIssued.Summons', 'Event.Convicted'],
		'Multiple Summonses and Conviction':['Event.CertificateIssued.Summons', 'Event.Convicted'],
		'Summonses Issued':['Event.CertificateIssued.Summons'],
		'Convicted of Overfishing':['Event.Fishing.OverFishing', 'Event.Convicted'],
		'OverFishing':['Event.Fishing.OverFishing'],
		'Summon Issued': ['Event.CertificateIssued.Summons'],
		'Convicted: OverFishing case': ['Event.Convicted']
	}
	for index,row in police_reports.iterrows():
		r_type = action_dict[row['action']]
		r_source = 'Police'
		r_target = row['entity']

		df_felipe_data.append({
			'source': r_source,
			'target': r_target,
			'type': r_type,
			'_algorithm': 'OwnExtraction',
			'_last_edited_by': 'Felipe',
			'_articleid': row['source'],
			'_raw_source': 'Police Report'
		})


	print(len(df_felipe_data))
	with open('../outputs/visualization/article_publications/data_felipe.json', 'w') as f:
		json.dump(df_felipe_data, f)
proc()