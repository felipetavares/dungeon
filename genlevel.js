function Buffer (w,h) {
	this.w = w;
	this.h = h;
	this.len = w*h;
	this.data = [];
	this.images = [
		html5.image("0"),
		html5.image("1"),
		html5.image("1"),
		html5.image("2"),
		html5.image("2"),
		html5.image("1"),
	];

	this.fillRect = function (x, y, w, h) {
		var s = [x,y];
		var e = [x+w, y+h];

		for (var y = s[1]; y<e[1]; y++)
			for (var x = s[0]; x<e[0];x++) {
				var p = y*this.w+x;
				if (p < this.len)
					this.data [p] = 1;
			}
	}

	this.draw = function (scale, px, py, sx, sy) {
		px /= scale;
		py /= scale;
		sx /= scale;
		sy /= scale;

		var k = Math.floor(py)*this.w+Math.floor(px);
		var e = Math.floor((py+sy))*this.w+Math.floor((px+sx))+1;
		if (e > this.len)
			e = this.len;
		if (k < 0)
			k = 0;

		html5.context.strokeStyle = "red";

		var n=0;

		physics.s_objects = [];

		for (;k<e;k++) {
			var x = Math.floor(k%this.w);
			var y = Math.floor(k/this.w);
			
			if (x < 0 || y < 0)
				continue;

			if (x > px+sx) {
				k += this.w-sx-2;
				continue;
			}
			if (x < px-1) {
				k = px+y*this.w;
				continue;				
			}

			x *= scale;
			y *= scale;

			n++;

			html5.context.save();
			html5.context.translate (x,y);
			html5.context.scale (scale/this.images[this.data[k]].width,
						 scale/this.images[this.data[k]].height);
			html5.context.drawImage (this.images[this.data[k]], 0, 0);
			html5.context.restore();

			switch (this.data[k]) {
				case 0: case 5:
				break;
				case 1: case 3:
					//html5.context.strokeRect (x,y, scale, scale);
					physics.s_objects.push (new StaticObject ([x,y], [scale, scale]));
				break;
				case 2: case 4:
					//html5.context.strokeRect (x, y+scale/8*7, scale, scale/8);
					physics.s_objects.push (new StaticObject ([x,y+scale/8*7], [scale, scale/8]));
			break;
			}
		}

		//console.log (n);
		//console.log (physics.s_objects.length);
	}

	this.invert = function () {
		for (var k=0;k<this.len;k++) {
			if (this.data[k]) {
				this.data[k] = 0;
			} else {
				this.data[k] = 1;
			}
		}
	}

	this.addWalls = function () {
		for (var k=0;k<this.len;k++) {
			if (this.data[k]) {
				var p = k+this.w;
				var p2 = k-this.w;
				if (p < this.len &&
					!this.data[p]) {
					this.data[k] = 3;
				}
				if (p2 > 0 &&
					!this.data[p2]) {
					if (this.data[k] == 3)
						this.data[k] = 4;
					else
						this.data[k] = 2;
				}
			}

			if (this.data[k]) {
				var p1 = k+this.w;
				var p2 = k-this.w;
				var p3 = k-1;
				var p4 = k+1;
				var p5 = k-this.w+1;
				var p6 = k-this.w-1;
				var p7 = k+this.w+1;
				var p8 = k+this.w-1;

				if (p7 < this.len &&
					p4 < this.len &&
					p4%this.w != 0 &&
					p3%this.w != 1 &&
					p3 > 0 &&
					p6 > 0) {
					if (this.data[p1] &&
						this.data[p2] &&
						this.data[p3] &&
						this.data[p4] &&
						this.data[p5] &&
						this.data[p6] &&
						this.data[p7] &&
						this.data[p8])
						this.data[k] = 5;
				}
			}
		}
	}
}


function LGNode (parent, p, s) {
	this.p = p;
	this.s = s;
	this.ds = [0,0];
	this.dp = [0,0];

	this.inside = false;

	this.parentNode = parent;
	this.children = []; 
	this.corridors = [];

	this.area = function () {
		return this.s[0]*this.s[1];
	}

	this.less = function () {
		if (this.inside) {
			if (this.s[0] >= 3 || this.s[1] >= 3) {
				if (this.s[0] > 2 &&
					this.s[1] > 2) {
					this.ds[0] = Math.floor(this.s[0]*(Math.random()/2+0.5));
					this.ds[1] = Math.floor(this.s[1]*(Math.random()/2+0.5));
				} else {
					this.ds[0] = 0;
					this.ds[1] = 0;
				}

				this.dp[0] = this.p[0]+Math.floor((this.s[0]-this.ds[0])/2);
				this.dp[1] = this.p[1]+Math.floor((this.s[1]-this.ds[1])/2);
			}
		}
	}

	this.needSubdivide = function () {
		this.ds = vm.copy(this.s);
		this.dp = vm.copy(this.p);
		
		if (this.s[0] <= 8 && this.s[1] <= 8)
			return false;
		return true;
	}
}

var corridors = 0;

function Corridor (n0, n1) {
	corridors ++;

	this.p = [0,0];
	this.s = [1,1];

	//while (!n0.inside)
	//	n0 = n0.children[0];
	//while (!n0.inside)
	//	n0 = n0.children[0];

	this.p = vm.add(n0.dp, vm.div(n0.ds, 2));
	this.s = vm.sub(vm.add(n1.dp, vm.div(n1.ds, 2)),this.p);

	this.p = vm.ceil(this.p);
	this.s = vm.ceil(this.s);

	if (this.s[0] < 1)
		this.s[0] = 1;
	if (this.s[1] < 1)
		this.s[1] = 1;
}

function LevelGenerator (s) {
	this.s = s;
	this.root = null;

	this.d = true;

	this.generate = function (level) {
		this.root = new LGNode (null, [0,0], this.s);

		this.subdivide (this.root, 0);
	}

	this.subdivideH = function (node) {
		var splitLine = Math.ceil((node.s[1]-2)*Math.random())+1;
		node.children.push (new LGNode(node, node.p, [node.s[0], splitLine]));
		node.children.push (new LGNode(node, [node.p[0],node.p[1]+splitLine],
										[node.s[0], node.s[1]-splitLine]));		
	}

	this.subdivideV = function (node) {
		var splitLine = Math.ceil((node.s[0]-2)*Math.random())+1;
		node.children.push (new LGNode(node, node.p, [splitLine, node.s[1]]));
		node.children.push (new LGNode(node, [node.p[0]+splitLine,node.p[1]],
										[node.s[0]-splitLine, node.s[1]]));		
	}

	this.subdivide = function (node, n) {
		if (this.d)
			this.subdivideH(node);
		else
			this.subdivideV(node);

		this.d = !this.d;

		if (node.children[0].needSubdivide() && n < 12)
			this.subdivide(node.children[0], n+1);
		else {
			node.children[0].inside = true;
			node.children[0].less();
		}

		if (node.children[1].needSubdivide() && n < 12)
			this.subdivide(node.children[1], n+1);
		else {
			node.children[1].inside = true;
			node.children[1].less();
		}

		node.corridors.push(new Corridor(node.children[0],node.children[1]));
	}
}
