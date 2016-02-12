function silhouette(container, dataset, membership) {
	console.log('sil')
	var elems = Object.keys(membership)
	values = []
	clusters = {}
	lookup = {}
	for (var i=0; i < dataset.length; i++) {
		var p = dataset[i]
		lookup[p['id']] = p
		var c = membership[p['id']]
		if (clusters[c] === undefined) {
			clusters[c] = []
		}
		clusters[c].push(p['id'])
	}
	var clabels = Object.keys(clusters)
	for (var i=0; i < dataset.length; i++) {
		var p = dataset[i]
		var c = membership[p['id']]
		var clusterMates = clusters[c]
		var dsum = 0
		for (var j=0; j < clusterMates.length; j++) {
			p2id = clusterMates[j]
			if (i != j) {
				p2 = lookup[p2id]
				d = distance(p, p2)
				dsum += d
			}
		}
		var a_i = dsum / (clusterMates.length - 1)
		var b_i = Number.POSITIVE_INFINITY
		var dsum0 = dsum
		dsum = 0
		for (var j=0; j < clabels.length; j++) {
			members = clusters[clabels[j]]
			for (k=0; k < members.length; k++) {
				p2id = members[k]
				p2 = lookup[p2id]
				dsum += distance(p, p2)
			}
			dsum /= members.length
			if (dsum < b_i) {
				b_i = dsum
			}
		}
		p['s_i'] = (b_i - a_i) / Math.max(b_i, a_i)
		values.push(p['s_i'])
	}

  var hotdogs = values,
      chart,
      width = 400,
      bar_height = 2,
      height = bar_height * values.length;

  chart = d3.select(container)
    .append('svg')
    .attr('class', 'chart')
    .attr('width', width)
    .attr('height', height);

  var x, y;

  $('.chart').remove()

  chart = d3.select(container)
    .append('svg')
    .attr('class', 'chart')
    .attr('width', width)
    .attr('height', height);

  x = d3.scale.linear()
     .domain([0, d3.max(hotdogs)])
     .range([0, width]);

  y = d3.scale.ordinal()
    .domain(hotdogs)
    .rangeBands([0, height]);

  chart.selectAll("rect")
     .data(hotdogs)
     .enter().append("rect")
     .attr("x", 0)
     .attr("y", y)
     .attr("width", x)
     .attr("height", bar_height);

  /* step 3 */
  chart = d3.select($("#step-3")[0])
    .append('svg')
    .attr('class', 'chart')
    .attr('width', width)
    .attr('height', height);

  chart.selectAll("rect")
    .data(hotdogs)
    .enter().append("rect")
    .attr("x", 0)
    .attr("y", y)
    .attr("width", x)
    .attr("height", y.rangeBand());

  chart.selectAll("text")
    .data(hotdogs)
    .enter().append("text")
    .attr("x", x)
    .attr("y", function(d){ return y(d) + y.rangeBand()/2; } )
    .attr("dx", -5)
    .attr("dy", ".36em")
    .attr("text-anchor", "end")
    .text(String);

  /* step 4 */
  var left_width = 100;

  chart = d3.select($("#step-4")[0])
    .append('svg')
    .attr('class', 'chart')
    .attr('width', left_width + width)
    .attr('height', height);

  chart.selectAll("rect")
    .data(hotdogs)
    .enter().append("rect")
    .attr("x", left_width)
    .attr("y", y)
    .attr("width", x)
    .attr("height", y.rangeBand());

  chart.selectAll("text.score")
    .data(hotdogs)
    .enter().append("text")
    .attr("x", function(d) { return x(d) + left_width; })
    .attr("y", function(d){ return y(d) + y.rangeBand()/2; } )
    .attr("dx", -5)
    .attr("dy", ".36em")
    .attr("text-anchor", "end")
    .attr('class', 'score')
    .text(String);


  /* step 5 */
  var gap = 2;
  // redefine y for adjusting the gap
  y = d3.scale.ordinal()
    .domain(hotdogs)
    .rangeBands([0, (bar_height + 2 * gap) * values.length]);


  chart = d3.select($("#step-5")[0])
    .append('svg')
    .attr('class', 'chart')
    .attr('width', left_width + width + 40)
    .attr('height', (bar_height + gap * 2) * values.length + 30)
    .append("g")
    .attr("transform", "translate(10, 20)");

  chart.selectAll("line")
    .data(x.ticks(d3.max(hotdogs)))
    .enter().append("line")
    .attr("x1", function(d) { return x(d) + left_width; })
    .attr("x2", function(d) { return x(d) + left_width; })
    .attr("y1", 0)
    .attr("y2", (bar_height + gap * 2) * values.length);

  chart.selectAll(".rule")
    .data(x.ticks(d3.max(hotdogs)))
    .enter().append("text")
    .attr("class", "rule")
    .attr("x", function(d) { return x(d) + left_width; })
    .attr("y", 0)
    .attr("dy", -6)
    .attr("text-anchor", "middle")
    .attr("font-size", 10)
    .text(String);

  chart.selectAll("rect")
    .data(hotdogs)
    .enter().append("rect")
    .attr("x", left_width)
    .attr("y", function(d) { return y(d) + gap; })
    .attr("width", x)
    .attr("height", bar_height);

  chart.selectAll("text.score")
    .data(hotdogs)
    .enter().append("text")
    .attr("x", function(d) { return x(d) + left_width; })
    .attr("y", function(d, i){ return y(d) + y.rangeBand()/2; } )
    .attr("dx", -5)
    .attr("dy", ".36em")
    .attr("text-anchor", "end")
    .attr('class', 'score')
    .text(String);

  chart.selectAll("text.name")
    .data(values)
    .enter().append("text")
    .attr("x", left_width / 2)
    .attr("y", function(d, i){ return y(d) + y.rangeBand()/2; } )
    .attr("dy", ".36em")
    .attr("text-anchor", "middle")
    .attr('class', 'name')
    .text(String);


	//a_i = average dissimiliarity of i with all other data within the same cluster
	//b_i = lowest average dissimilarity of i to any other cluster i is not a member of
	//s_i = (b_i - a_i) / max(b_i, a_i)
	/*
	var w = (container.style('width').replace('px', ''))
	var h = (container.style('height').replace('px', ''))
	var r = 3
	var cx = Math.random() * (w - r*2) + r
	var cy = Math.random() * (h - r*2) + r
	var fill = '#888'
	*/
	//var circle = container.append("circle").attr('class', 'cir').attr("cx", cx).attr("cy", cy).attr("r", r).attr("fill", fill);
}
