export const createWebGLContext = (canvas: HTMLCanvasElement) => {
  const gl = canvas.getContext('webgl', {
    antialias: true
  })!;
  gl.viewport(0, 0, canvas.width, canvas.height);
  return gl;
};

export const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if(success) return shader;
  gl.deleteShader(shader);
  return null;
};

export const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader | null, fragmentShader: WebGLShader | null) => {
  if (!vertexShader || !fragmentShader) return null;
  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    gl.useProgram(program);
    return program;
  }
  gl.deleteProgram(program);
  return null;
};


export const degToRad = (d) => {
  return d * Math.PI / 180;
};