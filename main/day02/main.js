//context
var canvas = document.querySelector("#canvas");
var gl = canvas.getContext("webgl");
var viewportWidth = canvas.width;
var viewportHeight = canvas.height;

//light source
var lightX = 0;
var lightY = 40;
var lightZ = 2;

//matrices used by normal rendering
//static
var projectionMatrix = mat4.create();
var viewMatrix = mat4.create();
var VPMatrix = mat4.create();
//todo: calculate wall's MVP matrix and normal matrix as wall is never gonna move
//var identityMatrix = mat4.create();

mat4.perspective(projectionMatrix, Math.PI * 0.25, viewportWidth / viewportHeight, 1, 100.0);
mat4.lookAt(viewMatrix, [0, 7, 9], [0, 0, 0], [0, 1, 0]);
mat4.multiply(VPMatrix, projectionMatrix, viewMatrix);

//change in each frame
var m_modelMatrix = mat4.create();
//todo: the following rotates is for test only ,remove it later.
mat4.rotateZ(m_modelMatrix, m_modelMatrix, 0.3);
mat4.rotateY(m_modelMatrix, m_modelMatrix, -0.3);
var MVPMatrix = mat4.create();
var MVMatrix = mat4.create();
var normalMatrix = mat3.create();

//matrices used by shadow rendering
var shadowProjectionMatrix = mat4.create();
var shadowViewMatrix = mat4.create();
var shadowVPMatrix = mat4.create();

//static 
mat4.perspective(shadowProjectionMatrix, Math.PI * 0.4, viewportWidth / viewportHeight, 1, 200.0);
//this is the same as diffuse light source direction.
mat4.lookAt(shadowViewMatrix, [lightX, lightY, lightZ], [0, 0, 0], [0, 1, 0]);
mat4.multiply(shadowVPMatrix, shadowProjectionMatrix, shadowViewMatrix);
//change in every frame
var shadowMVPMatrix = mat4.create();

//create normal program
var normalProgram = gl.createProgram();

//read vertex shader source and compile it
var vertexShader = gl.createShader(gl.VERTEX_SHADER);
var vertexShaderSource = document.querySelector("#shader-vertex").text;
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

var normalVertexShaderCompiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
if (!normalVertexShaderCompiled) {
    console.log("Failed to compile vertex shader");
}

//read fragment shader and compile it
var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
var fragmentShaderSource = document.querySelector("#shader-fragment").text;
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

var normalFragmentShaderCompiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
if (!normalFragmentShaderCompiled) {
    console.log("Failed to compile fragment shader");
}

//attach the shaders to normal program and link program
gl.attachShader(normalProgram, vertexShader);
gl.attachShader(normalProgram, fragmentShader);
gl.linkProgram(normalProgram);

gl.validateProgram(normalProgram);
if (!gl.getProgramParameter(normalProgram, gl.VALIDATE_STATUS)) {
    console.log("normal program validation failed.");
}

//get attribute locations of normal program
//vertice positions and normal positions
var n_aVertexPosition = gl.getAttribLocation(normalProgram, "aVertexPosition");
var n_aNormal = gl.getAttribLocation(normalProgram, "aNormal");
//MVP matrix and normal matrix
var n_uMVPMatrix = gl.getUniformLocation(normalProgram, "uMVPMatrix");
var n_uNormalMatrix = gl.getUniformLocation(normalProgram, "uNormalMatrix");
//light direction and ambient light color
var n_uLightDir = gl.getUniformLocation(normalProgram, "uLightDir");
var n_uAmbientLightColor = gl.getUniformLocation(normalProgram, "uAmbientLightColor");
//shadow MVP matrix and shadow map
var n_uShadowMVPMatrix = gl.getUniformLocation(normalProgram, "uShadowMVPMatrix");
var n_uShadowMap = gl.getUniformLocation(normalProgram, "uShadowMap");
//object color
var n_uColor = gl.getUniformLocation(normalProgram, "uColor");

//create shadow program
var shadowProgram = gl.createProgram();

//read shadow shader source and compile it
var shadowVertexShader = gl.createShader(gl.VERTEX_SHADER);
var shadowVertexShaderSource = document.querySelector("#shadow-shader-vertex").text;
gl.shaderSource(shadowVertexShader, shadowVertexShaderSource);
gl.compileShader(shadowVertexShader);

var shadowVertexShaderCompiled = gl.getShaderParameter(shadowVertexShader, gl.COMPILE_STATUS);
if (!shadowVertexShaderCompiled) {
    console.log("Failed to compile shadow vertex shader");
}

//read shadow fragment shader source and compile it
var shadowFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
var shadowFragmentShaderSource = document.querySelector("#shadow-shader-fragment").text;
gl.shaderSource(shadowFragmentShader, shadowFragmentShaderSource);
gl.compileShader(shadowFragmentShader);

var shadowFragmentShaderCompiled = gl.getShaderParameter(shadowFragmentShader, gl.COMPILE_STATUS);
if (!shadowFragmentShaderCompiled) {
    console.log("Failed to compile shadow fragment shader");
}

//attach shaders to shadow program and link it
gl.attachShader(shadowProgram, shadowVertexShader);
gl.attachShader(shadowProgram, shadowFragmentShader);
gl.linkProgram(shadowProgram);

gl.validateProgram(shadowProgram);
if (!gl.getProgramParameter(normalProgram, gl.VALIDATE_STATUS)) {
    console.log("normal program validation failed.");
}

//get attribute location of shadow program
var s_aVertexPosition = gl.getAttribLocation(shadowProgram, "aVertexPosition");
var s_uMVPMatrix = gl.getUniformLocation(shadowProgram, "uMVPMatrix");

//introduce the vertices, normals and indices of the model, in this case its a cube.
//Float32 corresponds to gl.FLOAT
var mysteriousObjectVertices = new Float32Array([
    1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
    1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,
    1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
    1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0]);

//Float32 corresponds to gl.FLOAT
var mysteriousObjectNormals = new Float32Array([
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0]);

//Uint16Array correspond to gl.UNSIGNED_SHORT
var mysteriousObjectIndices = new Uint16Array([
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11,
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
    20, 21, 22, 20, 22, 23]);

//create vertex buffer
var m_vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, m_vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, mysteriousObjectVertices, gl.STATIC_DRAW);

//create normal buffer
var m_normalsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, m_normalsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, mysteriousObjectNormals, gl.STATIC_DRAW);

//create element buffer
var m_elementBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m_elementBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mysteriousObjectIndices, gl.STATIC_DRAW);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
var m_indices_number = mysteriousObjectIndices.length;

var wallVertices = new Float32Array([
    3.0, -1.7, 2.5, -3.0, -1.7, 2.5, -3.0, -1.7, -2.5, 3.0, -1.7, -2.5
]);
var wallNormals = new Float32Array([
    1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0
]);
var wallIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);

var w_vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, w_vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, wallVertices, gl.STATIC_DRAW);

var w_normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, w_normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, wallNormals, gl.STATIC_DRAW);

var w_indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, w_indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, wallIndices, gl.STATIC_DRAW);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
var w_indices_number = wallIndices.length;


/*
 by default, the webgl system draws using a color buffer and, when using the hidden surface removal function, a depth buffer.
 The final image is kept in the color buffer. The frame buffer object is an alternative mechanism that I can use instead of a color
 buffer or a depth buffer. Unlike a color buffer, the content drawn in a frame buffer object is not directly displayed on the <canvas>.
 And I get a chance to perform various processing.
 */
//create frame buffer.
var shadowFrameBuffer = gl.createFramebuffer();
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
//todo (1): i need to find an appropriate width and height of this texture, preferably just large enough to provide desired details of shadows.
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, viewportWidth, viewportHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
//specify how we do min / max filtering.
//the default value for gl.TEXTURE_MIN_FILTER is gl.NEAREST_MIPMAP_LINEAR. Since I am not using mipmap here i will just change it to gl.LNEAR
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//linear the default value for gl.TEXTURE_MAG_FILTER, so the following call can be omitted.
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.bindTexture(gl.TEXTURE_2D, null);

/*
 a render is a texture with a hint - that you won't expect some functionality from them. You only use it when you will never use it
 as a texture. Because the graphic card knows you won't use some certain functionalities, it can do some optimizations. However,
 there is no much difference nowdays. This render buffer is used as a replacement of the default render buffer.
 */
var depthBuffer = gl.createRenderbuffer();
gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
//second parameter says that this render buffer is used as a depth buffer, and the buffer storage will be configured accordingly.
//todo: see (1)
gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, viewportWidth, viewportHeight);
gl.bindRenderbuffer(gl.RENDERBUFFER, null);

/*
 finally i will bind this texture to my shadow frame buffer.

 gl.COLOR_ATTACHMENT0 says I will bind the texture to the attachment point "gl.COLOR_ATTACHMENT0". a frame buffer in webgl has three
 attachment points: COLOR_ATTACHMENT0, DEPTH_ATTACHMENT, and STENCIL_ATTACHMENT. You sort of know which attachment is for what by reading
 their names.

 Notice that i have already unbind texture from gl.TEXTURE_2D, so webgl won't be able to infer which texture I want to use from gl.TEXTURE_2D,
 therefore I need to supply the texture as well.

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

//configure the gl settings
//set clear color to black.
gl.clearColor(0, 0, 0, 1);
//enable depth test, this is necessary for drawing shadows
gl.enable(gl.DEPTH_TEST);
//there is no need to draw back faces
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);

//switch from default color / render buffer to the frame buffer (actually the frame buffers color and render buffer)
//to see how shadow map is rendered, simply do not switch to shadow frame buffer.
gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFrameBuffer);
//todo adjust the view port width / height according to the width and height of frame buffer's color buffer and depth buffer.
gl.viewport(0, 0, viewportWidth, viewportHeight);
//clear everything.
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//switch to shadow shaders
gl.useProgram(shadowProgram);
//calculate the shadow mvp matrix and upload it
mat4.multiply(shadowMVPMatrix, shadowVPMatrix, m_modelMatrix);
//the second argument is transpose, which is always false in webgl
gl.uniformMatrix4fv(s_uMVPMatrix, false, shadowMVPMatrix);

//upload vertex buffer to shadow vertex shader
gl.bindBuffer(gl.ARRAY_BUFFER, m_vertexBuffer);
//the arguments for gl.vertexAttribPointer are: uint index, int size, enum type, bool normalized, long stride, and long offset
gl.vertexAttribPointer(s_aVertexPosition, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(s_aVertexPosition);

//bind element buffer, draw shadow (store depth information in texture)
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m_elementBuffer);
//gl.UNSIGNED_SHORT corresponds to Uint16Array
gl.drawElements(gl.TRIANGLES, m_indices_number, gl.UNSIGNED_SHORT, 0);

//now switch back to default color buffer and depth buffer
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
//clear color buffer and depth buffer
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//switch to shaders used for normal rendering
gl.useProgram(normalProgram);

//upload diffuse light direction
//todo (2): light direction, base color and ambient light color should be static, i need to move them to the head of this file.
var diffuseLightDirection = vec3.fromValues(lightX, lightY, lightZ);
vec3.normalize(diffuseLightDirection, diffuseLightDirection);
gl.uniform3fv(n_uLightDir, diffuseLightDirection);

//upload base color
//todo: see (2)
var objectColor = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
gl.uniform4fv(n_uColor, objectColor);

//upload ambient light color;
//todo: see (2)
var uAmbientLightColor = vec3.fromValues(0.3, 0.3, 0.3);
gl.uniform3fv(n_uAmbientLightColor, uAmbientLightColor);

//upload shadow mvp matrix
gl.uniformMatrix4fv(n_uShadowMVPMatrix, false, shadowMVPMatrix);
//upload shadow map
//gl.TEXTURE_2D is linked to gl.TEXTURE0
gl.bindTexture(gl.TEXTURE_2D, texture);
//link gl.TEXTURE0 (by specifying 0 as the second argument) to n_uShadowMap
gl.uniform1i(n_uShadowMap, 0);

//calculate mvp matrix
mat4.multiply(MVPMatrix, VPMatrix, m_modelMatrix);
//upload mvp matrix
gl.uniformMatrix4fv(n_uMVPMatrix, false, MVPMatrix);

//calculate normal matrix and upload it
mat4.multiply(MVMatrix, viewMatrix, m_modelMatrix);
mat3.normalFromMat4(normalMatrix, MVMatrix);
gl.uniformMatrix3fv(n_uNormalMatrix, false, normalMatrix);

//upload vertex buffer
gl.bindBuffer(gl.ARRAY_BUFFER, m_vertexBuffer);
gl.vertexAttribPointer(n_aVertexPosition, 3, gl.FLOAT, false, 0, 0);
//will need to manually enable a attribute array
gl.enableVertexAttribArray(n_aVertexPosition);

//upload normal buffer
gl.bindBuffer(gl.ARRAY_BUFFER, m_normalsBuffer);
gl.vertexAttribPointer(n_aNormal, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(n_aNormal);
//done, unbind.
gl.bindBuffer(gl.ARRAY_BUFFER, null);

//bind the element buffer and draw
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m_elementBuffer);
gl.drawElements(gl.TRIANGLES, m_indices_number, gl.UNSIGNED_SHORT, 0);


