import { createShader, createProgram, degToRad } from '../common/core';
import { matrix4 } from '../common/matrix.js';



const VSHADER_SOURCE = `
  attribute vec4 a_position;
  attribute vec4 a_color;
  uniform mat4 u_matrix;
  varying vec4 v_color;

  void main() {
    gl_Position = u_matrix * a_position;
    v_color = a_color;
  }
`;
// 环境光
// 物体最终的颜色值 = 物体颜色 * 环境光颜色(1.0表示白色最强，减少值可修改光照强度)
const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec3 u_light_color;
  varying vec4 v_color;

  void main() {
    gl_FragColor = v_color * vec4(u_light_color, 1);
  }
`;

//    v6----- v5
//   /|      /|
//  v1------v0|
//  | |     | |
//  | |v7---|-|v4
//  |/      |/
//  v2------v3
const postionColor = new Float32Array([
  80, 80, 80,    1, 1, 1, // v0
  -80, 80, 80,   1, 0, 1, // v1
  -80, -80, 80,  1, 0, 0, // v2
  80, -80, 80,   1, 1, 0, // v3
  80, -80, -80,  0, 1, 0, // v4
  80, 80, -80,   0, 1, 1, // v5
  -80, 80, -80,  0, 0, 1, // v6
  -80, -80, -80, 0, 0, 0, // v7
]);
const indexs = new Uint16Array([
  0,1,2, 0,2,3,
  0,3,4, 0,4,5,
  0,5,6, 0,6,1,
  1,6,7, 1,7,2,
  7,4,3, 7,3,2,
  4,7,6, 4,6,5
]);

export const createCube = (gl: WebGLRenderingContext) => {
  const vShader = createShader(gl, gl.VERTEX_SHADER, VSHADER_SOURCE);
  const fShader = createShader(gl, gl.FRAGMENT_SHADER, FSHADER_SOURCE);
  const program = createProgram(gl, vShader, fShader)!;
  const a_position = gl.getAttribLocation(program, 'a_position');
  const a_color = gl.getAttribLocation(program, 'a_color');
  const u_matrix = gl.getUniformLocation(program, 'u_matrix');
  const u_light_color = gl.getUniformLocation(program, 'u_light_color');

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, postionColor, gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexs, gl.STATIC_DRAW);

  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
        
  gl.enableVertexAttribArray(a_position);
  gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);

  gl.enableVertexAttribArray(a_color);
  gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

  let matrix = matrix4.projection(gl.canvas.width, gl.canvas.width, 1000);
  matrix = matrix4.xRotate(matrix, degToRad(20));
  matrix = matrix4.yRotate(matrix, degToRad(30));
  matrix = matrix4.translate(matrix, 400, 200, 60);

  gl.uniformMatrix4fv(u_matrix, false, matrix);
  // 设置光照强度
  gl.uniform3f(u_light_color, 0.6, 0.6, 0.6);

  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

  return {
    gl,
    vShader,
    fShader,
    program,
  };
};