//context
var canvas = document.querySelector("#canvas", {stencil: true});
canvas.width = 853;
canvas.height = 480;
// canvas.width = 512;
// canvas.height = 512;

var gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl"));
var viewportWidth = canvas.width;
var viewportHeight = canvas.height;
var shadowViewPortWidth = 512;
var shadowViewPortHeight = 512;

//-------------------------------------------------------------------------------------------------------------
//  matrices used by normal rendering
//-------------------------------------------------------------------------------------------------------------
//static
var projectionMatrix = mat4.create();
var viewMatrix = mat4.create();
var VPMatrix = mat4.create();

// main camera
// opengl -45.086  -10.548  131.721  -> -29.134   -6.732  -24.9
// fov 31.834
// near clip 41.145
// far clip 394.625
var eyeCoord = vec3.fromValues(-45.086, -10.548, 131.721);
var eyeLookAtCoord = vec3.fromValues(-29.134, -6.732, -24.9);
var eyeUpDir = vec3.fromValues(0, 1, 0);
mat4.perspective(projectionMatrix, 0.5556, viewportWidth / viewportHeight, 41.145, 394.625);
// eye coordinate is also coded in shader to calculate specular, update this values in both places if needed.
mat4.lookAt(viewMatrix, eyeCoord, eyeLookAtCoord, eyeUpDir);
mat4.multiply(VPMatrix, projectionMatrix, viewMatrix);

var objBaseColor_ambient = vec3.fromValues(0.7, 0.7, 0.7);
var objBaseColor_diffuse = vec3.fromValues(0.7, 0.7, 0.7);
var objBaseColor_specular = vec3.fromValues(0.9, 0.9, 0.9);
var warmLightDir = vec3.fromValues(-83.064, -1.99, -173.467);
vec3.normalize(warmLightDir, warmLightDir);
var warmLightColor = vec3.fromValues(1.0, 1.0, 0.6);
var coldLightDir = vec3.fromValues(0.0, 1.0, 0.0);
vec3.normalize(coldLightDir, coldLightDir);
var coldLightColor = vec3.fromValues(0.196, 0.361, 0.608);
var ambientLightColor = vec3.fromValues(0.3, 0.3, 0.3);

//change in each frame
var m_modelMatrix = mat4.create();
var w_modelMatrix = mat4.create();
var wallMVPMatrix = mat4.create();
mat4.multiply(wallMVPMatrix, VPMatrix, w_modelMatrix);

var MVPMatrix = mat4.create();
var normalMatrix = mat3.create();

//-------------------------------------------------------------------------------------------------------------
//  matrices used by shadow rendering
//-------------------------------------------------------------------------------------------------------------
var shadowProjectionMatrix = mat4.create();
var shadowViewMatrix = mat4.create();
var shadowVPMatrix = mat4.create();

var wallShadowMVPMatrix = mat4.create();

// 用来投射阴影的暖光
// 83.064 / 1.99 / 173.467 -> 0 0 0
// 用来绘制投影的镜头的位置也是同上
// fov 18.3833
// near clip 152.723
// far clip 351.216

//static
var shadowEyeCoord = vec3.fromValues(83.064, 1.99, 173.467);
var shadowEyeLookAt = vec3.fromValues(0, 0, 0);
var shadowEyeUpDir = vec3.fromValues(0, 1, 0);
mat4.perspective(shadowProjectionMatrix, 0.3287, shadowViewPortWidth / shadowViewPortHeight, 152.723, 351.216);
//this is the same as diffuse light source direction.
mat4.lookAt(shadowViewMatrix, shadowEyeCoord, shadowEyeLookAt, shadowEyeUpDir);
mat4.multiply(shadowVPMatrix, shadowProjectionMatrix, shadowViewMatrix);
mat4.multiply(wallShadowMVPMatrix, shadowVPMatrix, w_modelMatrix);
//change in every frame
var shadowMVPMatrix = mat4.create();

function createProgram(vertexShaderId, fragmentShaderId, vertexShaderSrc, fragmentShaderSrc) {
    var program = gl.createProgram();
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var vertexShaderSource = vertexShaderSrc || document.querySelector(vertexShaderId).text;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    var vertexShaderCompiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    if (!vertexShaderCompiled) {
        console.log("Failed to compile vertex shader: " + vertexShaderId);
        var compilationLog = gl.getShaderInfoLog(vertexShader);
        console.log('Shader compiler log: ' + compilationLog);
    }

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    var fragmentShaderSource = fragmentShaderSrc || document.querySelector(fragmentShaderId).text;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    var backgroundFragmentShaderCompiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if (!backgroundFragmentShaderCompiled) {
        console.log("Failed to compile fragment shader: " + fragmentShaderId);
        var compilationLog = gl.getShaderInfoLog(fragmentShader);
        console.log('Shader compiler log: ' + compilationLog);
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.log("program validation failed: " + vertexShaderId + " " + fragmentShaderId);
    }
    return program;
}

//-------------------------------------------------------------------------------------------------------------
//  set up program to render the mysterious object.
//-------------------------------------------------------------------------------------------------------------
//create normal program
var normalProgram;
var n_aVertexPosition, n_aNormal, n_uObjMPV, n_uObjM, n_uNormalM;
var n_baseColorAmbient, n_baseColorDiffuse, n_baseColorSpecular,
    n_warmLightDir, n_warmLightColor, n_coldLightDir, n_coldLightColor, n_ambientLightColor;
var n_shininess, n_eyeCd;
var n_uShadowMVP,
    n_uShadowMap;

function createNormalProgram(vertexShaderSrc, fragmentShaderSrc){
    normalProgram = createProgram("#shader-vertex", "#shader-fragment", vertexShaderSrc, fragmentShaderSrc);
    //get attribute locations of normal program
    //vertice positions and normal positions
    n_aVertexPosition = gl.getAttribLocation(normalProgram, "aVertexPosition");
    n_aNormal = gl.getAttribLocation(normalProgram, "aNormal");
    //MVP matrix and normal matrix
    n_uObjMPV = gl.getUniformLocation(normalProgram, "uObjMVP");
    n_uObjM = gl.getUniformLocation(normalProgram, "uObjM");
    n_uNormalM = gl.getUniformLocation(normalProgram, "uNormalM");
    //colors & lights
    n_baseColorAmbient = gl.getUniformLocation(normalProgram, "mysObjBaseColor.ambient");
    n_baseColorDiffuse = gl.getUniformLocation(normalProgram, "mysObjBaseColor.diffuse");
    n_baseColorSpecular = gl.getUniformLocation(normalProgram, "mysObjBaseColor.specular");
    n_warmLightDir = gl.getUniformLocation(normalProgram, "warmLight.direction");
    n_warmLightColor = gl.getUniformLocation(normalProgram, "warmLight.color");
    n_coldLightDir = gl.getUniformLocation(normalProgram, "coldLight.direction");
    n_coldLightColor = gl.getUniformLocation(normalProgram, "coldLight.color");
    n_ambientLightColor = gl.getUniformLocation(normalProgram, "ambientLightColor");
    n_eyeCd = gl.getUniformLocation(normalProgram, "eyeCd");
    n_shininess = gl.getUniformLocation(normalProgram, "shininess");

    //shadow MVP matrix and shadow map
    n_uShadowMVP = gl.getUniformLocation(normalProgram, "uShadowMVP");
    n_uShadowMap = gl.getUniformLocation(normalProgram, "uShadowMap");
}

//var sp_aVertexPosition = gl.getAttribLocation(specularProgram, "aVertexPosition");
//var sp_aNormal = gl.getAttribLocation(specularProgram, "aNormal");

//-------------------------------------------------------------------------------------------------------------
//  set up program to draw shadow maps that store information about shadows casted by the mysterious object
//-------------------------------------------------------------------------------------------------------------
//create shadow program
var shadowProgram;
var s_aVertexPosition, s_uObjMVP;

function createShadowProgram(vertexShaderSrc, fragmentShaderSrc){
    shadowProgram = createProgram("#shadow-shader-vertex", "#shadow-shader-fragment", vertexShaderSrc, fragmentShaderSrc);
    //get attribute location of shadow program
    s_aVertexPosition = gl.getAttribLocation(shadowProgram, "aVertexPosition");
    s_uObjMVP = gl.getUniformLocation(shadowProgram, "uObjMVP");
}

//-------------------------------------------------------------------------------------------------------------
// set up program to render the wall
//-------------------------------------------------------------------------------------------------------------
var wallProgram;
var w_aVertexPosition, w_uObjMVP, w_uShadowMVP, w_uShadowMap;

function createWallProgram(vertexShaderSrc, fragmentShaderSrc){
    wallProgram = createProgram("#wall-shader-vertex", "#wall-shader-fragment", vertexShaderSrc, fragmentShaderSrc);
    w_aVertexPosition = gl.getAttribLocation(wallProgram, "aVertexPosition");
    w_uObjMVP = gl.getUniformLocation(wallProgram, "uObjMVP");
    w_uShadowMVP = gl.getUniformLocation(wallProgram, "uShadowMVP");
    w_uShadowMap = gl.getUniformLocation(wallProgram, "uShadowMap");
}

//-------------------------------------------------------------------------------------------------------------
//  set up program to draw the background
//-------------------------------------------------------------------------------------------------------------
var backgroundProgram;
var b_aVertexPosition, b_vTextureCoordinate, b_uBgTexture;

function createBackgroundProgram(vertexShaderSrc, fragmentShaderSrc){
    backgroundProgram = createProgram("#background-shader-vertex", "#background-shader-fragment", vertexShaderSrc, fragmentShaderSrc);
    b_aVertexPosition = gl.getAttribLocation(backgroundProgram, "aVertexPosition");
    b_vTextureCoordinate = gl.getAttribLocation(backgroundProgram, "aTexCd");
    b_uBgTexture = gl.getUniformLocation(backgroundProgram, "uBackgroundTexture");
}

//-------------------------------------------------------------------------------------------------------------
//  model data set up
//-------------------------------------------------------------------------------------------------------------
//introduce the vertices, normals and indices of the model, in this case its a cube.
var loader = new OBJDoc();

var m_vertexBuffer = gl.createBuffer();
var m_normalsBuffer = gl.createBuffer();
var m_elementBuffer = gl.createBuffer();
var w_vertexBuffer = gl.createBuffer();
var w_normalBuffer = gl.createBuffer();
var w_elementBuffer = gl.createBuffer();

var m_indices_number;
var w_indices_number;

var b_vtBuffer = gl.createBuffer();
var g_quadBuffer = gl.createBuffer();

var b_vtSize;
var b_vertices_number;

var g_quadSize;
var g_quad_vertices_number;

function setupBuffers(dataStr){
    loader.parse(dataStr, 2.5); //scale should be 2.5
    var data = loader.getDrawingInfo();

    //mysterious object related
    //Float32 corresponds to gl.FLOAT
    var mysteriousObjectVertices = data.TorusKnot.vertices;

    //Float32 corresponds to gl.FLOAT
    var mysteriousObjectNormals = data.TorusKnot.normals;

    //Uint16Array correspond to gl.UNSIGNED_SHORT
    var mysteriousObjectIndices = data.TorusKnot.indices;

    //var mysteriousObjectVertices = new Float32Array([
    //    10.0, 10.0, 10.0, -10.0, 10.0, 10.0, -10.0, -10.0, 10.0, 10.0, -10.0, 10.0,
    //    10.0, 10.0, 10.0, 10.0, -10.0, 10.0, 10.0, -10.0, -10.0, 10.0, 10.0, -10.0,
    //    10.0, 10.0, 10.0, 10.0, 10.0, -10.0, -10.0, 10.0, -10.0, -10.0, 10.0, 10.0,
    //    -10.0, 10.0, 10.0, -10.0, 10.0, -10.0, -10.0, -10.0, -10.0, -10.0, -10.0, 10.0,
    //    -10.0, -10.0, -10.0, 10.0, -10.0, -10.0, 10.0, -10.0, 10.0, -10.0, -10.0, 10.0,
    //    10.0, -10.0, -10.0, -10.0, -10.0, -10.0, -10.0, 10.0, -10.0, 10.0, 10.0, -10.0]);
    //
    //var mysteriousObjectNormals = new Float32Array([
    //    0.0, 0.0, 10.0, 0.0, 0.0, 10.0, 0.0, 0.0, 10.0, 0.0, 0.0, 10.0,
    //    10.0, 0.0, 0.0, 10.0, 0.0, 0.0, 10.0, 0.0, 0.0, 10.0, 0.0, 0.0,
    //    0.0, 10.0, 0.0, 0.0, 10.0, 0.0, 0.0, 10.0, 0.0, 0.0, 10.0, 0.0,
    //    -10.0, 0.0, 0.0, -10.0, 0.0, 0.0, -10.0, 0.0, 0.0, -10.0, 0.0, 0.0,
    //    0.0, -10.0, 0.0, 0.0, -10.0, 0.0, 0.0, -10.0, 0.0, 0.0, -10.0, 0.0,
    //    0.0, 0.0, -10.0, 0.0, 0.0, -10.0, 0.0, 0.0, -10.0, 0.0, 0.0, -10.0]);
    //
    //var mysteriousObjectIndices = new Uint16Array([
    //    0, 1, 2, 0, 2, 3,
    //    4, 5, 6, 4, 6, 7,
    //    8, 9, 10, 8, 10, 11,
    //    12, 13, 14, 12, 14, 15,
    //    16, 17, 18, 16, 18, 19,
    //    20, 21, 22, 20, 22, 23]);

    gl.bindBuffer(gl.ARRAY_BUFFER, m_vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mysteriousObjectVertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, m_normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mysteriousObjectNormals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m_elementBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mysteriousObjectIndices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    m_indices_number = mysteriousObjectIndices.length;

    //wall related
    var wallVertices = data.Plane.vertices;
    var wallNormals = data.Plane.normals;
    var wallIndices = data.Plane.indices;


    gl.bindBuffer(gl.ARRAY_BUFFER, w_vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, wallVertices, gl.STATIC_DRAW);


    gl.bindBuffer(gl.ARRAY_BUFFER, w_normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, wallNormals, gl.STATIC_DRAW);


    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, w_elementBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, wallIndices, gl.STATIC_DRAW);

    w_indices_number = wallIndices.length;

    //rectangular as background
    var verticesTexCoords = new Float32Array([
        //for each line, the two on the left are vertices coordinates,
        //and the two on the right are textures coordinates
        -1.0,  1.0, 0.0, 1.0,
        -1.0, -1.0, 0.0, 0.0,
        1.0,  1.0, 1.0, 1.0,
        1.0, -1.0, 1.0, 0.0
    ]);


    gl.bindBuffer(gl.ARRAY_BUFFER, b_vtBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
    b_vtSize = verticesTexCoords.BYTES_PER_ELEMENT;
    b_vertices_number = 4;

    //general quad
    var generalQuadCoords = new Float32Array([-1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0]);//use strap

    gl.bindBuffer(gl.ARRAY_BUFFER, g_quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, generalQuadCoords, gl.STATIC_DRAW);
    g_quadSize = generalQuadCoords.BYTES_PER_ELEMENT;
    g_quad_vertices_number = 4;

    //reset all binding to clean up.
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

}

//-------------------------------------------------------------------------------------------------------------
//  shadow frame buffer
//-------------------------------------------------------------------------------------------------------------
/*
 by default, the webgl system draws using a color buffer and, when using the hidden surface removal function, a depth buffer.
 The final image is kept in the color buffer. The frame buffer object is an alternative mechanism that I can use instead of a color
 buffer or a depth buffer. Unlike a color buffer, the content drawn in a frame buffer object is not directly displayed on the <canvas>.
 And I get a chance to perform various processing.
 */
//create frame buffer.
var shadowFrameBuffer;
function setupShadowMapFrameBuffer(){
    shadowFrameBuffer = gl.createFramebuffer();
    //bind
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFrameBuffer);

    //set up the texture of this frame buffer, its used as a replacement of default color buffer.
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    /*
     the 1st parameter: indicates we are configuring gl.TEXTURE_2D, which now points to our texture.

     the 2nd parameter: says the mipmap level, since we are not useing mipmapping for this texture we will make it 0, which
     means base level.

     the 3rd parameter: the internal format of the image, we will use rgba here, as it works with our pack and unpack function
     in the shader.

     the 4th parameter & 5 th parameters: the width and height of the texture.

     the 5th parameter: border width, 0. not sure what this is for.

     the 6th parameter: in webgl this must be the same as 3rd parameter, the internal format of the texture.

     the 7th parameter: the data type of a texel, these types are used to compress image. I use unsigned byte here (the largest type),
     because image compression and size is not a concern in here, and this seems to work with the pack and unpack function in the shader.

     the 8th parameter: the image data. in this case its null, because i am not loading an external image into this texture.
     */
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, shadowViewPortWidth, shadowViewPortHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    //specify how we do min / max filtering.
    //the default value for gl.TEXTURE_MIN_FILTER is gl.NEAREST_MIPMAP_LINEAR. Since I am not using mipmap here i will just change it to gl.NEAREST
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    /*
     a render is a texture with a hint - that you won't expect some functionality from them. You only use it when you will never use it
     as a texture. Because the graphic card knows you won't use some certain functionalities, it can do some optimizations. However,
     there is no much difference nowdays. This render buffer is used as a replacement of the default render buffer.
     */
    var depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    //second parameter says that this render buffer is used as a depth buffer, and the buffer storage will be configured accordingly.
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, shadowViewPortWidth, shadowViewPortHeight);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    /*
     finally i will bind this texture to my shadow frame buffer.

     gl.COLOR_ATTACHMENT0 says I will bind the texture to the attachment point "gl.COLOR_ATTACHMENT0". a frame buffer in webgl has three
     attachment points: COLOR_ATTACHMENT0, DEPTH_ATTACHMENT, and STENCIL_ATTACHMENT. You sort of know which attachment is for what by reading
     their names.

     The last argument is mipmapping level, I am not using mipmapping so its 0 (base level)
     */
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    //bind the render buffer to attachment point "gl.DEPTH_ATTACHMENT"
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    //check if everything is ok with this frame buffer.
    var shadowFrameBufferStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (gl.FRAMEBUFFER_COMPLETE !== shadowFrameBufferStatus)
        console.log("shadow frame buffer is incomplete: " + shadowFrameBufferStatus.toString());

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}
setupShadowMapFrameBuffer();

//-------------------------------------------------------------------------------------------------------------
//  configure background texture
//-------------------------------------------------------------------------------------------------------------
function setupBackgroundTexture(image){
    var bgTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, bgTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

//-------------------------------------------------------------------------------------------------------------
//  render shadow map
//-------------------------------------------------------------------------------------------------------------
function renderShadowMapf() {
    //switch to shadow shaders
    gl.useProgram(shadowProgram);
    //the second argument is transpose, which is always false in webgl
    gl.uniformMatrix4fv(s_uObjMVP, false, shadowMVPMatrix);

    // draw the mysterious object
    // upload vertex buffer to shadow vertex shader
    gl.bindBuffer(gl.ARRAY_BUFFER, m_vertexBuffer);
    //the arguments for gl.vertexAttribPointer are: uint index, int size, enum type, bool normalized, long stride, and long offset
    gl.vertexAttribPointer(s_aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(s_aVertexPosition);

    //bind element buffer, draw shadow (store depth information in texture)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m_elementBuffer);
    //gl.UNSIGNED_SHORT corresponds to Uint16Array
    gl.drawElements(gl.TRIANGLES, m_indices_number, gl.UNSIGNED_SHORT, 0);

    // draw the wall
    gl.uniformMatrix4fv(s_uObjMVP, false, wallShadowMVPMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, w_vertexBuffer);
    gl.vertexAttribPointer(s_aVertexPosition, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, w_elementBuffer);
    gl.drawElements(gl.TRIANGLES, w_indices_number, gl.UNSIGNED_SHORT, 0);
}

function renderShadowMapr(){
    //switch to shadow shaders
    gl.useProgram(shadowProgram);
    //the second argument is transpose, which is always false in webgl
    gl.uniformMatrix4fv(s_uObjMVP, false, shadowMVPMatrix);

    // draw the mysterious object
    // upload vertex buffer to shadow vertex shader
    gl.bindBuffer(gl.ARRAY_BUFFER, m_vertexBuffer);
    //the arguments for gl.vertexAttribPointer are: uint index, int size, enum type, bool normalized, long stride, and long offset
    gl.vertexAttribPointer(s_aVertexPosition, 3, gl.FLOAT, false, 0, 0);

    //bind element buffer, draw shadow (store depth information in texture)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m_elementBuffer);
    //gl.UNSIGNED_SHORT corresponds to Uint16Array
    gl.drawElements(gl.TRIANGLES, m_indices_number, gl.UNSIGNED_SHORT, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, w_vertexBuffer);
    gl.vertexAttribPointer(s_aVertexPosition, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, w_elementBuffer);
    gl.drawElements(gl.TRIANGLES, w_indices_number, gl.UNSIGNED_SHORT, 0);
}


//-------------------------------------------------------------------------------------------------------------
//  background rendering
//-------------------------------------------------------------------------------------------------------------
function renderBackgroundf(){
    gl.useProgram(backgroundProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, b_vtBuffer);
    gl.vertexAttribPointer(b_aVertexPosition, 2, gl.FLOAT, false, b_vtSize * 4, 0);
    gl.enableVertexAttribArray(b_aVertexPosition);
    gl.vertexAttribPointer(b_vTextureCoordinate, 2, gl.FLOAT, false, b_vtSize * 4, b_vtSize * 2);
    gl.enableVertexAttribArray(b_vTextureCoordinate);
    gl.uniform1i(b_uBgTexture, 1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, b_vertices_number);
}

function renderBackgroundr(){
    gl.useProgram(backgroundProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, b_vtBuffer);
    gl.vertexAttribPointer(b_aVertexPosition, 2, gl.FLOAT, false, b_vtSize * 4, 0);
    gl.vertexAttribPointer(b_vTextureCoordinate, 2, gl.FLOAT, false, b_vtSize * 4, b_vtSize * 2);
    gl.uniform1i(b_uBgTexture, 1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, b_vertices_number);
}

//-------------------------------------------------------------------------------------------------------------
//  normal rendering
//-------------------------------------------------------------------------------------------------------------
function renderMysteriousObjectf(){
    //switch to shaders used for normal rendering
    gl.useProgram(normalProgram);

    gl.uniform3fv(n_baseColorAmbient, objBaseColor_ambient);
    gl.uniform3fv(n_baseColorDiffuse, objBaseColor_diffuse);
    gl.uniform3fv(n_baseColorSpecular, objBaseColor_specular);
    gl.uniform3fv(n_warmLightDir, warmLightDir);
    gl.uniform3fv(n_warmLightColor, warmLightColor);
    gl.uniform3fv(n_coldLightDir, coldLightDir);
    gl.uniform3fv(n_coldLightColor, coldLightColor);
    gl.uniform3fv(n_ambientLightColor, ambientLightColor);

    gl.uniform1f(n_shininess, 8.0);
    gl.uniform3fv(n_eyeCd, eyeCoord);

    //upload shadow mvp matrix
    gl.uniformMatrix4fv(n_uShadowMVP, false, shadowMVPMatrix);
    //upload shadow map
    //link the texture2D of gl.TEXTURE0 (by specifying 0 as the second argument) to n_uShadowMap
    gl.uniform1i(n_uShadowMap, 0);

    gl.uniformMatrix4fv(n_uObjMPV, false, MVPMatrix);
    gl.uniformMatrix3fv(n_uNormalM, false, normalMatrix);

    // draw the mysterious object
    // upload vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, m_vertexBuffer);
    gl.vertexAttribPointer(n_aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    //will need to manually enable a attribute array
    gl.enableVertexAttribArray(n_aVertexPosition);

    //upload normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, m_normalsBuffer);
    gl.vertexAttribPointer(n_aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(n_aNormal);

    //bind the element buffer and draw
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m_elementBuffer);
    gl.drawElements(gl.TRIANGLES, m_indices_number, gl.UNSIGNED_SHORT, 0);
}

function renderMysteriousObjectr(){
    gl.useProgram(normalProgram);

    gl.uniformMatrix4fv(n_uShadowMVP, false, shadowMVPMatrix);
    gl.uniformMatrix4fv(n_uObjMPV, false, MVPMatrix);

    gl.uniformMatrix3fv(n_uNormalM, false, normalMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, m_vertexBuffer);
    gl.vertexAttribPointer(n_aVertexPosition, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, m_normalsBuffer);
    gl.vertexAttribPointer(n_aNormal, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m_elementBuffer);
    gl.drawElements(gl.TRIANGLES, m_indices_number, gl.UNSIGNED_SHORT, 0);
}

//-------------------------------------------------------------------------------------------------------------
//  wall rendering
//-------------------------------------------------------------------------------------------------------------
function renderWallf(){
    gl.useProgram(wallProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, w_vertexBuffer);

    gl.vertexAttribPointer(w_aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(w_aVertexPosition);

    gl.uniformMatrix4fv(w_uObjMVP, false, wallMVPMatrix);
    gl.uniformMatrix4fv(w_uShadowMVP, false, wallShadowMVPMatrix);

    gl.uniform1i(w_uShadowMap, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, w_elementBuffer);
    gl.drawElements(gl.TRIANGLES, w_indices_number, gl.UNSIGNED_SHORT, 0);
}


function renderWallr(){
    gl.useProgram(wallProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, w_vertexBuffer);

    gl.vertexAttribPointer(w_aVertexPosition, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, w_elementBuffer);
    gl.drawElements(gl.TRIANGLES, w_indices_number, gl.UNSIGNED_SHORT, 0);
}

//preparations
var startDrawingIfPrepared = (function(){
    var count = 6;

    return function(){
        --count;
        if(count === 0)
            drawf();
    }
})();

function play(){
    //common settings
    //there is no need to draw back faces
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    loadShadersAndCreateProgram("shaders/mysObjVertex.glsl", "shaders/mysObjFrag.glsl", createNormalProgram);
    loadShadersAndCreateProgram("shaders/shadowVertex.glsl", "shaders/shadowFrag.glsl", createShadowProgram);
    loadShadersAndCreateProgram("shaders/wallVertex.glsl", "shaders/wallFrag.glsl", createWallProgram);
    loadShadersAndCreateProgram("shaders/bgVertex.glsl", "shaders/bgFrag.glsl", createBackgroundProgram);
    loadBackgroundImage();
    loadObjModelData();

}

function loadShadersAndCreateProgram(vertexShaderPath, fragmentShaderPath, createProgramCallback) {
    var vertexShader, fragmentShader;
    $.get(vertexShaderPath, function(s){
        vertexShader = s;
        if(vertexShader && fragmentShader) {
            createProgramCallback(vertexShader, fragmentShader);
            startDrawingIfPrepared();
        }
    });

    $.get(fragmentShaderPath, function(s){
        fragmentShader = s;
        if(vertexShader && fragmentShader) {
            createProgramCallback(vertexShader, fragmentShader);
            startDrawingIfPrepared();
        }
    });
}

function loadBackgroundImage(){
    var bgImg = new Image();
    bgImg.onload = function(){
        setupBackgroundTexture(bgImg);
        startDrawingIfPrepared();
    };
    bgImg.src="materials/bg.png";
}

function loadObjModelData(){
    $.get("models/models.obj", function(dataStr) {
        setupBuffers(dataStr);
        startDrawingIfPrepared();
    });
}

function initStats(){
    var stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    $("#Stats-output").append(stats.domElement);
    return stats;
}

var stats = initStats();

function updateUniformsr(){
    if(d_angleX !== 0 || d_angleY !==0) {
        mat4.rotateX(m_modelMatrix, m_modelMatrix, d_angleX);
        mat4.rotateY(m_modelMatrix, m_modelMatrix, d_angleY);

        //calculate mvp matrix
        mat4.multiply(MVPMatrix, VPMatrix, m_modelMatrix);

        //calculate normal matrix
        mat3.normalFromMat4(normalMatrix, m_modelMatrix);

        //calculate the shadow mvp matrix and upload it
        mat4.multiply(shadowMVPMatrix, shadowVPMatrix, m_modelMatrix);
    }
}

function updateUnformsf(){
    //calculate mvp matrix
    mat4.multiply(MVPMatrix, VPMatrix, m_modelMatrix);

    //calculate normal matrix
    mat3.normalFromMat4(normalMatrix, m_modelMatrix);

    //calculate the shadow mvp matrix and upload it
    mat4.multiply(shadowMVPMatrix, shadowVPMatrix, m_modelMatrix);
}

var d_angleX = 0, d_angleY = 0; //delta angle x, delta angle y
var mouseStartX = 0, mouseStartY = 0;
var mouseX = 0, mouseY = 0;
var maxAngelPerDrag = Math.PI;

function enableMouseInteraction(trigger){

    var dragging = false;

    function enableMouseTracking(trigger){
        trigger.addEventListener("mousemove", function(event){
            if(dragging) {
                mouseX = event.clientX;
                mouseY = event.clientY;
            }
        });
    }

    /**
     * this function only works when 'enableMouseTracking' is called first
     * @param canvas
     */
    function enableModelDragging(trigger){
        trigger.addEventListener("mousedown", function(event){
            dragging = true;

            mouseStartX = event.clientX;
            mouseStartY = event.clientY;
            mouseX = event.clientX;
            mouseY = event.clientY;
        });

        window.addEventListener("mouseup", function(){
            dragging = false;
        });
    }

    enableMouseTracking(trigger);
    enableModelDragging(trigger);
}

enableMouseInteraction(canvas);

function drawf(){
    stats.update();

    updateUnformsf();

    gl.disable(gl.DEPTH_TEST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, viewportWidth, viewportHeight);
    renderBackgroundf();

    gl.enable(gl.DEPTH_TEST);

    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFrameBuffer);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, shadowViewPortWidth, shadowViewPortHeight);
    renderShadowMapf();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, viewportWidth, viewportHeight);
    renderMysteriousObjectf();

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    renderWallf();

    gl.disable(gl.BLEND);

    drawr();
}

function drawr(){
    stats.update();

    d_angleX = ((mouseY - mouseStartY) / viewportHeight) * maxAngelPerDrag;
    d_angleY = ((mouseX - mouseStartX) / viewportWidth) * maxAngelPerDrag;

    mouseStartX = mouseX;
    mouseStartY = mouseY;

    updateUniformsr();

    requestAnimationFrame(drawr);

    gl.disable(gl.DEPTH_TEST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, viewportWidth, viewportHeight);
    renderBackgroundr();

    gl.enable(gl.DEPTH_TEST);

    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFrameBuffer);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, shadowViewPortWidth, shadowViewPortHeight);
    renderShadowMapr();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, viewportWidth, viewportHeight);
    renderMysteriousObjectr();

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    renderWallr();

    gl.disable(gl.BLEND);
}

play();


/**
 * below are references
 */

function reference_blur_background(){
    gl.disable(gl.DEPTH_TEST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, pingBlurFrameBuffer);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, blurFrameBufferTextureWidth, blurFrameBufferTextureHeight);
    renderBackgroundf();

    gl.bindFramebuffer(gl.FRAMEBUFFER, pongBlurFrameBuffer);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    blur(verticalBlurProgram, vb_aVertexPosition, vb_offsets, vb_weights, vb_image,
        vb_viewportWidth, vb_viewportHeight, blurFrameBufferTextureWidth, blurFrameBufferTextureHeight, pingBlurFrameBuffer.textureUnit);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, viewportWidth, viewportHeight);
    blur(horizontalBlurProgram, hb_aVertexPosition, hb_offsets, hb_weights, hb_image,
        hb_viewportWidth, hb_viewportHeight, viewportWidth, viewportHeight, pongBlurFrameBuffer.textureUnit);
}



