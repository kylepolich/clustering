function dbscan(dataset, epsilon, minPoints) {
   clusterLabel = 0
   clusters = {}
   visited = {}
   membership = {}
   for (var i=0; i < dataset.length; i++) {
      var p = dataset[i]
      if (visited[p['id']] === undefined) {
         visited[p['id']] = true
         neighborPts = regionQuery(dataset, p, epsilon)
         if (neighborPts.length < minPoints) {
            membership[p['id']] = -1
         }
         else {
            clusters[clusterLabel] = []
            neighborPts = expandCluster(p, neighborPts, membership, dataset, clusters, visited, clusterLabel, epsilon, minPoints)
            clusterLabel = clusterLabel + 1
         }
      }
   }
   return membership
}

function expandCluster(p, neighborPts, membership, dataset, clusters, visited, clusterLabel, epsilon, minPoints) {
   var cluster = clusters[clusterLabel]
   cluster.push(p)
   membership[p['id']] = clusterLabel
   for (var i=0; i < neighborPts.length; i++) {
      var p2 = neighborPts[i]
      if (visited[p2['id']] === undefined) {
         visited[p2['id']] = true
         neighborPts2 = regionQuery(dataset, p2, epsilon)
         if (neighborPts2.length >= minPoints) {
            neighborPts = neighborPts.concat(neighborPts2)
            for (var j=0; j < neighborPts2; j++) {
               membership[neighborPts[j]] = clusterLabel
            }
         }
      }
      if (membership[p2['id']] === undefined) {
         membership[p2['id']] = clusterLabel
      }
   }
   return neighborPts
}

function regionQuery(dataset, p, epsilon) {
   neighbors = []
   // TODO: speed this up with kd trees
   for (var i=0; i < dataset.length; i++) {
      var p2 = dataset[i]
      if (p2 != p) {
         if (distance(p, p2) < epsilon) {
            neighbors.push(p2)
         }
      }
   }
   return neighbors
}
