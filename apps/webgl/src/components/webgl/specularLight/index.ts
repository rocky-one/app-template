import { createShader, createProgram, degToRad } from '../common/core.js';
import { m4 } from '../common/m4.js';
// 镜面高光，相比较点光源多了一个视角向量

//  漫反射因子的值 = 光反射向量和视角向量的夹角余弦值 = 光线的反射方向向量 和 视角向量的夹角的余弦值
//        光线的反射方向向量 = reflect(-light_direction, v_normal);
//        视角向量 = u_camera_position(位置) - v_world_position
//        入射角的余弦值 = dot求值即可
// 物体最终颜色 = 物体颜色 * ((灯光颜色 * 漫反射因子的值) + (灯光颜色 * 镜面反射因子))

const VSHADER_SOURCE = `
  attribute vec4 a_position;
  attribute vec4 a_color;
  uniform vec3 u_light_position;
  uniform mat4 u_matrix;
  uniform mat4 u_modelMatrix;
  uniform vec3 u_camera_position;
  varying vec4 v_color;

  attribute vec3 a_normal;
  varying vec3 v_normal;
  varying vec3 v_world_position;
  varying vec3 light_direction;
  varying vec3 light_reflection_light;
  varying vec3 camera_direction;

  void main() {
    gl_Position = u_matrix * a_position;
    v_color = a_color;
    v_normal = mat3(u_modelMatrix) * a_normal;
    v_world_position = vec3(u_modelMatrix * a_position);
    light_direction = u_light_position - v_world_position;
    light_reflection_light = reflect(-light_direction, v_normal);
    camera_direction = u_camera_position - v_world_position;
  }
`;
const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec3 u_light_color;
  uniform vec4 u_color;

  varying vec3 v_normal;
  varying vec3 v_world_position;
  varying vec3 light_direction;
  varying vec3 light_reflection_light;
  varying vec3 camera_direction;

  void main() {
    // 漫反射因子
    float diffuse = dot(normalize(light_direction), normalize(v_normal));
    diffuse = max(diffuse, 0.0);
    vec3 diffuseColor = diffuse * u_light_color;
    
    // 高光因子
    vec3 halfVector = normalize(light_reflection_light + camera_direction);
    float specular = dot(normalize(camera_direction), normalize(light_reflection_light));
    specular = max(specular, 0.0);
    specular = pow(specular, 32.0); // 这里加了反光度，缩小光圈

    vec3 specialColor  = specular * u_light_color * 4.0; // 这里有个系数，值越大高光越亮

    vec3 allColor = diffuseColor + specialColor;
    gl_FragColor = u_color * vec4(allColor, 1);
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
  const u_light_position = gl.getUniformLocation(program, 'u_light_position');
  const a_normal = gl.getAttribLocation(program, 'a_normal');
  const u_color = gl.getUniformLocation(program, 'u_color');
  const u_camera_position = gl.getUniformLocation(program, 'u_camera_position');

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
    gl.uniform3f(u_light_position, 20.0, -10.0, 60.0);
    gl.uniform3f(u_camera_position, camera[0], camera[1], camera[2]);

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

