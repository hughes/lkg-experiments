/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Sobel Edge Detection (see https://youtu.be/uihBwtPIBxM)
 *
 * As mentioned in the video the Sobel operator expects a grayscale image as input.
 *
 */

#ifdef GL_ES
precision highp float;
#endif

varying vec2 vUv;
varying vec3 norm;
varying vec3 sNorm;

uniform sampler2D tDiffuse;
uniform vec2 resolution;

void main()
{
  gl_FragColor = vec4((norm + 1.0) / 2.0, 1.0);
}