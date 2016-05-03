precision mediump float;

uniform sampler2D uShadowMap;
varying vec4 vShadowPositionFromLight;

float unpackDepth(const in vec4 rgbaDepth) {
    const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));
    float depth = dot(rgbaDepth, bitShift);
    return depth;
}

float calVisibility() {
    vec3 shadowCoord = (vShadowPositionFromLight.xyz/vShadowPositionFromLight.w)/2.0 + 0.5;
    float recordedDepth = unpackDepth(texture2D(uShadowMap, shadowCoord.xy));
    return (shadowCoord.z > recordedDepth + 0.05) ? 0.3 : 1.0;
}

void main() {
    float visibility = calVisibility();
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0 - visibility);
}
