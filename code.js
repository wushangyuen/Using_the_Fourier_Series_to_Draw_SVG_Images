/*
	The work is made by Phil Danne
	on https://www.tomesoftware.com/labs/using-fourier-series-draw-svg-images/
	and re-edit by Wu Shang-Yuen.
*/

//運算點數及相關設定
var N_of_in = 8000 
var N_of_circles = 500 
var N_of_out = 100000 
var vbox = {width: 1080};
var prepared = false;

//預設開啟追蹤
var follow = true;

//離散傅立葉變換及相關變數
//DFT = Discrete Fourier Transform
var DFT
var leng
var path
var K
var t = 0;

//求平方和的平方根
function hypot([re, im]) {
    return Math.hypot(re, im);
}

//三角函數運算
function expim(im) {
return [Math.cos(im), Math.sin(im)];
}

//加函數
function add([rea, ima], [reb, imb]) {
    return [rea + reb, ima + imb];
}

//乘函數
function mul([rea, ima], [reb, imb]) {
    return [rea * reb - ima * imb, rea * imb + ima * reb];
}

//zoom滑桿宣告
let zoom;

async function setup(){
	
	//取得線上svg檔(可藉由更改網址更改圖像)
    let svg = await fetch("https://raw.githubusercontent.com/wushangyuen/drawing_with_Discrete_Fourier_transform/main/sam.svg")
	
        .then(response => response.text())
        .then(text => (new DOMParser).parseFromString(text, "image/svg+xml"))
        .then(svg => svg.documentElement);

	//生成畫布及滑桿
    createCanvas(1080, 720);
    zoom = createSlider(10,50,10);
    vbox = svg.viewBox.baseVal

	//定位中心
    let path2 = svg.querySelector("path")
    leng = path2.getTotalLength()
    path = Array.from({length: N_of_in}, (_, i) => {
        const {x, y} = path2.getPointAtLength(i / N_of_in * leng);
        return [x - vbox.width / 2, y - vbox.height / 2];
    })
		
	//離散傅立葉變換相關運算
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

	//畫布背景色
    background('black');

    if(prepared){

        const zoom_rate = zoom.value()/10 * width / vbox.width;
        const a = t * 2 / N_of_out * Math.PI;

        //當前位置點
        let cpoint = [0, 0];
        for (let i = 0; i < N_of_circles; ++i) {
        	cpoint = add(cpoint, mul(DFT[i], expim(a * K[i])));
        }

        //跟隨路徑及縮放
        translate(width / 2, height / 2);
        scale(zoom_rate);
        if(follow) translate(-cpoint[0], -cpoint[1]);


        //圓繪圖
        noFill();
        stroke(75);
        for (let i = 0, cpoint = [0, 0]; i < N_of_circles; ++i) {
        const r = hypot(DFT[i]);
        ellipse(cpoint[0], cpoint[1],r*2);
        cpoint = add(cpoint, mul(DFT[i], expim(a * K[i])));
        }


        //線段(向量指向)繪圖 
        stroke(231, 0, 180, 80);
				strokeWeight(1);
        for (let i = 0, cpoint = [0, 0]; i < N_of_circles; ++i) {
            prevP = cpoint;
            cpoint = add(cpoint, mul(DFT[i], expim(a * K[i])))
            line(...prevP,...cpoint);
        }


        //路徑繪圖
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

//按q鍵取消跟隨
function keyPressed(){
    if (key == "q"){
        follow = !follow;
    }
}