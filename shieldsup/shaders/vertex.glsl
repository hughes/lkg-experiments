#ifdef GL_ES
precision highp float;
#endif

varying vec2 vUv;
varying vec3 norm;

void main()
{
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  norm = normal;
}
