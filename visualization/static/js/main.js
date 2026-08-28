var count = 0;

var node_types = [
	'Entity.Organization.GovernmentOrg',	// level1
	'Entity.Organization.NGO', 		// level1
	'Entity.Person', // level1
	'Entity.Organization.FishingCompany', 	// level 2
	'Entity.Organization.LogisticsCompany', // level 2
	'Entity.Organization.Company', 	// level 2
	'Entity.Location.Region', // level 3
	'Entity.Organization',  // level 3
	'Entity.Commodity',   // level 3
];

var node_colors = {
	'Entity.Organization.GovernmentOrg': '#AB274F',
	'Entity.Organization.NGO': '#58111A',
	'Entity.Person': '#FE6F5E',
	'Entity.Organization.FishingCompany': '#00B9E8',
	'Entity.Organization.LogisticsCompany': '#6699CC',
	'Entity.Organization.Company': '#85B09A', 	
	'Entity.Location.Region': '#B284BE',
	'Entity.Organization': '#E9D66B',
	'Entity.Commodity': '#138808',
};


// level1
var nodes_govorg = nodes.filter(d=>d.type == node_types[0]);
var nodes_ngo = nodes.filter(d=>d.type == node_types[1]);
var nodes_person = nodes.filter(d=>d.type == node_types[2]);
console.log(nodes_govorg);
console.log(nodes_ngo);
console.log(nodes_person);
// level2
var nodes_fishcomp = nodes.filter(d=>d.type == node_types[3]);
var nodes_logcomp = nodes.filter(d=>d.type == node_types[4]);
var nodes_comp = nodes.filter(d=>d.type == node_types[5]);
console.log(nodes_fishcomp);
console.log(nodes_logcomp);
console.log(nodes_comp);

// level3
var nodes_reg = nodes.filter(d=>d.type == node_types[6]);
var nodes_org = nodes.filter(d=>d.type == node_types[7]);
var nodes_com = nodes.filter(d=>d.type == node_types[8]);

console.log(nodes_reg);
console.log(nodes_person);
console.log(nodes_com);

var levels = ['NGO, GovernmentOrg, Person', 'FishingCompany, LogisticsCompany, Company', 'Organization, Region, Commodity'];

var level1_data = nodes_ngo.concat(nodes_govorg);
level1_data = level1_data.concat(nodes_person);

// var level2_data = nodes_comp.concat(nodes_fishcomp);
var level2_data = nodes_fishcomp; // .concat(nodes_logcomp);

var level3_data = nodes_org.concat(nodes_reg);
level3_data = level3_data.concat(nodes_com);

level1_data = level1_data.map(d => ({"level": 0, "name":d.name, "type":d.type}));
level2_data = level2_data.map(d => ({"level": 1, "name":d.name, "type":d.type}));
level3_data = level3_data.map(d => ({"level": 2, "name":d.name, "type":d.type}));


var dropDown = d3.select("#controls")
                .append("select");

var options = dropDown.selectAll('option')
	.data(level2_data)
	.enter()
	.append('option')
	.attr('value', function(d) {
		return d.name;
	})
	.text(function(d) {
		return d.name;
	});

var levels_data = level1_data.concat(level2_data);
levels_data = levels_data.concat(level3_data);

const element = d3.select('#content');
const fullWidth = element.node().clientWidth;
const fullHeight = element.node().clientHeight;

const margin = {top:20, left:30, right:30, bottom:30};
const width = fullWidth - margin.left - margin.right;
const height = fullHeight - margin.top - margin.bottom;

var svg = d3.select("#content")
        .append("svg")
        .attr("id", "mainSvg")
        .attr("width", fullWidth)
        .attr("height", fullHeight);

var gAll = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

var gAll2 = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

var x_scale_g = [330, width/2, width-200]

var scale_y_l1 = d3.scalePoint()
		.domain(level1_data.map(d => d.name))
		.range([0, height]);

var scale_y_l2 = d3.scalePoint()
		.domain(level2_data.map(d => d.name))
		.range([0, height]);

var scale_y_l3 = d3.scalePoint()
		.domain(level3_data.map(d => d.name))
		.range([0, height]);

var scales = [scale_y_l1, scale_y_l2, scale_y_l3];
var tooltip = d3.select("#controls");

var nodes_g = gAll.selectAll("circle")
		.data(levels_data)
		.enter()
		.append("circle")
		.attr('cx', d => x_scale_g[d.level])
		.attr('cy', d => scales[d.level](d.name))
		.attr('r', d => d.level==1?3:10)
		.style('fill', d=>node_colors[d.type])
		.style('stroke', "black")
		.style('stroke-width', 2);

var labels_g = gAll.selectAll("text")
		.data(levels_data)
		.enter()
		.append("text")
		.text(d => d.name)
		.attr('x', d => d.level==0?x_scale_g[d.level]-350:x_scale_g[d.level]+20)
		.attr('y', d => scales[d.level](d.name))
		.attr('font-size', d => d.level==1?14:16)
		.attr("dominant-baseline", "central");



svg.append('text')
	.text(levels[0])
	.attr('x', x_scale_g[0])
	.attr('y', height+45)
	.attr('text-anchor','middle')
	.attr('font-weight', 'bold');

svg.append('text')
	.text(levels[1])
	.attr('x', fullWidth/2)
	.attr('y', height+45)
	.attr('text-anchor','middle')
	.attr('font-weight', 'bold');

svg.append('text')
	.text(levels[2])
	.attr('x', x_scale_g[2])
	.attr('y', height+45)
	.attr('text-anchor','middle')
	.attr('font-weight', 'bold');

var edge_types = [
	'Event.Invest',
	'Event.Transaction',
	'Event.Fishing.OverFishing',
	'Event.Fishing',
	'Event.Fishing.SustainableFishing',
	'Event.Aid',
	'Event.CertificateIssued.Summons',
	'Event.Communication.Conference',
	'Event.Criticize',
	'Event.Applaud',
	'Event.CertificateIssued',
	'Event.Owns.PartiallyOwns',
	'Event.Convicted '
];


var edge_colors = {
	'Event.Fishing.OverFishing':'#F2003C',
	'Event.CertificateIssued':'#9966CC',
	'Event.CertificateIssued.Summons':'#ED2839',
	'Event.Criticize':'#C71585',
	'Event.Convicted' :'#65000B',
	'Event.Aid':'#00FFBF',
	'Event.Fishing.SustainableFishing':'#4CBB17',
	'Event.Applaud':'#8A9A5B',
	'Event.Invest':'#D1E231',
	'Event.Fishing':'#007FFF',
	'Event.Transaction':'#0FFFFF',
	'Event.Communication.Conference':'#00CCFF',
	'Event.Owns.PartiallyOwns':'#0D98BA',
};

var node_type_level = {
	'Entity.Organization.GovernmentOrg':0,
	'Entity.Organization.NGO':0,
	'Entity.Person':0,
	'Entity.Organization.FishingCompany':1,
	'Entity.Organization.LogisticsCompany':1,
	'Entity.Organization.Company':1,
	'Entity.Location.Region':2,
	'Entity.Organization':2,
	'Entity.Commodity':2,
}

node_type_level = {}
for (let i = 0; i<levels_data.length; i++){
	node_type_level[levels_data[i]['name']] = levels_data[i]['level'];
}

var markerBoxWidth = 2.5;
var markerBoxHeight = 2.5;
var refX = markerBoxWidth / 2;
var refY = markerBoxHeight / 2;
var markerWidth = markerBoxWidth / 10;
var markerHeight = markerBoxHeight / 10;
var arrowPoints = [[0, 0], [0, 2.5], [2.5, 1.75]];

console.log(edges);

svg
    .append('defs')
    .append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', [0, 0, markerBoxWidth, markerBoxHeight])
    .attr('refX', refX)
    .attr('refY', refY)
    .attr('markerWidth', markerBoxWidth)
    .attr('markerHeight', markerBoxHeight)
    .attr('orient', 'auto-start-reverse')
    .append('path')
    .attr('d', d3.line()(arrowPoints))
    .attr('stroke', 'black');


var edges_g =  gAll.selectAll('path')
  	.data(edges)
  	.enter()
    	.append('path')
    	.attr('d',function (d){
    		return d3.line()([
	    	[x_scale_g[node_type_level[d.source]], scales[node_type_level[d.source]](d.source)],
	    	[x_scale_g[node_type_level[d.target]], scales[node_type_level[d.target]](d.target)]
    	])})
    	.attr('stroke', d => edge_colors[d.type])
    	.attr('stroke-width', 4)
    	.attr('marker-end', 'url(#arrow)')
    	.on("click", function (event, d) {
		tooltip.html('<p>' + d['_algorithm'] + '<br>' + d['_last_edited_by']+ '<br>'+d['_articleid']+ '</p>');
	});


var uniq = [...new Set(edges.map(d => d.type))];
let i = 0
var edges_labels =  gAll2.selectAll('text')
  	.data(uniq)
  	.enter()
    	.append('text')
    	.attr('class', 'edg_label')
    	.attr('x', function(d){
    		i = ++i;
    		return i*300;
    	})
    	.attr('y', -5)
    	.attr('fill', d => edge_colors[d])
    	.attr('font-size', 15)
    	.attr('font-weight', 'bold')
    	.attr('text-anchor', 'left')
    	.text(d => d);
    /*.attr('marker-start', 'url(#arrow)')
    
    .attr('fill', 'none');*/
