var active = false
var mactive = false
var ractive = false
var cactive = false
var cx = -1
var cy = -1
var membership = null
var centroids = null
var clusterDict = null
var dmap = {}

function addPoint() {
	var container = d3.select("#mysvg");
	var w = (container.style('width').replace('px', ''))
	var h = (container.style('height').replace('px', ''))
	var r = 3
	var cx = Math.random() * (w - r*2) + r
	var cy = Math.random() * (h - r*2) + r
	addPoint2(cx, cy)
	if (active) {
		setTimeout(addPoint, 10)
	}
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function addPoint2(cx, cy) {
	var container = d3.select("#mysvg");
	var r = 5
	var fill = '#888'
	var id = 'c_' + guid()
	var circle = container.append("circle").attr('id', id).attr('class', 'cir').attr("cx", cx).attr("cy", cy).attr("r", r).attr("fill", fill);
}

function getDataset() {
	var dataset = []
	var points = $(".cir")
	$.each(points, function(i) {
		var x = parseFloat($(this).attr('cx'))
		var y = parseFloat($(this).attr('cy'))
		var id = $(this).attr('id')
		var p = {'x': x, 'y': y, 'id': id}
		dataset.push(p)
	})
	return dataset
}

function distance(p1, p2) {
   var d = Math.sqrt(Math.pow(p1['x'] - p2['x'], 2) + Math.pow(p1['y'] - p2['y'], 2))
   return d
}

function applyAlgo(algo) {
	dataset = getDataset()
	if (algo == 'dbscan') {
		var minPoints = parseFloat($("#minPoints").val())
		var epsilon = parseFloat($("#epsilon").val())
		membership = dbscan(dataset, epsilon, minPoints)
	}
	else if (algo = 'kmeans') {
		var k = 5
		membership = kmeans(dataset, k)
	}
	else {
		membership = {}
		for (var i=0; i < dataset.length; i++) {
			var p = dataset[i]
			membership[p['id']] = -1
		}
	}
	var ids = Object.keys(membership)
	valDict = {}
	clusterDict = {}
	for (var i=0; i < ids.length; i++) {
		var id = ids[i]
		cluster = membership[id]
		valDict[membership[id]] = 1
		if (clusterDict[cluster] === undefined) {
			clusterDict[cluster] = [id]
		}
		else {
			clusterDict[cluster].push(id)
		}
	}
	var cmax = Object.keys(clusterDict).length
	var clusters = Object.keys(valDict)
	centroids = {}
	$.each(clusters, function(i) {
		cluster = clusters[i]
		elements = clusterDict[cluster]
		centroids[cluster] = calculateCentroid(elements)
	})
	if (cmax < 3) {
		cmax = 3
	}
	for (var i=0; i < ids.length; i++) {
		var id = ids[i]
		var pnt = $('#' + id)
		var cluster = membership[id]
		var fill = '#888'
		var palette = colorbrewer['Set3']
		if (cmax <= 9) {
			palette = palette[cmax]
		}
		if (cluster >= 0) {
			fill = palette[cluster]
		}
		else if (cluster == -1) {
			fill = '#ddd'
		}
		pnt.attr('fill', fill)
	}
	silhouette("#silhouette-svg", dataset, membership)
}

function calculateCentroid(elements) {
	dataset = getDataset()
	dmap = {}
	$.each(dataset, function(i) {
		p = dataset[i]
		dmap[p['id']] = p
	})
	var xsum = 0
	var ysum = 0
	var n = elements.length
	console.log(elements)
	$.each(elements, function(i) {
		elemid = elements[i]
		elem = dmap[elemid]
		xsum += elem['x']
		ysum += elem['y']
	})
	var x = xsum / n
	var y = ysum / n
	centroid = {'x': x, 'y': y}
	return centroid
}

function doMovement(magnets) {
	var elems = $('.cir')
	var delta = 0.005
	$.each(elems, function(i, elem) {
		var cir = $(this)
		var x = parseFloat(cir.attr('cx'))
		var y = parseFloat(cir.attr('cy'))
		var boost = 15
		var minj = -1
		var mindist = Number.POSITIVE_INFINITY
		$.each(magnets, function(j) {
			var magnet = magnets[j]
			var xdist = (magnet['x'] - x)
			var ydist = (magnet['y'] - y)
			var dist = Math.pow(Math.pow(xdist, 2) + Math.pow(ydist, 2), .5)
			if (dist < mindist) {
				minj = j
				mindist = dist
			}
		})
		var magnet = magnets[minj]
		var xdist = (magnet['x'] - x)
		var ydist = (magnet['y'] - y)
		dx = delta * xdist
		dy = delta * ydist
		x = x + dx
		y = y + dy
		cir.attr('cx', x)
		cir.attr('cy', y)
	})
	if (mactive) {
		setTimeout(function () { doMovement(magnets) }, 2)
	}
}

function addPointAt() {
	var x = cx + (Math.random() - 0.5) * 50
	var y = cy + (Math.random() - 0.5) * 50
	addPoint2(x, y)
	if (cactive) {
		setTimeout(addPointAt, 50)
	}
}

function initUi() {
	var container = d3.select("#mysvg");

	$("#mysvg").mousedown(function(c) {
		console.log('ddown')
		cactive = true
		cx = c['offsetX']
		cy = c['offsetY']
		addPointAt()
	})

	$("#mysvg").mouseout(function(c) {
		$(".magnet").remove()
		$(".cluster-connect").remove()
	})

	$("#mysvg").mousemove(function(c) {
		cx = c['offsetX']
		cy = c['offsetY']
		var container = d3.select("#mysvg");
		$(".magnet").remove()
		$(".cluster-connect").remove()
		if (centroids !== null) {
			var p = {'x': cx, 'y': cy}
			var mindist = Number.POSITIVE_INFINITY
			var minj = -1
			var centroidNames = Object.keys(centroids)
			for (var i=0; i < centroidNames.length; i++) {
				centroid = centroids[centroidNames[i]]
				dist = distance(centroid, p)
				if (dist < mindist) {
					minj = i
					mindist = dist
				}
			}
			centroid = centroids[minj]
			name = centroidNames[minj]
			elements = clusterDict[name]
			$.each(elements, function(i) {
				elemid = elements[i]
				elem = dmap[elemid]
				var line = container.append("line")
				                         .attr("x1", centroid['x'])
				                         .attr("y1", centroid['y'])
				                         .attr("x2", elem['x'])
				                         .attr("y2", elem['y'])
				                         .attr('class', 'cluster-connect')
			})
			container.append("circle").attr('class', 'magnet').attr("cx", centroid['x']).attr("cy", centroid['y'])
		}
	})

	$("#mysvg").mouseup(function(c) {
		console.log('dup')
		cactive = false
	})

	$(".algoradio").change(function() {
		console.log('radio change')
		console.log($("#ralgo-kmeans").ischecked)
		console.log($("#ralgo-dbscan").ischecked())
	})

	$("#btnRunAlgo").click(function() {
		console.log($("#ralgo-kmeans"))
		console.log($("#ralgo-kmeans").attr('checked'))
		//dbscan
		//kmeans
		var algo = 'kmeans'
		applyAlgo(algo)
	})

	$("#btnAddPoints").mousedown(function() {
		active = true
		setTimeout(addPoint, 0)
	})
	$("#btnAddPoints").mouseup(function() {
		active = false
	})

	$("#btnMagnetize").mouseup(function() {
		mactive = false
		$(".magnet").remove()
	})

	function randomize() {
		var elems = $('.cir')
		$.each(elems, function(i, elem) {
			var cir = $(this)
			var x = parseFloat(cir.attr('cx'))
			var y = parseFloat(cir.attr('cy'))
			var m = 5
			x = x + m * (Math.random() - 0.5)
			y = y + m * (Math.random() - 0.5)
			cir.attr('cx', x)
			cir.attr('cy', y)
		})
		if (ractive) {
			setTimeout(randomize, 10)
		}
	}

	$("#btnRandomize").mousedown(function() {
		ractive = true
		randomize()
	})

	$("#btnRandomize").mouseup(function() {
		ractive = false
	})

	$("#btnMagnetize").mousedown(function() {
		mactive = true
		var magnets = []

		var buffer = 25
		var k = $("#k").val()
		var w = parseFloat(container.style('width').replace('px', ''))
		var h = parseFloat(container.style('height').replace('px', ''))

		for (var i=0; i < k; i++) {
			var x = Math.random() * (w - buffer*2) + buffer
			var y = Math.random() * (h - buffer*2) + buffer
			magnets.push({'x':x, 'y':y})
			container.append("circle").attr('class', 'magnet').attr("cx", x).attr("cy", y);
		}

		setTimeout(function() { doMovement(magnets) }, 0)
	})

	$("#btnClear").click( function() {
		var elems = $(".cir")
		elems.remove()
	})

	for (i=0; i < 100; i++) {
		addPoint()
	}
}

