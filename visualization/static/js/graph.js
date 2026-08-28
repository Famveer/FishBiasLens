console.log('transactions');
console.log(transactions);
console.log(data_felipe);
console.log(data);
const journal_color = {
	'The News Buoy': "#66c2a5",
	'Lomark Daily': "#fc8d62",
	'Haacklee Herald': "#e78ac3"
}

const journal_color2 = {
	'The News Buoy': "#66c2a5",
	'Lomark Daily': "#fc8d62",
	'Haacklee Herald': "#e78ac3",
	'None': '#a6a6a6'
}

const edge_category = {
    'Event.Invest': '#799FCB',
    'Event.Aid': '#799FCB',
    'Event.Fishing.SustainableFishing': '#799FCB',
    'Event.Fishing': '#799FCB',
    'Event.Applaud': '#799FCB',
    'Event.CertificateIssued': '#799FCB',
    'Event.Communication.Conference': '#799FCB',
    'Event.Transaction': '#db8102',
    'Event.Owns.PartiallyOwns': '#db8102',
    'Event.Fishing.OverFishing': '#F9665E',
    'Event.Criticize': '#F9665E',
    'Event.CertificateIssued.Summons': '#F9665E',
    'Event.Convicted': '#F9665E'
}

// Types to exclude
const set2 = ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3"]
const excludedTypes = [
	'Event.Communication.Conference',
	'Event.Transaction',
    'Event.Owns.PartiallyOwns'
];

var nodeMap = {};
// List of clicked nodes
let clickedNodes = [];
let clickedIds = [];
// Const for line chart
const parseDate = d3.timeParse("%Y-%m-%d");
const formatWeekStart = d3.timeFormat("%Y-%m-%d");  

for(let i = 0; i < timesteps.length; i++){
	timesteps[i] = parseDate(timesteps[i]);
}
data.forEach(d => {
    d._date = parseDate(d._date);
});
var tooltip = d3.select("#tooltip");
var tooltip_title = d3.select("#tooltip_title");
var tooltip_body = d3.select("#tooltip_body");

function plot_nodes(positions){
	tooltip.style("display", "none");
	console.log('start');
	console.log(positions);

	var individualScores = {};
	positions.forEach(position => {
	    const companyName = position.name;

    	// Filter data where source or target matches the company name and type is not in excludedTypes
    	const filteredData = data.filter(d => 
	        (d.source === companyName || d.target === companyName) &&
        	!excludedTypes.includes(d.type)
	    );

    	var tempArray = [];
    	individualScores[companyName] = {};
    	journals.forEach(j => {
	    	const pos = filteredData.filter(d=> (d._journal == j)&&(d._weight > 0));
    		const neg = filteredData.filter(d=> (d._journal == j)&&(d._weight < 0));
    		individualScores[companyName][j] = {};
    		individualScores[companyName][j]['pos']=pos.length;
    		individualScores[companyName][j]['neg']=neg.length;
    	});
	});


// Set up the SVG canvas dimensions
const element = d3.select('#graph');
element.selectAll('svg').remove();

const fullWidth = element.node().clientWidth;
const fullHeight = element.node().clientHeight;

const width = fullWidth;
const height = fullHeight;

const xScale = d3.scaleLinear()
	.domain([d3.min(positions, d => d.x), d3.max(positions, d => d.x)])
	.range([90, width - 50]);

const yScale = d3.scaleLinear()
	.domain([d3.min(positions, d => d.y), d3.max(positions, d => d.y)])
	.range([height - 20, 35 ]);

// Create the SVG element
const svg = d3.select("#graph")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

// Create a map to find node positions by name
nodeMap = {};
positions.forEach(d => {
	nodeMap[d.name] = d;
});

// Initialize the result dictionary
const companies_j = {};
const companies_m = {};

// Iterate over each company in positions
positions.forEach(position => {
    const companyName = position.name;

    // Filter data where source or target matches the company name and type is not in excludedTypes
    const filteredData = data.filter(d => 
        (d.source === companyName || d.target === companyName) &&
        !excludedTypes.includes(d.type)
    );

    if (filteredData.length === 0) {
        companies_j[companyName] = "None";
        return;
    }

        // Aggregate weight by journal
    const journalWeights = filteredData.reduce((acc, curr) => {
        const journal = curr._journal;
        if (!acc[journal]) {
            acc[journal] = 0;
        }
        acc[journal] += curr._weight;
        return acc;
    }, {});

    // Find the journal with the maximum weight
    const maxJournal = Object.keys(journalWeights).reduce((max, journal) => {
        return journalWeights[journal] > (journalWeights[max] || -Infinity) ? journal : max;
    }, "");

   	// Find the journal with the maximum weight
    const maxScore = Object.keys(journalWeights).reduce((max, journal) => {
        return journalWeights[journal] > (max || -Infinity) ? journalWeights[journal] : max;
    }, "");

    companies_j[companyName] = maxJournal || "None";
    companies_m[companyName] = maxScore || "None";
});


// timesteps.forEach(d => {parseDate(d);});
// Extract all dates from the data



const june7 = parseDate("2035-06-03");
const timeStart = parseDate("2035-01-21");
const timeEnd = parseDate("2035-08-05");
const dates = data.map(d => d._date);

// Generate all possible weeks from the timesteps array
const weeks = [];

// Get all unique weeks
let currentWeek = d3.timeWeek.floor(d3.min(dates));

while (currentWeek <= d3.max(dates)) {
    weeks.push(currentWeek);
    currentWeek = d3.timeWeek.offset(currentWeek, 1);
}

const weekRange = d3.extent([timeStart, timeEnd]);

const edgeColor = ['#f5f100', '#f5b505', '#fc7303', '#fc4108', '#ff0400']

// Add labels to nodes
svg.selectAll(".label")
	.data(positions)
	.enter()
	.append("text")
	.attr('id', d=>'label_'+d.id)
	.attr("x", d => xScale(d.x))
	.attr("y", d => yScale(d.y) - 20)
	.attr('font-size', '8px')
	.attr("class", "label")
	.attr('text-anchor', 'middle')
	.text(d => d.name);


// Draw nodes (rectangles)
const r_width = 70;
const r_height = 30;
svg.selectAll("circle")
	.data(positions)
	.enter()
	.append("circle")
	.attr('id', d => 'circle_' + d.id)
	.attr("cx", d => xScale(d.x))
	.attr("cy", d => yScale(d.y))
	.attr('r', 10)
	.attr("class", "node")
	.attr("fill", d => journal_color2[companies_j[d.name]])
	.attr("stroke", "black")
	.attr("stroke-dasharray", function(d){
		if (companies_m[d.name] >= 0){
			return '0';
		}
		else{
			return '4';
		}
	})
	.attr("stroke-width", "1px")
	.attr("opacity", 0.6)
	.on("click", function(event, d) {
		const index = clickedNodes.indexOf(d.name);
		if (index === -1) {
			var selAlgorithm = document.getElementById("algorithm_select").value;
			// Node is not in the clicked list, add it and draw its edges
			clickedNodes.push(d.name);
			clickedIds.push(d.id);
			d3.select(this)
				.attr("stroke", "#e00000")
				.attr("stroke-width", "4px");
			add_timeline(d, selAlgorithm);

		} else {
			// Node is already in the clicked list, remove it and its edges
			clickedNodes.splice(index, 1);
			const index2 = clickedIds.indexOf(d.id);
			clickedIds.splice(index2, 1);
			d3.select(this)
				.attr("stroke", "black")
				.attr("stroke-width", "1px");
			remove_timeline(d.id);
		}

	})
	.on("mouseover", function(event, d) {
		console.log('mouse entered on ', d.name)
		tooltip_body.selectAll('svg').remove();
		// Show edges connected to this node if not already clicked
		/*var c1 = transactions.filter(t => t.node1 == d.name);
		var c2 = transactions.filter(t => t.node2 == d.name);
		c1 = c1.map(d => [d.node2, d.count]);
		c2 = c2.map(d => [d.node1, d.count]);
		var c = c1.concat(c2);
		for (let i = 0; i<c.length; i++){
			connectedNodes.push({'name': c[i][0], 'count':c[i][1]});
		}*/

		var c = transactions[d.name];
		var connectedNodes = [];
		if (c){
			for (const [key, value] of Object.entries(c)) {
  				connectedNodes.push({'name': key, 'count':value});
			}	
		}
		

		var x = event.clientX;
		var y = event.clientY;
		var new_x;
		var new_y
		if (y < 160){
			new_y = y + 25;	
		}
		else{
			new_y = y - 155;
		}
		x = x - 65;
		

		tooltip.style("display", "block")
			.style("left", x + "px")
			.style("top", new_y + "px");
		
		tooltip_title.html(d.name);

		svg.selectAll(".hover-edge").remove();
		svg.selectAll(".hover-edge")
			.data(connectedNodes)
			.enter()
			.append("circle")
			.attr("class", "hover-edge")
			.attr("cx", t => xScale(nodeMap[t.name].x))
			.attr("cy", t => yScale(nodeMap[t.name].y))
			.attr('r', 12)
			.attr("fill", d => "transparent")
			.attr("stroke", t => "red")
			.attr("stroke-width", t => t.count*1.25)
		
		d3.select("#label_"+d.id)
			.attr('font-size', '0px');

		var selectedScores = individualScores[d.name];
		var scores = [];
		scores.push({'journal': 'The News Buoy', 'score': selectedScores['The News Buoy']['pos']});
		scores.push({'journal': 'The News Buoy', 'score': -selectedScores['The News Buoy']['neg']});
		scores.push({'journal': 'Lomark Daily', 'score': selectedScores['Lomark Daily']['pos']});
		scores.push({'journal': 'Lomark Daily', 'score': -selectedScores['Lomark Daily']['neg']});
		scores.push({'journal': 'Haacklee Herald', 'score': selectedScores['Haacklee Herald']['pos']});
		scores.push({'journal': 'Haacklee Herald', 'score': -selectedScores['Haacklee Herald']['neg']});



		const fw3 = tooltip_body.node().clientWidth;
		const fh3 = tooltip_body.node().clientHeight;

		const margin3 = { top: 15, right: 15, bottom: 10, left: 30 },
              width3 = fw3 - margin3.left - margin3.right,
              height3 = fh3 - margin3.top - margin3.bottom;

        const svg3 = tooltip_body
        			.append('svg')
					.attr("width", width3 + margin3.left + margin3.right)
					.attr("height", height3 + margin3.top + margin3.bottom)
					.append("g")
					.attr("transform", `translate(${margin3.left},${margin3.top})`);

        const x3 = d3.scaleBand()
                    .domain(scores.map(d => d.journal))
                    .range([0, width3])
                    .padding(0.1);

        const y3 = d3.scaleLinear()
                    .domain([d3.min(scores, d => d.score), d3.max(scores, d => d.score)])
                    .range([height3, 0]);

        svg3.append("g")
           .selectAll(".bar")
           .data(scores)
           .enter().append("rect")
             .attr("x", d => x3(d.journal))
             .attr("y", d => d.score < 0 ? y3(0) : y3(d.score))
             .attr("width", x3.bandwidth() / 2)
             .attr("height", d => Math.abs(y3(d.score) - y3(0)))
             .attr('fill', d=>journal_color[d.journal]);
             // .attr("transform", (d, i) => `translate(${(i % 2 === 1 ? x3.bandwidth() / 2 : 0)}, 0)`);

        /*svg3.append("g")
           .attr("class", "x axis")
           .attr("transform", `translate(0,${y3(0)})`)
           .call(d3.axisBottom(x3));*/

        svg3.append("g")
           .attr("class", "y axis")
           .call(d3.axisLeft(y3).ticks(3));

        svg3.append("line")
           .attr("x1", 0)
           .attr("x2", width3)
           .attr("y1", y3(0))
           .attr("y2", y3(0))
           .attr('stroke', 'black');

	})
	.on("mouseout", function(event, d) {
		// Remove hover edges if the node is not clicked
		svg.selectAll(".hover-edge").remove();
		d3.select("#label_"+d.id)
			.attr('font-size', '8px');

		tooltip.style("display", "none");
	});

// add timeline on click
function add_timeline(obj, filter1='Both', split=false){
	var symbol = d3.symbol();
	var symbols = {
		'The News Buoy': d3.symbolCross,
		'Lomark Daily': d3.symbolStar,
		'Haacklee Herald': d3.symbolTriangle
	}
	const div = d3.select('#timeline_container')
		.append('div')
		.attr('class', 'journal_container')
		.attr('id', 'jc_'+ obj.id);

	div.append('div')
		.attr('class', 'timeline')
		.attr('id', 'timeline_'+ obj.id);

	div.append('div')
		.attr('class', 'barchart')
		.attr('id', 'barchart_'+ obj.id);

	var filtered_data = data.filter(d => ((d.source == obj.name) || (d.target == obj.name)) && (d._weight != 0) );
	if (filter1 != 'Both'){
		console.log('filter1', filter1);
		filtered_data = filtered_data.filter( d => d._algorithm == filter1);
	}
	if (filter1 == 'OwnExtraction'){
		console.log('filter1', filter1);
		filtered_data = data_felipe.filter( d => ((d.source == obj.name) || (d.target == obj.name)) && (d._weight != 0));
		filtered_data.forEach(d => {
    		d._date = parseDate("2035-07-29");
		});
	}
	if (filtered_data.length == 0){
		return 1;
	}
	const e = d3.select('#timeline_'+ obj.id);
	const e2 = d3.select('#barchart_'+ obj.id);
	console.log('datos filtrados', filter1);
	console.log(filtered_data);

	const fw = e.node().clientWidth;
	const fh = e.node().clientHeight;
	const fw2 = e2.node().clientWidth;
	const fh2 = e2.node().clientHeight;

	const margin = {top:25, bot:40, left:40, right:150};
	const margin2 = {top:25, bot:45, left:40, right:20};
	const w = fw - margin.left - margin.right;
	const h = fh - margin.top - margin.bot;
	const w2 = fw2 - margin2.left - margin2.right;
	const h2 = fh2 - margin2.top - margin2.bot;

	const svg2 = e.append('svg')
		.attr("width", fw)
		.attr("height", fh);

	const g = svg2.append("g")
    	.attr("transform", `translate(${margin.left},${margin.top})`);

    const svg3 = e2.append('svg')
		.attr("width", fw2)
		.attr("height", fh2);

	const g2 = svg3.append("g")
    	.attr("transform", `translate(${margin2.left},${margin2.top})`);

	const xScale2 = d3.scaleTime().domain(weekRange).range([0, w]);  // Adjust range as needed
	const yScale2 = d3.scaleLinear().domain([-20, 20]).range([h, 0]);

	// Add X axis
	g.append("g")
	    .attr("transform", `translate(0,${h})`)
	    .call(d3.axisBottom(xScale2).tickFormat(d3.timeFormat("%b-%d")).ticks(d3.timeWeek.every(2)));
	    //.call(d3.axisBottom(xScale2).tickFormat(d3.timeFormat("%m-%d")).ticks(d3.timeWeek.every(1)));

	// Add Y axis
	g.append("g")	    
	    .call(d3.axisLeft(yScale2).ticks(4));

	// Group data by journal using d3.group
	const groupedData = d3.group(filtered_data, d => d._journal);

	// Aggregate data by week within each journal
	const weeklyData = new Map();
	groupedData.forEach((journalData, journal) => {
	    // Roll up the data by week
	    const journalWeeklyData = d3.rollup(journalData, v =>
	        v.filter(a => a._weight < 0).length,
	        d => {
	            const startOfWeek = d3.timeWeek.floor(d._date);
	            return formatWeekStart(startOfWeek);  // Format week start date
	        }
	    );

    	var array = Array.from(journalWeeklyData, ([name, value]) => ({ week: name, value }));
    	array = array.filter(d=>d.value !=0);
    	array.forEach(d => {
    		d.week = parseDate(d.week);
    		d.value = -d.value;
		});
		const journalWeeklyData2 = d3.rollup(journalData, v =>
	        v.filter(a => a._weight > 0).length,
	        d => {
	            const startOfWeek = d3.timeWeek.floor(d._date);
	            return formatWeekStart(startOfWeek);  // Format week start date
	        }
	    );

    	var array2 = Array.from(journalWeeklyData2, ([name, value]) => ({ week: name, value }));
    	console.log('array2');
    	console.log(array2);
    	array2 = array2.filter(d=>d.value !=0);
    	array2.forEach(d => {
    		d.week = parseDate(d.week);
		});
		console.log('array2');
    	console.log(array2);
	    weeklyData.set(journal, array.concat(array2));
	});
	console.log('groupedData');
	console.log(groupedData);
	console.log('weeklyData');
	console.log(weeklyData);
	g.append("line")
    	.attr("x1", xScale2(june7))
		.attr("x2", xScale2(june7))
		.attr("y1", 0)
		.attr("y2", h)
		.attr("stroke", "red")
		.attr("opacity", 0.5)
		.attr("stroke-width", 2.0)
		.attr("stroke-dasharray", "4");

	g.append("line")
    	.attr("x1", xScale2(timeStart))
		.attr("x2", xScale2(timeEnd))
		.attr("y1", yScale2(0))
		.attr("y2", yScale2(0))
		.attr("stroke", "black")
		.attr("stroke-width", 1)
		.attr("stroke-dasharray", "4");

	g.append("text")
		.attr('x', w/2)
		.attr('y', h + margin.bot - 5)
		.text('Weeks')
		.style("font-size", "13px")
        .style("fill", "black")

    g.append('text')
		.attr('transform', 'translate(' + (-margin.left/2 - 7) +','+h/2 + ')rotate(-90)')
		.attr('font-size', '13px')
		.attr('text-anchor', 'middle')
		.text('Weighted edge sum');

    // Add circles for each journal
	journals.forEach((journal, i) => {
    	const dataTemp = weeklyData.get(journal);
    	console.log('data', journal)
    	console.log(dataTemp);
    	if (!dataTemp){
    		return;
    	}

    	const g_journal = svg2.append("g")
    		.attr("transform", `translate(${margin.left},${margin.top})`);

    	/*g_journal.selectAll("circle")
    		.data(dataTemp)
    		.enter()
    		.append("circle")
        	.attr('cx', d => xScale2(d.week))
        	.attr('cy', d => yScale2(d.value))
        	.attr('r', 5)
        	.style("fill", journal_color[journal])
        	.style("stroke-width", 1);*/

        g_journal.selectAll(".dots")
    		.data(dataTemp)
    		.enter()
    		.append("path")
    		.attr("class", "dot")
        	.attr("d", symbol.type(symbols[journal]))
        	.attr('stroke',journal_color[journal])
    		.attr('transform',function(d){ return "translate("+xScale2(d.week)+","+yScale2(d.value)+")"; })
        	.style("fill", journal_color[journal])
        	.style("opacity", 0.6)

        // Add legend
    	/*g.append("rect")
        	.attr("x", w - 100)
        	.attr("y",  i * 15 - 5)
        	.attr("width", 10)
        	.attr("height", 10)
        	.style("fill", journal_color[journal]);*/

        g_journal.append("path")
    		.attr("class", "dot")
        	.attr("d", symbol.type(symbols[journal]))
        	.attr('stroke',journal_color[journal])
    		.attr('transform',function(d){ return "translate("+(w + 10) +","+(i * 15 - 2)+")"; })
        	.style("fill", journal_color[journal])
        	.style("opacity", 1)

    	g.append("text")
	        .attr("x", w + 20)
        	.attr("y", i * 15 )
        	.text(journal)
        	.style("font-size", "11px")
        	.style("fill", "black");
		});	

	g.append("text")
	        .attr("x", w + 20)
        	.attr("y", 3 * 15 )
        	.text('SouthSeafood exposed')
        	.style("font-size", "11px")
        	.style("fill", "black");

    g.append("text")
	        .attr("x", w + 35)
        	.attr("y", -15 )
        	.text('Journals')
        	.style("font-size", "11px")
        	.style('font-weight','bold')
        	.style("fill", "black");

    g.append("line")
    	.attr("x1", w+5)
		.attr("x2", w+20)
		.attr("y1", 3*14)
		.attr("y2", 3*14)
		.attr("stroke", "red")
		.attr("opacity", 1)
		.attr("stroke-width", 2)
		.attr("stroke-dasharray", "4");

	// Add title
	g.append("text")
    	.attr("x", w/2)
    	.attr("y", -12)
    	.attr("text-anchor", "middle")
    	.style("font-size", "14px")
    	.text("Weighted edge sum over time per journal for " + obj.name);
    
	// Aggregate data by count
	var aggregatedData = d3.rollups(filtered_data, v => v.length, d => d.type, d => d._journal)
	    .map(([type, journals]) => ({
        	type,
        	journals: Object.fromEntries(journals)
    }));
	aggregatedData.sort(function(a, b) {
    	var textA = a.type.toUpperCase();
    	var textB = b.type.toUpperCase();
    	return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
	});

	const order = ['Event.Invest','Event.Aid','Event.Fishing.SustainableFishing','Event.Fishing','Event.Applaud','Event.CertificateIssued',
		'Event.Fishing.OverFishing','Event.Criticize','Event.CertificateIssued.Summons','Event.Convicted'];
	

	// X axis
	const x0 = d3.scaleBand()
	    .domain(order)
	    .range([0, w2])
	    .padding(0.2);

	const x1 = d3.scaleBand()
	    .domain(Object.keys(journal_color))
	    .range([0, x0.bandwidth()])
    	.padding(0.05);

    g2.append("g")
    	.attr("transform", `translate(0,${h2})`)
    	.call(d3.axisBottom(x0))
    	.selectAll("text")
               .attr('font-size', '9px')
               .attr('font-weight', 'bold')
               .attr('color', d => edge_category[d])
               .style("text-anchor", "end")
               .attr('transform', 'rotate(-10)')
               .text(d => d.substring(d.lastIndexOf('.') + 1));

	// Y axis
	const y = d3.scaleLinear()
	    .domain([0, d3.max(aggregatedData, d => d3.max(Object.keys(journal_color), journal => d.journals[journal] || 0))])
	    .nice()
	    .range([h2, 0]);

	g2.append("g")
    	.call(d3.axisLeft(y).ticks(5));

    // Bars
	g2.selectAll("g.layer")
	    .data(aggregatedData)
	    .enter()
	    .append("g")
	    .attr("transform", d => `translate(${x0(d.type)},0)`)
	    .selectAll("rect")
	    .data(d => Object.keys(journal_color).map(journal => ({
        	journal,
        	value: d.journals[journal] || 0
    	})))
    	.enter()
    	.append("rect")
    	.attr("x", d => x1(d.journal))
    	.attr("y", d => y(d.value))
    	.attr("width", x1.bandwidth())
    	.attr("height", d => h2 - y(d.value))
    	.attr("fill", d => journal_color[d.journal]);

    g2.append('text')
		.attr('transform', 'translate(' + (-margin.left/2 - 10) +','+h/2 + ')rotate(-90)')
		.attr('font-size', '11px')
		.attr('text-anchor', 'middle')
		.text('Edge counts');

	g2.append("text")
		.attr('x', w2/2)
		.attr('y', h2 + margin.bot)
		.text('Edge types')
		.style("font-size", "11px")
        .style("fill", "black")

    // Add title
	g2.append("text")
    	.attr("x", w2/2)
    	.attr("y", -10)
    	.attr("text-anchor", "middle")
    	.style("font-size", "12px")
    	.text("Total edge counts per journal for " + obj.name);

}
// remove timeline on click
function remove_timeline(obj_name){
	d3.select('#jc_' + obj_name).remove();
}


var updateFilter = document.getElementById("update_filters");
// var split = document.getElementById("split");

updateFilter.addEventListener("click", function() {
	var selectedAlgorithm = document.getElementById("algorithm_select").value;
	/*console.log('seleccion', selectedAlgorithm);
	console.log(clickedNodes);
	console.log(clickedIds);*/
	var clickedNodes2 = clickedNodes.slice();
	for (let i = 0; i < clickedIds.length; i++){
		remove_timeline(clickedIds[i]);
	}
	var clickedObjs = [];
	for (let i = 0; i<clickedNodes.length; i++){
		for(let k = 0; k<positions.length; k++){
			if (clickedNodes[i] == positions[k].name){
				clickedObjs.push(positions[k]);
			}
		}
	}
	// console.log(clickedObjs);
	for (let i = 0; i < clickedObjs.length; i++){
		add_timeline(clickedObjs[i], selectedAlgorithm);
	}

}); 

/*split.addEventListener("click", function() {
	var clickedNodes2 = clickedNodes.slice();
	for (let i = 0; i < clickedIds.length; i++){
		remove_timeline(clickedIds[i]);
	}
	var clickedObjs = [];
	for (let i = 0; i<clickedNodes.length; i++){
		for(let k = 0; k<positions.length; k++){
			if (clickedNodes[i] == positions[k].name){
				clickedObjs.push(positions[k]);
			}
		}
	}
	// console.log(clickedObjs);
	for (let i = 0; i < clickedObjs.length; i++){
		add_timeline(clickedObjs[i], 'Both', true);
	}
});*/

for (let i = 0; i<positions.length; i++){
	document.getElementById("circle_"+positions[i].id).addEventListener("click", function() {
    	$.ajax({
	        url: "http://127.0.0.1:5000/get_nodes",
        	type: "POST",
        	contentType: "application/json",
        	data: JSON.stringify({name:positions[i].name}),
        	success: function(response) {
        		if (response.length > 0){
	            	plot_nodes(response);
        		}
        		else{
        			console.log('empty');
        		}
        	}
    	});
	});

}

}

plot_nodes(positions);

