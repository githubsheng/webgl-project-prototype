//context, programs, and frame buffers
var gl;
var normalProgram;
var shadowProgram;
var frameBuffer;

//matrices used by normal rendering
var projectionMatrix = mat4.create();
var viewMatrix = mat4.create();
var VPMatrix = mat4.create();
var identityMatrix = mat4.create();

//matrices used by shadow rendering
var shadowProjectionMatrix = mat4.create();
var shadowViewMatrix = mat4.create();
var shadowVPMatrix = mat4.create();

//create gl context
var canvas =  document.querySelector("#canvas");
var gl = canvas.getContext("webgl");
gl.viewportWidth = canvas.width;
gl.viewportHeight = canvas.height;

//create normal program
normalProgram = gl.createProgram();

//read vertex shader source and compile it
var vertexShader = gl.createShader(gl.VERTEX_SHADER);
var vertexShaderSource = document.querySelector("#shader-vertex").innerText;
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

var compiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
if (!compiled) {
    console.log("Failed to compile vertex shader");
}

//read fragment shader and compile it
var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
var fragmentShaderSource = document.querySelector("#shader-fragment").innerText;
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

var compiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
if (!compiled) {
    console.log("Failed to compile fragment shader");
}

//attach the shaders to normal program and link program
gl.attachShader(normalProgram, vertexShader);
gl.attachShader(normalProgram, fragmentShader);
gl.linkProgram(normalProgram);

//get attribute locations of normal program
//vertice positions and normal positions
normalProgram.aVertexPosition = gl.getAttribLocation(normalProgram, "aVertexPosition");
normalProgram.aNormal = gl.getAttribLocation(normalProgram, "aNormal");
//MVP matrix and normal matrix
normalProgram.uMVPMatrix = gl.getUniformLocation(normalProgram, "uMVPMatrix");
normalProgram.uNormalMatrix = gl.getUniformLocation(normalProgram, "uNormalMatrix");
//light direction and ambient light color
normalProgram.uLightDir = gl.getUniformLocation(normalProgram, "uLightDir");
normalProgram.uAmbientLightColor = gl.getUniformLocation(normalProgram, "uAmbientLightColor");
//shadow MVP matrix and shadow map
normalProgram.uShadowMVPMatrix = gl.getUniformLocation(normalProgram, "uShadowMVPMatrix");
normalProgram.uShadowMap = gl.getUniformLocation(normalProgram, "uShadowMap");
//object color
normalProgram.uColor = gl.getUniformLocation(normalProgram, "uColor");

//create shadow program
shadowProgram = gl.createProgram();

//read shadow shader source and compile it
var shadowVertexShader = gl.createShader(gl.VERTEX_SHADER);
var shadowVertexShaderSource = document.querySelector("#shadow-shader-vertex").innerText;
gl.shaderSource(shadowVertexShader, shadowVertexShaderSource);
gl.compileShader(shadowVertexShader);

var compiled = gl.getShaderParameter(shadowVertexShader, gl.COMPILE_STATUS);
if (!compiled) {
    console.log("Failed to compile shadow vertex shader");
}

//read shadow fragment shader source and compile it
var shadowFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
var shadowFragmentShaderSource = document.querySelector("#shadow-shader-fragment").innerText;
gl.shaderSource(shadowFragmentShader, shadowFragmentShaderSource);
gl.compileShader(shadowFragmentShader);

var compiled = gl.getShaderParameter(shadowFragmentShader, gl.COMPILE_STATUS);
if (!compiled) {
    console.log("Failed to compile shadow fragment shader");
}

//attach shaders to shadow program and link it
gl.attachShader(shadowProgram, shadowVertexShader);
gl.attachShader(shadowProgram, shadowFragmentShader);
gl.linkProgram(shadowProgram);

//get attribute location of shadow program
shadowProgram.aVertexPosition = gl.getAttribLocation(shadowProgram, "aVertexPosition");
shadowProgram.uMVPMatrix = gl.getUniformLocation(shadowProgram, "uMVPMatrix");

