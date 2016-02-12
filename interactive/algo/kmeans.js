var MAX_ITERATIONS = 10000000
var EPSILON = 1
var xrange = [Number.POSITIVE_INFINITY,  Number.NEGATIVE_INFINITY]
var yrange = [Number.POSITIVE_INFINITY,  Number.NEGATIVE_INFINITY]

function kmeans(dataset, k) {
	var membership = {}
	for (var i=0; i < dataset.length; i++) {
		var p = dataset[i]
		membership[p['id']] = Math.floor(Math.random() * k)
	}
	centroids = getCentroids(dataset, membership, k)

	var iterations = 0
	var oldCentroids = null
	while (!stoppingConditionMet(k, oldCentroids, centroids, iterations)) {
		oldCentroids = centroids
		iterations++
		membership = getLabels(dataset, centroids)
		centroids = getCentroids(dataset, membership, k)
	}
	return membership
}

function stoppingConditionMet(k, oldCentroids, centroids, iterations) {
	if (iterations > MAX_ITERATIONS) {
		return true
	}
	if (oldCentroids == null) {
		return false
	}
	var maxDistance = 0
	for (var i=0; i < k; i++) {
		for (j=i+1; j < k; j++) {
			var d = distance(centroids[i], oldCentroids[j])
			if (d > maxDistance) {
				maxDistance = d
			}
		}
	}
	if (maxDistance > EPSILON) {
		return true;
	}
}

function getLabels(dataset, centroids) {
	membership = {}
	for (var i=0; i < dataset.length; i++) {
		var p = dataset[i]
		var best_dist = distance(p, centroids[0])
		var best_c = 0
		for (var j=1; j < centroids.length; j++) {
			var centroid = centroids[j]
			var d = distance(p, centroids[j])
			if (d < best_dist) {
				best_dist = d
				best_c = j
			}
		}
		membership[p['id']] = best_c
	}
	return membership
}

function getCentroids(dataset, membership, k) {
	var centroids = []
	for (var i=0; i < k; i++) {
		centroids[i] = {'xsum': 0, 'ysum': 0, 'n': 0}
	}
	for (var i=0; i < dataset.length; i++) {
		var p = dataset[i]
		var c = membership[p['id']]
		centroids[c]['xsum'] += p['x']
		centroids[c]['ysum'] += p['y']
		centroids[c]['n'] += 1
	}
	for (var i=0; i < k; i++) {
		if (centroids[i]['n'] > 0) {
			centroids[i]['x'] = centroids[i]['xsum'] / centroids[i]['n']
			centroids[i]['y'] = centroids[i]['ysum'] / centroids[i]['n']
		}
		else {
			centroids[i]['x'] = (xrange[1] - xrange[0]) * Math.random() + xrange[0]
	        centroids[i]['y'] = (yrange[1] - yrange[0]) * Math.random() + yrange[0]

		}
	}
	return centroids
}
