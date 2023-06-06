import * as THREE from "three";
// Define your custom vertex shader code
var vertexShader = `
  varying vec3 vNormal;
  varying vec3 interNormal;
  varying vec3 vPosition;

  void main()
  {
    vNormal = normalMatrix * normal;
    interNormal = normalMatrix*normalize(position);
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Define your custom fragment shader code
var fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 interNormal;

  uniform float time;
  uniform float timeScale;
  uniform float dis_frame;

  uniform float fogDensity;
  uniform vec3 fogColor;
  uniform vec3 baseColor;
  uniform vec3 specularColor;

  void main( void ) {
    vec3 lightDirection = normalize(vec3(0.5, 0.7, 0.2)); // Example light direction
    vec3 normal = normalize(vNormal);

    float diffuseStrength = max(dot(normal, lightDirection), 0.0);
    vec3 diffuseColor = baseColor; // Example diffuse color

    float shininess = 32.0; // Example shininess value
    vec3 viewDirection = -normalize(vPosition);

    vec3 ambientColor = vec3(0.2, 0.2, 0.2); // Example ambient color
    vec3 ambient = ambientColor * diffuseColor;

    vec3 diffuse = diffuseColor * diffuseStrength;

    vec3 reflectedLight = reflect(-lightDirection, normal);
    float specularStrength = pow(max(dot(reflectedLight, viewDirection), 0.0), shininess);
    vec3 specular = specularColor * specularStrength;

    vec3 finalColor = ambient + diffuse + specular;

    // Mix the position color with the final color
    finalColor = mix(finalColor, interNormal+ambientColor, 0.02);

    float contourEdge = 1.0 - smoothstep(-4.0, 1.0, dot(interNormal, viewDirection));
    vec3 contourColor = specularColor; // Color for the contour edge

    // Mix the contour color with the final color based on the contour edge
    finalColor = mix(finalColor, contourColor, contourEdge);

    gl_FragColor = vec4(finalColor, ((1.0-timeScale) + timeScale*time)*(dis_frame+0.85));

    float depth = gl_FragCoord.z / gl_FragCoord.w;
    const float LOG2 = 1.442695;
    float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
    fogFactor = 1.0 - clamp( fogFactor, 0.2, 0.8 );

    gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );

  }
`;

const materials = [
  new THREE.ShaderMaterial({
    uniforms: {
      'fogDensity': { value: 0.30 },
      'fogColor': { value: new THREE.Color(0xd9e86b) },
      'baseColor': { value: new THREE.Color(0xCF76DE) },
      'specularColor': { value: new THREE.Color(0xDFC881) },
      'timeScale': { value: 0.03 },
      'time': { value: -1.0 },
      'dis_frame': { value: 1.0 }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
  }),
  new THREE.ShaderMaterial({
    uniforms: {
      'fogDensity': { value: 0.30 },
      'fogColor': { value: new THREE.Color(0xFFEC17) },
      'baseColor': { value: new THREE.Color(0x07AAE0) },
      'specularColor': { value: new THREE.Color(0x00E0D9) },
      'timeScale': { value: 0.03 },
      'time': { value: 1.0 },
      'dis_frame': { value: 1.0 }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
  }),
  new THREE.ShaderMaterial({
    uniforms: {
      'fogDensity': { value: 0.30 },
      'fogColor': { value: new THREE.Color(0x8db3e1) },
      'baseColor': { value: new THREE.Color(0xe5cb4d) },
      'specularColor': { value: new THREE.Color(0xc77d09) },
      'timeScale': { value: 0.4 },
      'time': { value: -5.0 },
      'dis_frame': { value: 1.0 }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
  })
];

export { materials };
