console.log(data);
console.log(journals);
console.log(companies);

color = {
	'The News Buoy': "#66c2a5",
	'Lomark Daily': "#fc8d62",
	'Haacklee Herald': "#e78ac3"
}
        const width = 1000;
        const height = 800;
        const margin = {top: 20, right: 450, bottom: 30, left: 300};

        const svg = d3.select("#graph")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.x)]).nice()
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.y)]).nice()
            .range([height - margin.bottom, margin.top]);

        svg.append("g")
            .selectAll("circle")
            .data(data)
            .join("circle")
            .attr("cx", d => x(d.x))
            .attr("cy", d => y(d.y))
            .attr("r", 6)
            .style("fill", d => d.type == 'mentioned'? color[d.journal]: 'white')
            .style("stroke", d => color[d.journal])
            .style("stroke-width", 2);

         svg.append("g")
            .selectAll("text")
            .data(companies)
            .join("text")
            .attr("x", d => x(d.x))
            .attr("y", d => y(d.y - 0.3))
            .attr('font-size', '12px')
            .attr('text-anchor', 'end')
            .text(d=>d.name);

        svg.append('text')
			.attr('transform', 'translate(' + 75 +','+ 100 + ')rotate(-90)')
			.attr('font-size', '13px')
			.attr('text-anchor', 'middle')
			.text('Companies');

		svg.append('text')
			.attr('transform', 'translate(' + 450 +','+ 20 + ')')
			.attr('font-size', '13px')
			.attr('text-anchor', 'middle')
			.text('Police reports');

		svg.append('rect')
			.attr('x', 575)
			.attr('y', 30)
			.attr('height', 150)
			.attr('width', 180)
			.attr('fill', 'transparent')
			.attr('stroke', 'black')
			.attr('stroke-width', '1px')

		svg.append('text')
			.attr('x', 575 + 100)
			.attr('y', 45)
			.attr('font-size', '13px')
			.attr('text-anchor', 'middle')
			.text('Legend');

		svg.append('text')
			.attr('x', 575 + 100)
			.attr('y', 70)
			.attr('font-size', '11px')
			.attr('text-anchor', 'end')
			.text('Mentioned');

		svg.append('circle')
			.attr('cx', 575 + 120)
			.attr('cy', 70 - 3)
			.attr('r', 5)
			.attr('stroke-width', 2)
			.attr('stroke', '#b5b5b5')
			.attr('fill', '#b5b5b5');

		svg.append('text')
			.attr('x', 575 + 100)
			.attr('y', 90)
			.attr('font-size', '11px')
			.attr('text-anchor', 'end')
			.text('Omitted');

		svg.append('circle')
			.attr('cx', 575 + 120)
			.attr('cy', 90 - 3)
			.attr('r', 5)
			.attr('stroke-width', 2)
			.attr('stroke', '#b5b5b5')
			.attr('fill', 'transparent');

		svg.append('text')
			.attr('x', 575 + 100)
			.attr('y', 120)
			.attr('font-size', '11px')
			.attr('text-anchor', 'end')
			.text('Haacklee Herald');

		svg.append('circle')
			.attr('cx', 575 + 120)
			.attr('cy', 120 - 3)
			.attr('r', 5)
			.attr('stroke-width', 2)
			.attr('stroke', color['Haacklee Herald'])
			.attr('fill', color['Haacklee Herald']);

		svg.append('text')
			.attr('x', 575 + 100)
			.attr('y', 140)
			.attr('font-size', '11px')
			.attr('text-anchor', 'end')
			.text('Lomark Daily');

		svg.append('circle')
			.attr('cx', 575 + 120)
			.attr('cy', 140 - 3)
			.attr('r', 5)
			.attr('stroke-width', 2)
			.attr('stroke', color['Lomark Daily'])
			.attr('fill', color['Lomark Daily']);

		svg.append('text')
			.attr('x', 575 + 100)
			.attr('y', 160)
			.attr('font-size', '11px')
			.attr('text-anchor', 'end')
			.text('The News Buoy');

		svg.append('circle')
			.attr('cx', 575 + 120)
			.attr('cy', 160 - 3)
			.attr('r', 5)
			.attr('stroke-width', 2)
			.attr('stroke', color['The News Buoy'])
			.attr('fill', color['The News Buoy']);	