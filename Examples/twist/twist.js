"use strict";

var canvas;
var gl;

var points = [];
var theta = 0;
var delta;
var thetaLoc;
var fullFill = true;

var NumTimesToSubdivide = 3;
var maxValieOfsubdivide = 9;

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    var thetaInput = document.getElementById("theta");
    var tesInput = document.getElementById('tesselation');
    var tesValue = document.getElementById('tesselation-value');
    var fullFillInput = document.getElementById('fullfill');

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }    

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(4, (maxValieOfsubdivide+1)), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation( program, "theta" );

    render();


    // Event listeners

    thetaInput.addEventListener('change', function (event) {
        theta = Math.PI*(this.value)/180;

        render();
    });

    tesInput.addEventListener('change', function (event) {
        tesValue.innerHTML = this.value;
        NumTimesToSubdivide = +this.value;

        render();
    });

    fullFillInput.addEventListener('change', function (event) {
        fullFill = event.target.checked;

        render();
    });
};

function triangle( a, b, c ) {
    points.push( a, b, c );
}

function divideTriangle( a, b, c, count ) {

    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        if (fullFill) {
            divideTriangle (ab, ac, bc, count);    
        }
        
    }
}

function render() {

    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];


    divideTriangle( vertices[0], vertices[1], vertices[2], NumTimesToSubdivide);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));

    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.uniform1f(thetaLoc, theta);
    gl.drawArrays( gl.TRIANGLES, 0, points.length ); 
    points = [];
    
};
