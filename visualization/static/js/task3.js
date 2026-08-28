const edge_category = {
    'Event.Invest': '#0600b5',
    'Event.Aid': '#0600b5',
    'Event.Fishing.SustainableFishing': '#0600b5',
    'Event.Fishing': '#0600b5',
    'Event.Applaud': '#0600b5',
    'Event.CertificateIssued': '#0600b5',
    'Event.Communication.Conference': '#0600b5',
    'Event.Transaction': '#db8102',
    'Event.Owns.PartiallyOwns': '#db8102',
    'Event.Fishing.OverFishing': '#cc0000',
    'Event.Criticize': '#cc0000',
    'Event.CertificateIssued.Summons': '#cc0000',
    'Event.Convicted': '#cc0000'
}

const journal_color = {
	'The News Buoy': "#66c2a5",
	'Lomark Daily': "#fc8d62",
	'Haacklee Herald': "#e78ac3",
	'Port Grove Police Reports': "#8da0cb",
	'South Paackland Police Reports': "#a6d854",
 	'Paackland Police Reports': "#ffd92f",
 	'Himark Police Reports': "#e5c494",
 	'Centralia Police Reports': "#b3b3b3",
 	'Lomark Police Reports': '#89ebfa',
 	'Police Report': '#ffd92f'
}

const journals = ['The News Buoy','Lomark Daily','Haacklee Herald','Port Grove Police Reports','South Paackland Police Reports',
 	'Paackland Police Reports','Himark Police Reports','Centralia Police Reports','Lomark Police Reports', 'Police Report']

const algorithm_color = {
	"ShadGPT": "#76b7b2",
	"BassLine": "#59a14f",
	"OwnExtraction": "#b57fdb"
}

var colors = ["#8dd3c7","#7a1fdb","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69",
			"#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f", "#bd0259", "#3b0600"]

var company_map = {};
for(let i = 0; i<companies.length; i++){
	company_map[companies[i]] = i;
}

var analyst_map = {};
var analyst_color = {};

var element = d3.select('#comparison');

var xScale;
var yScale;

for(let i = 0; i<analysts.length; i++){
	analyst_map[analysts[i]] = i;
	analyst_color[analysts[i]] = colors[i];
	if (i == analysts.length - 1){
		continue;
	}

	var div = element.append('div')
		.attr('class', 'analyst_data')
		.attr('id', 'analyst_' + i);

	const fullWidth = div.node().clientWidth;
	const fullHeight = div.node().clientHeight;

	var svg = div.append('svg')
			.attr('width', fullWidth)
			.attr('height', fullHeight);

	const margin = {top: 10, left: 50, right: 25, bottom: 35};

	const g = svg.append("g")
		.attr('class', 'analyst_g')
    	.attr("transform", `translate(${margin.left},${margin.top})`);

	const width = fullWidth - margin.left - margin.right;
	const height = fullHeight - margin.top - margin.bottom;

	g.append('text')
		.attr('transform', 'translate(' + (-margin.left/2 - 10) +','+height/2 + ')rotate(-90)')
		.attr('font-size', '11px')
		.attr('text-anchor', 'middle')
		.text('Edge counts');

	g.append('text')
		.attr('transform', 'translate(' + (width/2) +','+(height + margin.bottom - 2) + ')')
		.attr('font-size', '12px')
		.attr('text-anchor', 'middle')
		.text('Companies');

	xScale = d3.scaleBand()
	    .domain(companies)
	    .range([0, width])
	    .padding(0.1);

	yScale = d3.scaleLinear()
		.domain([-50, 50])
		.range([height, 0]);

	g.append("g")
    	.call(d3.axisLeft(yScale).ticks(5));

    g.append("g")
    	.attr("transform", `translate(0,${height})`)
    	.call(d3.axisBottom(xScale))
    	.selectAll("text")
			.attr('font-size', '10px')
			.attr('color', d => 'black')
			.style("text-anchor", "end")
			.attr('transform', 'rotate(-45)')
			.text(d => d.substring(0, 2));

	var cmp = [];

	var c = positive[analysts[i]];

	for (const [key, value] of Object.entries(c)) {
		cmp.push({'name': key, 'value':value, 'type': 1});
	}

	c = negative[analysts[i]];

	for (const [key, value] of Object.entries(c)) {
		cmp.push({'name': key, 'value':value, 'type': 0});
	}

	var tooltip_name = d3.select("#tooltip_name");

	var rects = g.selectAll("rect")
           	.data(cmp)
           	.enter()
           	.append("rect")
			.attr("x", d => xScale(d.name))
			.attr("y", d => d.type == 0 ? yScale(0) : yScale(d.value))
			.attr("width", xScale.bandwidth())
			.attr("height", d => Math.abs(yScale(d.value) - yScale(0)))
			.attr('fill', d=> d.type == 1 ? 'blue':'red')
			.on("mouseover", function(event, d) {
				var x = event.clientX;
				var y = event.clientY;
				y = y + 10;
				tooltip_name.style("display", "block")
					.style("left", x + "px")
					.style("top", y + "px");
		
				tooltip_name.html(d.name);

			})
			.on("mouseout", function(event, d) {
				tooltip_name.style("display", "none");
			})

			.on("click", function(event, d) {
				d3.selectAll('rect.rect_hovered')
					.remove();

				d3.selectAll('.analyst_g')
					.append('rect')
					.attr('class', 'rect_hovered')
					.attr('x', xScale(d.name))
					.attr('y', 0)
					.attr('width', xScale.bandwidth())
					.attr('height', height)
					.attr('fill', 'transparent')
					.attr('stroke', '#d9d9d9')
					.attr('stroke-width', '1px')

				var a = plot_detail(d.name);
				plot_stats(d.name, a);
			})

	g.append("text")
    	.attr("x", width/2)
    	.attr("y", 3)
    	.attr("text-anchor", "middle")
    	.style("font-size", "13px")
    	.text("Edges added by " + analysts[i]);

    g.append("line")
           .attr("x1", 0)
           .attr("x2", width)
           .attr("y1", height/2)
           .attr("y2", height/2)
           .attr('stroke', '#d9d9d9')
           .attr('stroke-width', '1px');

    /*g.append("line")
           .attr("x1", 0)
           .attr("x2", width)
           .attr("y1", 0)
           .attr("y2", 0)
           .attr('stroke', '#d9d9d9')
           .attr('stroke-width', '1px');

    g.append("line")
           .attr("x1", width)
           .attr("x2", width)
           .attr("y1", 0)
           .attr("y2", height)
           .attr('stroke', '#d9d9d9')
           .attr('stroke-width', '1px');*/
}


function plot_detail(company){
	var e = d3.select('#detail');
	e.selectAll('svg').remove();

	var fw = e.node().clientWidth;
	var fh = e.node().clientHeight;

	const svg2 = e.append('svg')
		.attr('width', fw)
		.attr('height', fh);

	var margin2 = {top:30, bot:55, left: 55, right: 180};

	var height2 = fh - margin2.top - margin2.bot;
	var width2 = fw - margin2.left - margin2.right;

	const g2 = svg2.append("g")
		.attr('class', 'analyst_g')
    	.attr("transform", `translate(${margin2.left},${margin2.top})`);


	var x = d3.scalePoint()
		.domain(edge_types)
		.range([0, width2]);

	var y = d3.scaleLinear()
		.domain([0, 30])
		.range([height2, 0]);

	const line = d3.line()
            .x(d => x(d.type))
            .y(d => y(d.count));

	var curr_data = data.filter(d => (d.source == company)||(d.target == company ));

    g2.append("g")
    	.attr("transform", `translate(0,${height2})`)
    	.call(d3.axisBottom(x))
    	.selectAll("text")
               .attr('font-size', '9px')
               .attr('font-weight', 'bold')
               .attr('color', d => edge_category[d])
               .style("text-anchor", "end")
               .attr('transform', 'rotate(-10)')
               .text(d => d.substring(d.lastIndexOf('.') + 1));

    for (let j = 0; j < edge_types.length; j++){
    	g2.append("line")
           .attr("x1", x(edge_types[j]))
           .attr("x2", x(edge_types[j]))
           .attr("y1", 0)
           .attr("y2", height2)
           .attr('stroke', '#d9d9d9')
           .attr('stroke-width', '1px')
           .attr("stroke-dasharray",'10');
    }

    var new_y = 0;
    var selectedAnalysts = []
    for (let j = 0; j<analysts.length; j++){
    	var temp_data = curr_data.filter(d=>d._last_edited_by == analysts[j]);

    	var c = [];

    	for (let k = 0; k < edge_types.length; k++){
    		c.push({
    			'analyst':analysts[j],
    			'type': edge_types[k],
    			'count': temp_data.filter(d=> d.type == edge_types[k]).length
    		})
    	}

    	var max_y = Math.max.apply(Math, c.map(function(o) { return o.count; }))
    	if (max_y >= new_y){
    		new_y = max_y;
    	}
    	if (max_y > 0){
    		selectedAnalysts.push(analysts[j]);
    	}
    }
    y.domain([0, new_y + 1]);
	for (let j = 0; j<selectedAnalysts.length; j++){
    	var temp_data = curr_data.filter(d=>d._last_edited_by == selectedAnalysts[j]);

    	var c = [];

    	for (let k = 0; k < edge_types.length; k++){
    		c.push({
    			'analyst':selectedAnalysts[j],
    			'type': edge_types[k],
    			'count': temp_data.filter(d=> d.type == edge_types[k]).length
    		})
    	}
    	g2.append("path")
            .datum(c)
            .attr('class', 'analyst_line')
            .attr('id', 'analyst_line_' + analyst_map[selectedAnalysts[j]])
            .attr("fill", "none")
            .attr("stroke", analyst_color[selectedAnalysts[j]])
            .attr("stroke-width", 2)
            .attr('opacity', 0.5)
            .attr("d", line);

        g2.append('circle')
        	.attr('cx', width2 + 15)
        	.attr('cy', 5 + 17*j)
        	.attr('r', 7)
        	.attr('fill', analyst_color[selectedAnalysts[j]])

        g2.append('text')
        	.attr('x', width2 + 25)
        	.attr('y', 5 + 17*j + 2)
        	.attr('font-size', '12px')
        	.text(selectedAnalysts[j])
        	.on("mouseover", function(event, d) {
        		d3.selectAll('.analyst_line')
        			.attr('opacity', 0.1);

				d3.select('#' + 'analyst_line_' + analyst_map[selectedAnalysts[j]])
					.attr('opacity', 1)
					.attr('stroke-width', 4);

			})
			.on("mouseout", function(event, d) {
				d3.selectAll('.analyst_line')
        			.attr('opacity', 0.6)
					.attr('stroke-width', 2);

				/*d3.select('#' + 'analyst_line_' + analyst_map[analysts[j]])
					.attr('opacity', 0.6)
					.attr('stroke-width', 2);*/
			})
    }

    g2.append("text")
    		.attr("x", width2/2)
    		.attr("y", -15)
    		.attr("text-anchor", "middle")
    		.style("font-size", "12px")
    		.text("Edges added to company " + company);

   	g2.append('text')
		.attr('transform', 'translate(' + (-margin2.left/2 - 10) +','+height2/2 + ')rotate(-90)')
		.attr('font-size', '13px')
		.attr('text-anchor', 'middle')
		.text('Edge counts');

	g2.append('text')
		.attr('transform', 'translate(' + (width2/2) +','+(height2 + margin2.bot - 10) + ')')
		.attr('font-size', '12px')
		.attr('text-anchor', 'middle')
		.text('Type');

    g2.append("g")
    	.call(d3.axisLeft(y).ticks(5));

    return selectedAnalysts;
}

function plot_stats(company=null, selAnalysts=null){
	var e = d3.select('#detail2');
		e.selectAll('svg').remove();

	var fw = e.node().clientWidth;
	var fh = e.node().clientHeight;

	var filtered_data = data.slice();
	if (company){
		filtered_data = filtered_data.filter(d=> (d.source == company)||(d.target == company));
	}
	if (!selAnalysts){
		selAnalysts = analysts;
	}

	console.log(filtered_data);

	// Set dimensions and radius
	const width = 60;
	const height = 60;
	const radius = Math.min(width, height) / 2;

	const svg3 = e.append('svg')
		.attr('width', fw)
		.attr('height', height*selAnalysts.length + 30 + 5*selAnalysts.length);

	svg3.append('text')
		.attr('x', 50)
		.attr('y', 20)
		.attr('font-size', '12px')
		.attr('font-weight', 'bold')
		.text('Analyst')

	svg3.append('text')
		.attr('x', 210)
		.attr('y', 20)
		.attr('font-size', '12px')
		.attr('font-weight', 'bold')
		.text('Algorithms used')

	svg3.append('text')
		.attr('x', 425)
		.attr('y', 20)
		.attr('font-size', '12px')
		.attr('font-weight', 'bold')
		.text('News sources consulted')

	for (let i = 0; i < selAnalysts.length; i++){
		var temp_data = filtered_data.filter(d=> d._last_edited_by == selAnalysts[i]);
		var ShadGPT = temp_data.filter( d=> d._algorithm == 'ShadGPT').length;
		var BassLine = temp_data.filter( d=> d._algorithm == 'BassLine').length;
		var OwnExtraction = temp_data.filter( d=> d._algorithm == 'OwnExtraction').length;
		var p_data = [];
		if (ShadGPT > 0){
			p_data.push({name: 'ShadGPT', value: ShadGPT});
		}
		if (BassLine > 0){
            p_data.push({name: 'BassLine', value: BassLine});
		}
		if (OwnExtraction > 0){
            p_data.push({name: 'OwnExtraction', value: OwnExtraction});
		}

		var p_data2 = [];
		for(let k = 0; k<journals.length; k++){
			var tdata = temp_data.filter(d=> d._raw_source == journals[k]).length;
			if (tdata > 0){
				p_data2.push({name: journals[k], value:tdata});
			}
		}

		var g3 = svg3
            .append("g")
            .attr("transform", `translate(${(width / 2) + 225},${((height / 2) + ((height+5)*i) + 30)})`);

        var g4 = svg3
            .append("g")
            .attr("transform", `translate(${(width / 2) + 475},${((height / 2) + ((height+5)*i) + 30)})`);

        // Create the pie generator
        var pie = d3.pie()
            .value(d => d.value);

        // Create the arc generator
        var arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        // Append the arcs
        g3.selectAll('path')
            .data(pie(p_data))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => algorithm_color[d.data.name])
            .attr('stroke', 'white')
            .attr('stroke-width', '2px');

        // Append text labels
        /*g3.selectAll('text')
            .data(pie(p_data))
            .enter()
            .append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('dy', '0.35em')
            .attr('font-size', '8px')
            .attr('text-anchor', 'middle')
            .text(d => d.data.name)
            .style('fill', 'black');*/

        var total_p_data = p_data.map(d=>d.value).reduce((partialSum, a) => partialSum + a, 0);

        for (let k = 0; k < p_data.length; k++){
        	g3.append('circle')
        		.attr('cx', height/2 + 15)
        		.attr('cy', -width/2 + k*20  + 10)
        		.attr('r', 5)
        		.attr('fill', algorithm_color[p_data[k].name]);

        	g3.append('text')
        		.attr('x', height/2 + 15 + 10)
        		.attr('y', -width/2 + k*20  + 13)
        		.attr('font-size', '10px')
        		.text(p_data[k].name + ' (' + ((p_data[k].value/total_p_data)*100).toFixed(2) + '%)');
        }

        // Append the arcs
        g4.selectAll('path')
            .data(pie(p_data2))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => journal_color[d.data.name])
            .attr('stroke', 'white')
            .attr('stroke-width', '2px');

        // Append text labels
        /*g4.selectAll('text')
            .data(pie(p_data2))
            .enter()
            .append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('dy', '0.35em')
            .attr('font-size', '8px')
            .attr('text-anchor', 'middle')
            .text(d => d.data.name)
            .style('fill', 'black');*/

        var total_p_data2 = p_data2.map(d=>d.value).reduce((partialSum, a) => partialSum + a, 0);

        for (let k = 0; k < p_data2.length; k++){
        	g4.append('circle')
        		.attr('cx', height/2 + 15)
        		.attr('cy', -width/2 + k*12  + 5)
        		.attr('r', 5)
        		.attr('fill', journal_color[p_data2[k].name]);

        	g4.append('text')
        		.attr('x', height/2 + 15 + 10)
        		.attr('y', -width/2 + k*12  + 7)
        		.attr('font-size', '10px')
        		.text(p_data2[k].name + ' (' + ((p_data2[k].value/total_p_data2)*100).toFixed(2) + '%)');
        }
        g3.append('text')
        	.attr('x', -200)
        	.attr('y', 5)
        	.attr('font-size', '12px')
        	.text(selAnalysts[i]);
	}
	
}

// plot_stats();