function v_dot (v1,v2) {
    return v1[0]*v2[0]+v1[1]*v2[1];
} 

function v_len (v) {
    return Math.sqrt(v[0]*v[0]+v[1]*v[1]); 
}

function v_normalize (v1) {
	v = [0,0];
	l = Math.sqrt(v1[0]*v1[0]+v1[1]*v1[1]);
	v[0] = v1[0]/l;
	v[1] = v1[1]/l;
	
	return v;
}

function v_copy (v) {
	return [v[0], v[1]];
}

function v_mul (v,s) {
	return [v[0]*s, v[1]*s];
}

function v_add (v0, v1) {
	return [v0[0]+v1[0], v0[1]+v1[1]];
}

function v_sub (v0, v1) {
	return [v0[0]-v1[0], v0[1]-v1[1]];
}

function CollisionInfo (x,y,vx,vy) {
    this.p = [x,y];
    this.d = [vx,vy];
}

function dist (a,b) {
	return v_len(v_sub(a,b));
}

var medDelta;

function Physics () {
    this.s_objects = []; /* Static objects */
    this.d_objects = []; /* Dynamic ones   */

	this.collisionCallback = false;
	this.collision = false;
	
	medDelta = 0.16;

    this.step = function () {
	medDelta = gDeltaTime*100;
	var destroy = [];

	for (var d in this.d_objects)
		this.d_objects[d].adjust();

	for (d=0;d<this.d_objects.length;d++) {
		this.d_objects[d].v[0] += this.d_objects[d].a[0];
		this.d_objects[d].v[1] += this.d_objects[d].a[1];

		if (this.d_objects[d]._onFloor) {
			this.d_objects[d]._onFloor = false;
			this.d_objects[d].onFloor = true;
		}
		else if (this.d_objects[d].onFloor) {
			this.d_objects[d].onFloor = false;
		}

		if (this.collision) {
			if (this.collisionCallback) {
				result = false;
				this.collisionCallback(this.collision[0],this.collision[1]);	
				if (result == "abort") {
					this.collision = false;
					return;
				}
				if (result) {
					destroy.push(this.collision[1]);
				}
			}
			this.collision = false;
		}

	    for (s=0;s<this.s_objects.length;s++) {
		    for (var c in this.d_objects[d].circles) {
				if (cf = this.circleAABB(this.d_objects[d].circles[c],this.s_objects[s])) {
					// Time
					var m = medDelta;

				    d_real = v_len(cf.d)-this.d_objects[d].circles[c].r;
				    d_run = -v_dot(v_mul(this.d_objects[d].v,m),v_normalize(cf.d));
					d_run_old = v_len(this.d_objects[d].v);			

				    if (d_run > d_real ||
				    	d_real < 0) {
						console.log ("Collision");
						if (this.s_objects[s].r) {
							this.d_objects[d].v[0] += (d_run-d_real)*((this.normalize(cf.d[0],cf.d[1])[0]))/m;
							this.d_objects[d].v[1] += (d_run-d_real)*((this.normalize(cf.d[0],cf.d[1])[1]))/m;

							if (v_dot(v_normalize(cf.d),this.d_objects[d].floor) == 1.0)
								this.d_objects[d]._onFloor = true;
						
							if (this.d_objects[d].v[0] != 0) {
								this.d_objects[d].v[0] *= this.d_objects[d].f * this.s_objects[s].f;
							}
							if (this.d_objects[d].v[1] != 0) {
								this.d_objects[d].v[1] *= this.d_objects[d].f * this.s_objects[s].f;
							}
						}
						if (!this.collision) {
							this.collision = [0,0];
							this.collision[0] = this.s_objects[s];
							this.collision[1] = this.d_objects[d];
						}
					}
				}
			}
	    }
	}   

		for (var d in this.d_objects)
			this.d_objects[d].step();

		for (var d in this.d_objects) {
			if (this.d_objects[d].cg == 400) {
				for (var b in this.d_objects) {
					if (this.d_objects[b].cg != 400 &&
						this.d_objects[b].cg != 1000) {
						if (dist(this.d_objects[d].p,this.d_objects[b].p) < 
							this.d_objects[d].r+this.d_objects[b].r) {
								result = false;
								this.collisionCallback(this.d_objects[d],this.d_objects[b],result)
								
								if (result) {
									destroy.push(this.d_objects[d]);
								}
							}
						}
					}
				}
			}

		for (var e in destroy) {
			for (var d in this.d_objects) {
				if(this.d_objects[d] == destroy[e]) {
					this.d_objects.splice (this.d_objects.indexOf(destroy[e]),1);
					break;
				}
			}
		}

    }

    /* 
     * Collision detection and response
     * functions goes here 
     */
    this.normalize = function (x,y) {
	v = [0,0];
	l = Math.sqrt(x*x+y*y);
	v[0] = x/l;
	v[1] = y/l;
	
	return v;
    }

    this.clamp = function (v,min,max) {
	if (v > max)
	    v = max;
	else if (v < min)
	    v = min;

	return v;
    }

    this.circleAABB = function (circle,aabb) {
    //if (aabb.centered) {
	//closestX = this.clamp(circle.p[0], aabb.p[0]-aabb.s[0]/2, aabb.p[0]+aabb.s[0]/2);
	//closestY = this.clamp(circle.p[1], aabb.p[1]-aabb.s[1]/2, aabb.p[1]+aabb.s[1]/2);
	//} else {
	closestX = this.clamp(circle.p[0], aabb.p[0], aabb.p[0]+aabb.s[0]);
	closestY = this.clamp(circle.p[1], aabb.p[1], aabb.p[1]+aabb.s[1]);		
	//}

	distanceX = circle.p[0] - closestX;
	distanceY = circle.p[1] - closestY;

	cf = new CollisionInfo(closestX,closestY,distanceX,distanceY);
	return cf;
	}
	
    this.pushCircle = function (circle,cf) {
	vn = this.normalize(cf.d[0],cf.d[1]);

	e = 0.5;

	circle.v[0] -= (1+e)*vn[0]*(circle.v[0]*vn[0]);
	circle.v[1] -= (1+e)*vn[1]*(circle.v[1]*vn[1]);

	vn[0] *= circle.r;
	vn[1] *= circle.r;

	circle.p[0] += vn[0]-cf.d[0];
	circle.p[1] += vn[1]-cf.d[1];

	return vn;
    }   
}

function Circle (r) {
	this.c = [0,0]
	this.p = [0,0]
	this.r = r;
}

function DynamicObject () {
    this.circles = [
    	new Circle(8)
    ];
    this.r = 16;

	this.f = 1.0;

    this.p = [0,0];
    this.v = [0,0];
    this.a = [0,0];

	this.onFloor = false;
	this._onFloor = false; /* Player *will* be on floor, next frame */
	this.floor = [0,-1];
	
	this.cg = 1;
	
	this.adjust = function () {
		for (var c in this.circles) {
			this.circles[c].p = v_add(this.p, this.circles[c].c);
		}
	}

    this.step = function () {
		this.p[0] += this.v[0]*medDelta;
		this.p[1] += this.v[1]*medDelta;
    }
}

function StaticObject (p, s) {
	if (p)
		this.p = p;
	else
		this.p = [0,0];
	
	if (s)
		this.s = s;
	else
		this.s = [32,32];
	
	this.f = 1.0;
	this.cg = 1;
	
	this.r = true; /* Collision response? */
}
