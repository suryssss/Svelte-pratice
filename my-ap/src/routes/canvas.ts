function resize(gl: WebGL2RenderingContext) {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    if ((gl.canvas as HTMLCanvasElement).width !== w || (gl.canvas as HTMLCanvasElement).height !== h) {
        (gl.canvas as HTMLCanvasElement).width = w;
        (gl.canvas as HTMLCanvasElement).height = h;
        gl.viewport(0, 0, w, h);
    }
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader error");
    return s;
}

function createProgram(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader) {
    const p = gl.createProgram()!;
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || "program error");
    return p;
}

function mat4Identity() {
    const m = new Float32Array(16);
    m[0] = 1; m[5] = 1; m[10] = 1; m[15] = 1;
    return m;
}

function mat4Multiply(a: Float32Array, b: Float32Array) {
    const out = new Float32Array(16);
    const a00=a[0],a01=a[1],a02=a[2],a03=a[3];
    const a10=a[4],a11=a[5],a12=a[6],a13=a[7];
    const a20=a[8],a21=a[9],a22=a[10],a23=a[11];
    const a30=a[12],a31=a[13],a32=a[14],a33=a[15];
    let b0,b1,b2,b3;
    b0=b[0];b1=b[1];b2=b[2];b3=b[3];
    out[0]=a00*b0+a10*b1+a20*b2+a30*b3;
    out[1]=a01*b0+a11*b1+a21*b2+a31*b3;
    out[2]=a02*b0+a12*b1+a22*b2+a32*b3;
    out[3]=a03*b0+a13*b1+a23*b2+a33*b3;
    b0=b[4];b1=b[5];b2=b[6];b3=b[7];
    out[4]=a00*b0+a10*b1+a20*b2+a30*b3;
    out[5]=a01*b0+a11*b1+a21*b2+a31*b3;
    out[6]=a02*b0+a12*b1+a22*b2+a32*b3;
    out[7]=a03*b0+a13*b1+a23*b2+a33*b3;
    b0=b[8];b1=b[9];b2=b[10];b3=b[11];
    out[8]=a00*b0+a10*b1+a20*b2+a30*b3;
    out[9]=a01*b0+a11*b1+a21*b2+a31*b3;
    out[10]=a02*b0+a12*b1+a22*b2+a32*b3;
    out[11]=a03*b0+a13*b1+a23*b2+a33*b3;
    b0=b[12];b1=b[13];b2=b[14];b3=b[15];
    out[12]=a00*b0+a10*b1+a20*b2+a30*b3;
    out[13]=a01*b0+a11*b1+a21*b2+a31*b3;
    out[14]=a02*b0+a12*b1+a22*b2+a32*b3;
    out[15]=a03*b0+a13*b1+a23*b2+a33*b3;
    return out;
}

function mat4Perspective(fovy: number, aspect: number, near: number, far: number) {
    const f = 1.0 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);
    const out = new Float32Array(16);
    out[0] = f / aspect;
    out[5] = f;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[14] = (2 * far * near) * nf;
    return out;
}

function mat4Translate(m: Float32Array, x: number, y: number, z: number) {
    const out = m.slice() as Float32Array;
    out[12] = m[0]*x + m[4]*y + m[8]*z + m[12];
    out[13] = m[1]*x + m[5]*y + m[9]*z + m[13];
    out[14] = m[2]*x + m[6]*y + m[10]*z + m[14];
    out[15] = m[3]*x + m[7]*y + m[11]*z + m[15];
    return out;
}

function mat4RotateX(m: Float32Array, r: number) {
    const c = Math.cos(r), s = Math.sin(r);
    const rot = new Float32Array([1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]);
    return mat4Multiply(m, rot);
}

function mat4RotateY(m: Float32Array, r: number) {
    const c = Math.cos(r), s = Math.sin(r);
    const rot = new Float32Array([c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]);
    return mat4Multiply(m, rot);
}

const vssource = `#version 300 es
precision highp float;
layout(location=0) in vec3 position;
layout(location=1) in vec3 color;
uniform mat4 uMVP;
out vec3 vColor;
void main(){
    gl_Position = uMVP * vec4(position,1.0);
    vColor = color;
}
`;

const fssource = `#version 300 es
precision highp float;
in vec3 vColor;
out vec4 fragColor;
void main(){
    fragColor = vec4(vColor,1.0);
}
`;

export function runCanvas(){
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl2")!;
    resize(gl);
    window.addEventListener("resize", ()=>resize(gl));

    const vs = createShader(gl, gl.VERTEX_SHADER, vssource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fssource);
    const program = createProgram(gl, vs, fs);
    gl.useProgram(program);

    const positions = new Float32Array([
        -0.5,-0.5,-0.5,
         0.5,-0.5,-0.5,
         0.5, 0.5,-0.5,
        -0.5, 0.5,-0.5,
        -0.5,-0.5, 0.5,
         0.5,-0.5, 0.5,
         0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5
    ]);

    const colors = new Float32Array([
        1,0,0, 0,1,0, 0,0,1, 1,1,0,
        1,0,1, 0,1,1, 1,1,1, 0.2,0.2,0.2
    ]);

    const indices = new Uint16Array([
        0,1,2, 2,3,0,
        4,5,6, 6,7,4,
        0,4,7, 7,3,0,
        1,5,6, 6,2,1,
        3,2,6, 6,7,3,
        0,1,5, 5,4,0
    ]);

    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);

    const pbuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    const cbuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    const ibuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    const uMVP = gl.getUniformLocation(program, "uMVP")!;

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.05,0.05,0.1,1);

    let rotX = 0, rotY = 0;
    let dragging = false;
    let lastX = 0, lastY = 0;

    canvas.addEventListener("mousedown", e => {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
    });
    window.addEventListener("mouseup", ()=>dragging=false);
    window.addEventListener("mousemove", e=>{
        if(dragging){
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            rotY += dx * 0.01;
            rotX += dy * 0.01;
            lastX = e.clientX;
            lastY = e.clientY;
        }
    });

    function frame(){
        resize(gl);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

        const aspect = (gl.canvas as HTMLCanvasElement).width / (gl.canvas as HTMLCanvasElement).height;
        const proj = mat4Perspective(Math.PI/3, aspect, 0.1, 100);
        let view = mat4Identity();
        view = mat4Translate(view, 0, 0, -3);
        let model = mat4Identity();
        model = mat4RotateY(model, rotY);
        model = mat4RotateX(model, rotX);
        const vp = mat4Multiply(proj, view);
        const mvp = mat4Multiply(vp, model);

        gl.uniformMatrix4fv(uMVP, false, mvp);
        gl.bindVertexArray(vao);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}
