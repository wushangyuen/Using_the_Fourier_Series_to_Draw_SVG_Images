/*
	The work is made by Phil Danne
	on https://www.tomesoftware.com/labs/using-fourier-series-draw-svg-images/
	and re-edit by Wu Shang-Yuen.
*/
var N_of_in = 8000 
var N_of_circles = 500 
var N_of_out = 100000 
var vbox = {width: 1080};
var prepared = false;

var follow = true;

var DFT
var leng
var path
var K
var t = 0;


var first = false;
function hypot([re, im]) {
    return Math.hypot(re, im);
}

function expim(im) {
return [Math.cos(im), Math.sin(im)];
}

function add([rea, ima], [reb, imb]) {
    return [rea + reb, ima + imb];
}

function mul([rea, ima], [reb, imb]) {
    return [rea * reb - ima * imb, rea * imb + ima * reb];
}

let zoom;
let speed;

async function setup(){
	
	//get svg ("change the link to make a new drawing")
    let svg = await fetch("https://raw.githubusercontent.com/wushangyuen/drawing_with_Discrete_Fourier_transform/main/sam.svg")
	
        .then(response => response.text())
        .then(text => (new DOMParser).parseFromString(text, "image/svg+xml"))
        .then(svg => svg.documentElement);


    createCanvas(1080, 720);
    zoom = createSlider(10,50,10);
    vbox = svg.viewBox.baseVal

    let path2 = svg.querySelector("path")
    leng = path2.getTotalLength()
    path = Array.from({length: N_of_in}, (_, i) => {
        const {x, y} = path2.getPointAtLength(i / N_of_in * leng);
        return [x - vbox.width / 2, y - vbox.height / 2];
    })

    K = Int16Array.from({length: N_of_circles}, (_, i) => (1 + i >> 1) * (i & 1 ? -1 : 1))

    DFT = Array.from(K, k => {
        let x = [0, 0];
        for (let i = 0, N_of_in = path.length; i < N_of_in; ++i) {
        x = add(x, mul(path[i], expim(k * i / N_of_in * 2 * -Math.PI)));
        }
        return [x[0] / N_of_in, x[1] / N_of_in];
    })

    prepared = true
}
var width = 1080;
const R = [];
function draw() {

	//the background color of the canvas
    background('black');

    if(prepared){

        const zoom_rate = zoom.value()/10 * width / vbox.width;
        const a = t * 2 / N_of_out * Math.PI;

        //current point.
        let cpoint = [0, 0];
        for (let i = 0; i < N_of_circles; ++i) {
        	cpoint = add(cpoint, mul(DFT[i], expim(a * K[i])));
        }

        //zoom
        translate(width / 2, height / 2);
        scale(zoom_rate);
        if(follow) translate(-cpoint[0], -cpoint[1]);


        //circles 
        noFill();
        stroke(75);
        for (let i = 0, cpoint = [0, 0]; i < N_of_circles; ++i) {
        const r = hypot(DFT[i]);
        ellipse(cpoint[0], cpoint[1],r*2);
        cpoint = add(cpoint, mul(DFT[i], expim(a * K[i])));
        }


        //line(arrow) 
        stroke(231, 0, 180, 80);
				strokeWeight(1);
        for (let i = 0, cpoint = [0, 0]; i < N_of_circles; ++i) {
            prevP = cpoint;
            cpoint = add(cpoint, mul(DFT[i], expim(a * K[i])))
            line(...prevP,...cpoint);
        }


        //path 
        beginShape();
        noFill();
        stroke('white');
        if (R.length < N_of_out) R.push(cpoint);
        for (let i = 1, n = R.length; i < n; ++i){
            vertex(...R[i]);
        }
        endShape();
        t+=25;
    }
}

//press q to cancel following
function keyPressed(){
    if (key == "q"){
        follow = !follow;
    }
}