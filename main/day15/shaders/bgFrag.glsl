precision mediump float;

uniform sampler2D uBackgroundTexture;

varying vec2 vTexCd;
void main() {
    gl_FragColor = texture2D(uBackgroundTexture, vTexCd);
}