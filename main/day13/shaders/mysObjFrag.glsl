precision mediump float;

uniform sampler2D uShadowMap;

struct baseColor {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

struct directLight {
    vec3 direction;
    vec3 color;
};

uniform baseColor mysObjBaseColor;
uniform directLight warmLight;
uniform directLight coldLight;
uniform vec3 ambientLightColor;

uniform vec3 eyeCd;
uniform float shininess;

varying vec4 vPos;
varying vec3 vNormal;
varying vec4 vShadowPositionFromLight;

float unpackDepth(const in vec4 rgbaDepth) {
    const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));
    float depth = dot(rgbaDepth, bitShift);
    return depth;
}

float calVisibility() {
    vec3 shadowCoord = (vShadowPositionFromLight.xyz/vShadowPositionFromLight.w)/2.0 + 0.5;
    float recordedDepth = unpackDepth(texture2D(uShadowMap, shadowCoord.xy));
    return (shadowCoord.z > recordedDepth + 0.05) ? 0.4 : 1.0;
}

vec3 calSpecularLight(const in directLight light){
    vec3 posToEye = normalize(eyeCd - vPos.xyz);
    vec3 reflectionVector = normalize(reflect(light.direction, normalize(vNormal)));
    float rdotv = max(dot(reflectionVector, posToEye), 0.0);
    float specularLightWeight = pow(rdotv, shininess);
    //base color * light color * weight;
    return vec3(mysObjBaseColor.specular * light.color * specularLightWeight);
}

vec3 calAmbientLight(){
    return ambientLightColor * mysObjBaseColor.ambient;
}

vec3 calDiffuseLight(const in directLight light){
    vec3 inverseLightDir = light.direction * -1.0;
    float dot = max(dot(inverseLightDir, normalize(vNormal)), 0.0);
    return light.color * mysObjBaseColor.diffuse * dot;
}

void main() {
    vec3 ambientLight = calAmbientLight();
    vec3 coldDiffuseLight = calDiffuseLight(coldLight);
    vec3 coldSpecularLight = calSpecularLight(coldLight);
    //the following two lights are subject to shadow
    float visibility = calVisibility();
    vec3 warmDiffuseLight = calDiffuseLight(warmLight) * visibility;
    vec3 warmSpecularLight = calSpecularLight(warmLight) * visibility;
    vec3 fragColor = vec3(warmDiffuseLight + warmSpecularLight + coldDiffuseLight + coldSpecularLight + ambientLight);
    gl_FragColor = vec4(fragColor, 1.0);
}