
#ifdef GL_ES
precision highp float;
#endif

varying vec2 vUv;
varying vec3 norm;

uniform float health;
uniform vec3 goodShieldColor;
uniform vec3 lowShieldColor;

vec3 mixGoodAndLow(float brightness, float strength) {
  float goodAmount = strength;
  vec3 good = goodAmount * goodShieldColor;
  float lowAmount = max(0.0, 0.1-strength);
  vec3 low = lowAmount * lowShieldColor * max(1.0, brightness);
  return brightness * (good + low);
}

void main()
{
  float x = (vUv.x - 0.5) * 2.0;
  float y = (vUv.y - 0.5) * 2.0;
  float r = x*x + y*y;

  float r1 = 0.5;
  float r2 = 0.7;
  float r3 = 0.9;

  float width = 0.05;
  float factor = 1.0 / width * 2.5;

  float dr1 = abs(r - r1);
  float dr2 = abs(r - r2);
  float dr3 = abs(r - r3);

  float r1Amount = min(1.0, max(0.0, health - 0.0/3.0) * 3.0);
  float r2Amount = min(1.0, max(0.0, health - 1.0/3.0) * 3.0);
  float r3Amount = min(1.0, max(0.0, health - 2.0/3.0) * 3.0);

  float ring1 = sqrt(max(0.0, width - dr1) * factor);
  float ring2 = sqrt(max(0.0, width - dr2) * factor);
  float ring3 = sqrt(max(0.0, width - dr3) * factor);

  vec3 c = mixGoodAndLow(ring1, r1Amount) + mixGoodAndLow(ring2, r2Amount) + mixGoodAndLow(ring3, r3Amount);

  gl_FragColor = vec4(c, 1.0);
}