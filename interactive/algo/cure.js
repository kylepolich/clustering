function cure(dataset, k) {
	for (var i=0; i < dataset.length; i++) {
		var p = dataset[i]
		//For every cluster u (each input point), in u.mean and u.rep store the mean of the points in the cluster and a set of c representative points of the cluster (initially c = 1 since each cluster has one data point). Also u.closest stores the cluster closest to u.
		//All the input points are inserted into a k-d tree T
		//Treat each input point as separate cluster, compute u.closest for each u and then insert each cluster into the heap Q. (clusters are arranged in increasing order of distances between u and u.closest).
	}
	while (size(Q) > k) {
		//Remove the top element of Q(say u) and merge it with its closest cluster u.closest(say v) and compute the new representative points for the merged cluster w.
		//Remove u and v from T and Q.
		//For all the clusters x in Q, update x.closest and relocate x
		//insert w into Q
	}
}