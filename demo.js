var lg = null;
var buf = null;
var physics = null;
var player = null;
var gDeltaTime = 0;
var gOldTime = new Date()/1000;

function drawBSP (node) {
	if (node.inside)
		buf.fillRect (node.dp[0],node.dp[1],node.ds[0],node.ds[1]);

	for (c in node.children) {
		drawBSP(node.children[c]);
	}

	for (c in node.corridors) {
		drawCorridor(node.corridors[c]);
	}
}

function drawCorridor (corridor) {
	buf.fillRect (corridor.p[0],corridor.p[1],corridor.s[0],corridor.s[1]);
}

var camera = [0,0];
var dir = [
	[0,-1],
	[0,1],
	[-1,0],
	[1,0]
];

function update () {
	gDeltaTime = (new Date()/1000)-gOldTime;
	gOldTime = new Date()/1000;

	// Clear screen
	html5.context.clearRect (0,0, html5.canvas.width, html5.canvas.height);
	
	physics.step();

	camera = vm.sub (player.p, vm.div([html5.canvas.width, html5.canvas.height], 2));

	html5.context.save()
		html5.context.translate (-camera[0], -camera[1]);
		buf.draw(64, player, camera[0], camera[1], html5.canvas.width, html5.canvas.height);
	html5.context.restore();

	player.v = [0,0]

	player.animation.pause();

	if (html5.keyboard[html5.keyUp])
		player.v = vm.copy(dir[0]);
	if (html5.keyboard[html5.keyDown])
		player.v = vm.copy(dir[1]);
	if (html5.keyboard[html5.keyLeft])
		player.v = vm.copy(dir[2]);
	if (html5.keyboard[html5.keyRight])
		player.v = vm.copy(dir[3]);

	if (vm.len (player.v)) {
		player.animation.play();
	}

	// Call update again
	setTimeout (update, 17);
}

function begin () {
	html5.getCanvas2dContext();
	html5.loadImage ("images/0.png", "0");
	html5.loadImage ("images/1.png", "1");
	html5.loadImage ("images/2.png", "2");
	html5.loadImage ("images/3.png", "3");

	for (var i=0;i<8;i++)
		html5.loadImage ("images/wizard/"+i+".png", "w"+i);

	html5.context.webkitImageSmoothingEnabled = false;

	physics = new Physics();
	buf = new Buffer (html5.canvas.width, html5.canvas.height);
	lg = new LevelGenerator([html5.canvas.width,
							html5.canvas.height]);
	lg.generate(null);
	
	drawBSP(lg.root);

	buf.invert();
	buf.addWalls();

	player = new DynamicObject();
	player.p = [600,600];
	player.circles[0].c = [32,60];
	player.circles[0].r = 4;
	player.circles.push(new Circle([16,60],4));
	player.circles.push(new Circle([48,60],4));
	physics.d_objects.push(player);

	player.animation = new Animation (0.1, ["w0","w1","w2","w3","w4","w5","w6","w7"]);

	//buf.fillRect (0,0,10,10);

	if (html5.canvas && html5.context)
		setTimeout (update, 0);
}
