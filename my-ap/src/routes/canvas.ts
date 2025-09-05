function resize(gl: WebGL2RenderingContext) {
    gl.canvas.width = window.innerWidth;
    gl.canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) || "shader error");
    }
    return shader;
}

function createProgram(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader) {
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(prog) || "program error");
    }
    return prog;
}

const vssource = `#version 300 es
precision highp float;

uniform vec2 offset;
uniform float time;

in vec2 pos;
in vec2 instancePos;

out vec2 vpos;

void main () {
   // wiggle animation
   vec2 floaty = instancePos + 0.05 * vec2(sin(time + instancePos.x*5.0), cos(time + instancePos.y*5.0));

   // mouse offset applied to all instances
   vec2 local = vec2(offset.x * 2.0 - 1.0, offset.y * 2.0 + 1.0);

   gl_Position = vec4(pos + local + floaty, 0.0, 1.0);
   gl_PointSize = 6.0;

   vpos = pos + floaty;
}
`;

const fssource = `#version 300 es
precision highp float;

in vec2 vpos;

out vec4 fragColor;

void main() {
    float dist = length(vpos);
    fragColor = vec4(0.5 + 0.5*sin(dist*10.0), 0.5 + 0.5*cos(dist*10.0), 0.7, 1.0);
}
`;

export function runCanvas() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl2")!;

    resize(gl);
    window.addEventListener("resize", () => resize(gl));

    const vs = createShader(gl, gl.VERTEX_SHADER, vssource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fssource);
    const program = createProgram(gl, vs, fs);

    gl.useProgram(program);

    const posLoc = gl.getAttribLocation(program, "pos");
    const instancePosLoc = gl.getAttribLocation(program, "instancePos");
    const offsetLoc = gl.getUniformLocation(program, "offset");
    const timeLoc = gl.getUniformLocation(program, "time");

    // a small square shape (two triangles)
    const quad = new Float32Array([
        -0.01, -0.01,
         0.01, -0.01,
        -0.01,  0.01,
         0.01,  0.01,
    ]);
    const quadBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // instance positions
    const count = 200;
    const inst = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
        inst[i * 2] = (Math.random() * 2 - 1) * 0.8;
        inst[i * 2 + 1] = (Math.random() * 2 - 1) * 0.8;
    }
    const instBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
    gl.bufferData(gl.ARRAY_BUFFER, inst, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(instancePosLoc);
    gl.vertexAttribPointer(instancePosLoc, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(instancePosLoc, 1);

    let offsetX = 0, offsetY = 0;
    canvas.addEventListener("mousemove", (e) => {
        offsetX = (e.clientX / canvas.width) * 2 - 1;
        offsetY = -(e.clientY / canvas.height) * 2 + 1;
    });

    function draw(time: number) {
        gl.clearColor(0.05, 0.05, 0.1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.uniform2f(offsetLoc, offsetX, offsetY);
        gl.uniform1f(timeLoc, time * 0.001);

        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);
        requestAnimationFrame(draw);
    }
    draw(0);
}
