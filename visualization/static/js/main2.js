const margin = {top:20, left:80, right:100, bottom:20};
const width = fullWidth - margin.left - margin.right;
const height = fullHeight - margin.top - margin.bottom;

var svg = d3.select("#content")
        .append("svg")
        .attr("id", "mainSvg")
        .attr("width", fullWidth)
        .attr("height", fullHeight);

var markerBoxWidth = 5;
var markerBoxHeight = 5;
var refX = markerBoxWidth / 2;
var refY = markerBoxHeight / 2;
var markerWidth = markerBoxWidth / 2;
var markerHeight = markerBoxHeight / 2;
var arrowPoints = [[0, 0], [0, 5], [5, 2.5]];

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

var gNodesOuter = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

var gNodesInner = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

var gLabels = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

var gEdges = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

var node_x = [0,(width/9)*1,(width/9)*2,(width/9)*3,(width/9)*4,(width/9)*5,(width/9)*6,(width/9)*7,(width/9)*8, width,
			width, width, width, width, width, width, width,
			width, (width/9)*8, (width/9)*7, (width/9)*6, (width/9)*5, (width/9)*4, (width/9)*3, (width/9)*2, (width/9)*1, 0,
			0, 0, 0, 0, 0, 0, 0];

var node_y = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			(height/8)*1,(height/8)*2,(height/8)*3,(height/8)*4,(height/8)*5,(height/8)*6,(height/8)*7,
			height, height, height, height, height, height, height, height, height, height,
			(height/8)*7,(height/8)*6,(height/8)*5,(height/8)*4,(height/8)*3,(height/8)*2,(height/8)*1];

const positions = generateCirclePositions(nodes_inner.length, width, height);

var x_pos = {}
var y_pos = {}
for (let i = 0; i<nodes_outer.length; i++){
	x_pos[nodes_outer[i].name]=node_x[i];
	y_pos[nodes_outer[i].name]=node_y[i];
}

for (let i = 0; i<nodes_inner.length; i++){
	x_pos[nodes_inner[i].name] = positions[i]['x'];
	y_pos[nodes_inner[i].name] = positions[i]['y'];
}

var nodes_g = gNodesOuter.selectAll("circle")
		.data(nodes_outer)
		.enter()
		.append("circle")
		.attr('cx', (i,d) => node_x[d])
		.attr('cy', (i,d) => node_y[d])
		.attr('r', 7)
		.style('fill', d=>node_colors[d.type])
		.style('stroke', "black")
		.style('stroke-width', 1)
		.on("mouseover", function (event, d) {
            var x = event.clientX;
            var y = event.clientY;
            /*x = x - 40;
            y = y - 60;*/

            tooltip.style("display", "block");
            tooltip.html('<p> Name: ' + d.name + '<br> Type: ' +d.type+ '</p>')
                .style("left", x + "px")
                .style("top", y + "px");
        })
        .on("mouseout", function (d) {
            tooltip.style("display", "none");
        });

var nodes_labels = gLabels.selectAll("text")
		.data(nodes_outer)
		.enter()
		.append("text")
		.text(d=>d.name)
		.attr('x', (i,d) => (node_x[d] + label_x[d]))
		.attr('y', (i,d) => (node_y[d] + label_y[d]))
		.attr('font-size', '11px')
		.attr('text-anchor', (i,d) => text_style[d]);

//console.log('x');
//console.log(nodes_outer);
//console.log(nodes_inner);

// console.log(positions);

var tooltip = d3.select("#tooltip");

var nodesi_g = gNodesInner.selectAll("circle")
		.data(nodes_inner)
		.enter()
		.append("circle")
		.attr('cx', (i,d) => positions[d]['x'])
		.attr('cy', (i,d) => positions[d]['y'])
		.attr('r', 5)
		.style('fill', d=>node_colors[d.type])
		.style('stroke', "black")
		.style('stroke-width', 1)
		.on("mouseover", function (event, d) {
            var x = event.clientX;
            var y = event.clientY;
            /*x = x - 40;
            y = y - 60;*/

            tooltip.style("display", "block");
            tooltip.html('<p> Name: ' + d.name + '<br> Type: ' +d.type+ '</p>')
                .style("left", x + "px")
                .style("top", y + "px");
        })
        .on("mouseout", function (d) {
            tooltip.style("display", "none");
        });

function plot_edges(edg){
	gEdges.selectAll("path").remove();
	var edges_g =  gEdges.selectAll('path')
		.data(edg)
  		.enter()
    	.append('path')
    	.attr('d',function (d){
    		return d3.line()([
	    	[x_pos[d.source], y_pos[d.source]],
	    	[x_pos[d.target], y_pos[d.target]]
    	])})
    	.attr('stroke', d => edge_colors[d.type])
    	.attr('opacity', 0.8)
    	.attr('stroke-width', 2)
    	.attr('marker-end', "url(#arrow)");
}

function get_filters(){
	const selectedValue = document.getElementById("edge_agg").value;
	const selectedAlg = document.getElementById("alg_used").value;
	const selectedHuman = document.getElementById("human_reviewer").value;
	var edge_types = [];
	var companies = [];
	for(let i = 1; i<14; i++){
		var name = 'check'+i;
		var ck = document.getElementById(name);
		if (ck.checked){
			edge_types.push(ck.value)
		}
	}
	for(let i = 0; i<nodes_inner.length; i++){
		var name = nodes_inner[i].name;
		var ck = document.getElementById(name);
		if (ck.checked){
			companies.push(ck.value)
		}
	}
	return JSON.stringify({ edge_agg: selectedValue, edge_types:edge_types,
		human_reviewer:selectedHuman,alg_used:selectedAlg, companies:companies})
}

document.getElementById("filter_button").addEventListener("click", function() {
    $.ajax({
        url: "http://127.0.0.1:5000/filter",
        type: "POST",
        contentType: "application/json",
        data: get_filters(),
        success: function(response) {
            plot_edges(response);
        }
    });
});

