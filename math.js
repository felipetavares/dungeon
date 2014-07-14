function VectorMath () {
	this.LinearInterpolator = function (x,y, fn) {
		this.x = x;
		this.y = y;
		this.fn = fn;

		this.complete = function (x) {
			if (x >= this.x[1])
				return true;
			return false;
		}

		this.interpolate = function (x) {
			if (x <= this.x[0])
				return this.y[0];
			else if (x >= this.x[1]) {
				if (this.fn)
					this.fn();
				return this.y[1];
			}

			return this.y[0]+(this.y[1]-this.y[0])*(x-this.x[0])/(this.x[1]-this.x[0]);
		}
	}

	this.dot = function (v1,v2) {
	    var d =  v1[0]*v2[0]+v1[1]*v2[1];
		return d;
	} 

	this.cross = function (v1,v2) {
		return v1[0]*v2[1]-v1[0]*v2[1];
	}

	this.len = function (v) {
	    return Math.sqrt(v[0]*v[0]+v[1]*v[1]); 
	} 

	this.add = function (v0,v1) {
		return [v0[0]+v1[0],v0[1]+v1[1]];
	}

	this.sub = function (v0,v1) {
		return [v0[0]-v1[0],v0[1]-v1[1]];
	}

	this.mul = function (v,s) {
		return [v[0]*s,v[1]*s];
	}

	this.div = function (v,s) {
		return [v[0]/s,v[1]/s];
	}

	this.invert = function (v) {
		return [-v[0],-v[1]];
	}

	this.copy = function (v) {
		return [v[0],v[1]];
	}

	this.mcopy = function (v) {
		var i;
		var r = [];
		for (i in v) {
			r.push(this.copy(v[i]));
		}
		return r;
	}

	this.normal = function (v) {
		return [v[1],-v[0]];
	}

	this.inormal = function (v) {
		return [-v[1],v[0]];
	}

	this.normalize = function (v1) {
		v = [0,0];
		l = Math.sqrt(v1[0]*v1[0]+v1[1]*v1[1]);
		v[0] = v1[0]/l;
		v[1] = v1[1]/l;
		
		return v;
	}

	this.sqr = function (x) {
			return x*x;
	}

	this.ceil = function (v) {
		return [Math.ceil(v[0]), Math.ceil(v[1])];
	}

	this.madd = function (array,v) {
		var e,narray=[];
		for (e in array) {
			narray.push(this.add (array[e],v));
		}

		return narray;
	}

	this.msub = function (array,v) {
		var e,narray=[];
		for (e in array) {
			narray.push(this.sub (array[e],v));
		}

		return narray;
	}
	
	this.mulv = function (v0, v1) {
		return [v0[0]*v1[0], v0[1]*v1[1]];
	}

	// Pivot angle and vector
	this.rotate = function (p, a, v) {
		var c = Math.cos (a);
		var s = Math.sin (a);
		var p0 = v[0]-p[0];
		var p1 = v[1]-p[1];

		return [c*p0-s*p1 + p[0],
				s*p0+c*p1 + p[1]];
	}

	this.mrotate = function (p, a, array) {
		var e,narray = [];
		for (e in array) {
			narray.push(this.rotate (p, a, array[e]));
		}

		return narray;
	}

	this.dist2 = function (v, w) { return this.sqr(v[0]- w[0]) + this.sqr(v[1] - w[1]) }
	this.distToSegmentSquared = function (p, v, w) {
	  var l2 = this.dist2(v, w);
	  if (l2 == 0) return this.dist2(p, v);
	  var t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
	  if (t <= 0) return this.dist2(p, v);
	  if (t >= 1) return this.dist2(p, w);
	  return this.dist2(p, [ v[0] + t * (w[0] - v[0]),
	                    	v[1] + t * (w[1] - v[1]) ]);
	}

	this.closestPointLinePoint = function (p, v, w) {
	  var l2 = this.dist2(v, w);
	  if (l2 == 0) return v;
	  var t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
	  if (t <= 0) return v;
	  if (t >= 1) return w;
	  return [ v[0] + t * (w[0] - v[0]),
	           v[1] + t * (w[1] - v[1]) ];
	}

	this.lineToPoint = function (p, v, w) {
		return Math.sqrt(this.distToSegmentSquared(p, v, w));
	}

	this.lineFromPoints = function (p0, p1) {
		var a = (p1[1]-p0[1])/(p1[0]-p0[0]);
		return [a, p0[1]-a*p0[0]];
	}
	
	this.lineSegmentIntersect = function (a, b, p) {
		var minxa = Math.min(a[0][0],a[1][0]);
		var maxxa = Math.max(a[0][0],a[1][0]);
		var minya = Math.min(a[0][1],a[1][1]);
		var maxya = Math.max(a[0][1],a[1][1]);
	
		var minxb = Math.min(b[0][0],b[1][0]);
		var maxxb = Math.max(b[0][0],b[1][0]);
		var minyb = Math.min(b[0][1],b[1][1]);
		var maxyb = Math.max(b[0][1],b[1][1]);
	
		if (p[0] >= minxa && p[0] <= maxxa &&
			p[1] >= minya && p[1] <= maxya &&
			p[0] >= minxb && p[0] <= maxxb &&
			p[1] >= minyb && p[1] <= maxyb)
			return p;
		return false;
	}
	
	/*
		@param r Ray
		@param l Line
		@returns false if no intersection, a vector representing
		the first intersection if intersection is found
	*/
	this.rayLineIntersection = function (r, l) {
		// This introduces a sub-pixel error.
		if (r[0][0] == r[1][0]) {
			r[0][0]-=0.5;
			r[1][0]+=0.5;
		}
		if (l[0][0] == l[1][0]) {
			l[0][0]-=0.5;
			l[1][0]+=0.5;
		}

		// Algebraic form
		var gr = this.lineFromPoints (r[0],r[1]);
		var gl = this.lineFromPoints (l[0],l[1]);
		
		var x = (gl[1]-gr[1])/(gr[0]-gl[0]);
		var y = gr[0]*x+gr[1];

		return this.lineSegmentIntersect(r,l,[x,y]);
	}
}

var vm = new VectorMath();