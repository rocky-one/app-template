import { createShader, createProgram, degToRad } from '../common/core.js';
import { m4 } from '../common/m4.js';
// 平行光，例如太阳光，一般是较远的光
// 平行光不需要光的位置，只需要向量即可

// 三维空间中一般使用冯氏光照模型，冯氏光照模型由 环境光、漫反射、镜面高光 三种光组成。
// 根据冯氏光照模型来计算 平行光，其中主要是计算出漫反射因子的值
// 物体最终的颜色 = 物体颜色 * 灯光颜色 * 漫反射因子的值
//    漫反射因子的值 = 光入射角的余弦值 = 光线的方向向量 和 法线向量的夹角的余弦值
//        光线的方向向量 = 外部定义传入即可
//        法线向量 = normal法向量可有通过顶点缓冲区传入
//        入射角的余弦值 = 光方向向量 点积 法线向量 glsl中有函数dot(a, b)
// 物体最终颜色 = 物体颜色 * 灯光颜色 * 漫反射因子的值

const VSHADER_SOURCE = `
  attribute vec4 a_position;
  attribute vec4 a_color;
  uniform mat4 u_matrix;
  uniform mat4 u_modelMatrix;
  varying vec4 v_color;

  attribute vec3 a_normal;
  varying vec3 v_normal;

  void main() {
    gl_Position = u_matrix * a_position;
    v_color = a_color;
    v_normal = mat3(u_modelMatrix) * a_normal;
  }
`;
const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec3 u_light_color;
  uniform vec4 u_color;
  uniform vec3 u_light_direction;
  varying vec3 v_normal;

  void main() {
  float diffuse = dot(normalize(u_light_direction), normalize(v_normal));
  diffuse = max(diffuse, 0.0);
  vec3 diffuseColor = diffuse * u_light_color;
  gl_FragColor = u_color * vec4(diffuseColor, 1);
  }
`;

const postionColor = new Float32Array([
  30, 30, 30, -30, 30, 30, -30, -30, 30, 30, 30, 30, -30, -30, 30, 30, -30, 30,      //面1
  30, 30, 30, 30, -30, 30, 30, -30, -30, 30, 30, 30, 30, -30, -30, 30, 30, -30,      //面2
  30, 30, 30, 30, 30, -30, -30, 30, -30, 30, 30, 30, -30, 30, -30, -30, 30, 30,      //面3
  -30, 30, 30, -30, 30, -30, -30, -30, -30, -30, 30, 30, -30, -30, -30, -30, -30, 30,//面4
  -30, -30, -30, 30, -30, -30, 30, -30, 30, -30, -30, -30, 30, -30, 30, -30, -30, 30,//面5
  30, -30, -30, -30, -30, -30, -30, 30, -30, 30, -30, -30, -30, 30, -30, 30, 30, -30]);//面6

// 每一个面的法向量
const normals = new Float32Array([
  0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,//z轴正方向——面1
  1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,//x轴正方向——面2
  0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,//y轴正方向——面3
  -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,//x轴负方向——面4
  0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,//y轴负方向——面5
  0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1
]);

export function createCube(gl: WebGLRenderingContext) {

  const vShader = createShader(gl, gl.VERTEX_SHADER, VSHADER_SOURCE);
  const fShader = createShader(gl, gl.FRAGMENT_SHADER, FSHADER_SOURCE);
  const program = createProgram(gl, vShader, fShader)!;

  const a_position = gl.getAttribLocation(program, 'a_position');
  const u_matrix = gl.getUniformLocation(program, 'u_matrix');
  const u_modelMatrix = gl.getUniformLocation(program, 'u_modelMatrix');
  const u_light_color = gl.getUniformLocation(program, 'u_light_color');
  const u_light_direction = gl.getUniformLocation(program, 'u_light_direction');
  const a_normal = gl.getAttribLocation(program, 'a_normal');
  const u_color = gl.getUniformLocation(program, 'u_color');

  const vertextBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertextBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, postionColor, gl.STATIC_DRAW);

  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

  let rotationValue = 0;

  function draw() {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.enableVertexAttribArray(a_position);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertextBuffer);
    gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(a_normal);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(a_normal, 3, gl.FLOAT, false, 0, 0);

    const aspect = gl.canvas.width / gl.canvas.height;
    const zNear = 1;
    const zFar = 2000;
    const projectionMatrix = m4.perspective(degToRad(60), aspect, zNear, zFar);

    const camera = [100, 150, 200];
    const target = [0, 35, 0];
    const up = [0, 1, 0];
    const cameraMatrix = m4.lookAt(camera, target, up);
    const viewMatrix = m4.inverse(cameraMatrix);
    const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
    const worldMatrix = m4.yRotation(rotationValue);
    const worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    gl.uniformMatrix4fv(u_matrix, false, worldViewProjectionMatrix);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    gl.uniformMatrix4fv(u_modelMatrix, false, worldMatrix);
    gl.uniform4fv(u_color, [0.2, 1, 0.2, 1]);
    gl.uniform3f(u_light_color, 1.0, 1.0, 1.0);
    gl.uniform3f(u_light_direction, 0.0, 0.0, 1.0);

    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
  draw();

  let angleValue = 0;
  setInterval(() => {
    angleValue += 6;
    if (angleValue > 360) {
      angleValue = 0;
    }
    rotationValue = degToRad(angleValue);
    draw();
  }, 100);
  return {
    gl,
    vShader,
    fShader,
    program,
  };
}

