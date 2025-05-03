var din = {}; // data input container
var dout = {}; // data output container

var locals = {
    s: {
	0: -161,
	1: 5
    },
    activity: {
	0: 1.4,
	1: 1.6,
	2: 1.7,
	3: 1.8,
	4: 2
    },
    diettype: {
	0: -1,
	1: 0,
	2: 1
    }
};

function get_values() {
    function get_id( inp, id ) {
	inp[id] = parseInt(document.getElementById(id).value);
    }

    function get_radio( inp, id ) {
	var radios = document.getElementsByName( id );
	for( i=0; i<radios.length; i++ ) {
	    if( radios[i].checked ) {
		inp[id] = parseInt(radios[i].value);
		break;
	    }
	}
    }

    get_radio( din, "gender" );
    get_id( din, "height" );
    get_id( din, "weight" );
    get_id( din, "age" );
    get_radio( din, "activity" );
    get_radio( din, "ratios" );
    get_id( din, "carbratio" );
    get_id( din, "proteinratio" );
    get_id( din, "fatratio" );
    get_radio( din, "diettype" );
    get_id( din, "deficit" );
}

function check( val, min, max ) {
    if( isNaN(val) ) return -1;
    var num = val;
    if( num<min || num>max ) return -1;
    return num;
}

function calculate() {
    function fix( v, id, n ) {
	v[id] = v[id].toFixed(n);
    }

    // local vars based on gender
    if( din.gender == 1 ) { // male
	var s = 5;
    } else {
	var s = -161;
    }

    dout.BMI = din.weight*10000/(din.height*din.height);
    dout.bodyfat = dout.BMI*1.2 + din.age*0.23 - din.gender*10.8 - 5.4;
    dout.leanmass = din.weight*(1-dout.bodyfat/100);
    dout.fatmass = din.weight*dout.bodyfat/100;
    dout.BMR = 10*din.weight + 6.25*din.height - 5*din.age + locals.s[din.gender]; // using Mifflin St Jeor Equation for BMR
    dout.mainteinance = dout.BMR*locals.activity[din.activity];
    dout.goal = dout.mainteinance + din.deficit*locals.diettype[din.diettype];
    dout.carbcal = din.carbratio*dout.goal/100;
    dout.proteincal = din.proteinratio*dout.goal/100;
    dout.fatcal = din.fatratio*dout.goal/100;
    dout.totalcal = dout.goal;
    dout.carbg = dout.carbcal/4;
    dout.proteing = dout.proteincal/4;
    dout.fatg = dout.fatcal/9;
    dout.totalg = dout.carbg + dout.proteing + dout.fatg;

    fix( dout, "BMI", 1 );
    fix( dout, "bodyfat", 1 );
    fix( dout, "leanmass", 1 );
    fix( dout, "fatmass", 1 );
    fix( dout, "BMR", 0 );
    fix( dout, "mainteinance", 0 );
    fix( dout, "goal", 0 );
    fix( dout, "carbg", 0 );
    fix( dout, "proteing", 0 );
    fix( dout, "fatg", 0 );
    fix( dout, "totalg", 0 );
    fix( dout, "carbcal", 0 );
    fix( dout, "proteincal", 0 );
    fix( dout, "fatcal", 0 );
    fix( dout, "totalcal", 0 );
}

function show() {
    for( var k in dout ) {
	document.getElementById( k ).innerHTML = dout[k];
    }
}

function update() {
    update_ratio();
    get_values();
    calculate();
    show();
}

function set_ratio( carb, prot, fat ) {
    document.getElementById("carbratio").value = carb;
    document.getElementById("proteinratio").value = prot;
    document.getElementById("fatratio").value = fat;
}

function update_ratio() {
    cratio = document.getElementById("carbratio").value;
    pratio = document.getElementById("proteinratio").value;
    document.getElementById("fatratio").value = 100 - cratio - pratio;
    
}

set_ratio(40,30,30);

// add auto update when changing input
window.onclick = update;
window.onkeyup = update;
