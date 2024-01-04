import { createShader, createProgram, degToRad } from '../common/core.js';
import { m4 } from '../common/m4.js';
// 点光源，相比平行光多了光的位置属性，计算上多了几个步骤

// 三维空间中一般使用冯氏光照模型，冯氏光照模型由 环境光、漫反射、镜面高光 三种光组成。（后来有其他加强优化phong）
// 根据冯氏光照模型来计算 平行光，其中主要是计算出漫反射因子的值
// 物体最终的颜色 = 物体颜色 * 灯光颜色 * 漫反射因子的值
//    漫反射因子的值 = 光入射角的余弦值 = 光线的方向向量 和 法线向量的夹角的余弦值
//        光线的方向向量 = 光的位置(世界坐标) - 光照到物体上点的位置(需要转成世界坐标，透视矩阵 * 顶点向量)
//        法线向量 = normal法向量可有通过顶点缓冲区传入
//        入射角的余弦值 = 光方向向量 点积 法线向量 glsl中有函数dot(a, b)
// 物体最终颜色 = 物体颜色 * 灯光颜色 * 漫反射因子的值

const VSHADER_SOURCE = `
  attribute vec4 a_position;
  attribute vec4 a_color;
  uniform vec3 u_light_position;
  uniform mat4 u_matrix;
  uniform mat4 u_modelMatrix;
  varying vec4 v_color;

  attribute vec3 a_normal;
  varying vec3 v_normal;
  varying vec3 v_world_position;
  varying vec3 light_direction;

  void main() {
    gl_Position = u_matrix * a_position;
    v_color = a_color;
    v_normal = mat3(u_modelMatrix) * a_normal;
    v_world_position = vec3(u_modelMatrix * a_position);
    light_direction = u_light_position - v_world_position;
  }
`;
const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec3 u_light_color;
  uniform vec4 u_color;

  varying vec3 v_normal;
  varying vec3 v_world_position;
  varying vec3 light_direction;

  void main() {
    // 漫反射因子
    float diffuse = dot(normalize(light_direction), normalize(v_normal));
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

  // const postionColor = new Float32Array([
  //   30, 30, 30,    1, 1, 1, // v0
  //   -30, 30, 30,   1, 0, 1, // v1
  //   -30, -30, 30,  1, 0, 0, // v2
  //   30, -30, 30,   1, 1, 0, // v3
  //   30, -30, -30,  0, 1, 0, // v4
  //   30, 30, -30,   0, 1, 1, // v5
  //   -30, 30, -30,  0, 0, 1, // v6
  //   -30, -30, -30, 0, 0, 0, // v7
  // ]);
  // 如果使用索引缓冲则光照会又问题，不知为何
  // const indexs = new Uint16Array([
  //   0,1,2, 0,2,3,
  //   0,3,4, 0,4,5,
  //   0,5,6, 0,6,1,
  //   1,6,7, 1,7,2,
  //   7,4,3, 7,3,2,
  //   4,7,6, 4,6,5
  // ]);

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
  const u_light_position = gl.getUniformLocation(program, 'u_light_position');
  const a_normal = gl.getAttribLocation(program, 'a_normal');
  const u_color = gl.getUniformLocation(program, 'u_color');

  const vertextBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertextBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, postionColor, gl.STATIC_DRAW);

  // 111
  // const indexBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexs, gl.STATIC_DRAW);


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

    // 111
    // gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
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
    gl.uniform3f(u_light_position, 20.0, 10.0, 60.0);

    gl.drawArrays(gl.TRIANGLES, 0, 36);
    // 111
    // gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

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

