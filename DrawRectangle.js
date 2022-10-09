function drawRectangle(gl, points, elementIndexes) {
    const A_POSITION = 'a_position'
    const A_POINTCOLOR = 'a_pointColor'
    const V_POINTCOLOR = 'v_pointColor'
    const U_MVP = 'u_mvp'
    const vertexShader = `
        attribute vec4 ${A_POSITION};
        attribute vec3 ${A_POINTCOLOR};
        uniform mat4 ${U_MVP};
        varying vec3 ${V_POINTCOLOR};
        void main()
        {
            gl_Position = ${U_MVP} * ${A_POSITION};
            gl_PointSize = 5.0;
            ${V_POINTCOLOR} = ${A_POINTCOLOR};
        }
    `
    const fragmentShader = `
        precision mediump float;
        varying vec3 ${V_POINTCOLOR};
        void main()
        {
            gl_FragColor = vec4(${V_POINTCOLOR}, 1.0);
        }
    `

    const vertexArray = new Float32Array(points)
    const indexesArray = new Uint8Array(elementIndexes)
    if (!initShaders(gl, vertexShader, fragmentShader)) {
        console.log('fail to init the shader program.')
    }
    const vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW)
    const a_position = gl.getAttribLocation(gl.program, A_POSITION)
    const a_pointColor = gl.getAttribLocation(gl.program, A_POINTCOLOR)
    const u_mvp = gl.getUniformLocation(gl.program, U_MVP)

    const mvp = new Matrix4()
    mvp.setPerspective(30, 1, 1, 100)
    mvp.lookAt(-5, 5, 10, 0, 0, 0, 0, 1, 0)
    gl.uniformMatrix4fv(u_mvp, false, mvp.elements)

    const FSIZE = vertexArray.BYTES_PER_ELEMENT
    const n = elementIndexes.length
    gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, FSIZE * 6, 0)
    gl.vertexAttribPointer(a_pointColor, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
    gl.enableVertexAttribArray(a_position)
    gl.enableVertexAttribArray(a_pointColor)
    const elementBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexesArray, gl.STATIC_DRAW)

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
    // gl.drawArrays(gl.TRIANGLES, 0, 8)
}

function main() {
    const canvas = document.getElementById("canvas")
    const gl = getWebGLContext(canvas)
    if (!gl) {
        console.log("not support")
        return
    }
    gl.enable(gl.DEPTH_TEST)
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // add listener to click
    let points = [
        1.0, 1.0, 1.0,   1.0, 0.0, 0.0,  //v0
        -1.0, 1.0, 1.0, 1.0, 1.0, 0.0,//v1
        -1.0, -1.0, 1.0, 1.0, 0.0, 1.0,//v2
        1.0, -1.0, 1.0,  1.0, 0.5, 0.5,//v3
        1.0, -1.0, -1.0, 0.5, 1.0, 0.0,//v4
        1.0, 1.0, -1.0,  0.5, 1.0, 0.5,//v5
        -1.0, 1.0, -1.0, 0.5, 0.5, 0.5,//v6
        -1.0,-1.0, -1.0, 0.0, 1.0, 1.0,//v7
    ]
    const index = [
        0, 1, 2,
        0, 2, 3,
        0, 3, 4,
        0, 5, 4,
        0, 5, 6,
        0, 1, 6,
        1, 7, 6,
        1, 7, 2,
        3, 4, 7,
        7, 3, 2,
        4, 7, 6,
        4, 6, 5
    ]
    let points2 = [
        1.0, 1.5, 1.0,   1.0, 0.0, 0.0,  //v0
        -1.0, 1.0, 1.5, 1.0, 1.0, 0.0,//v1
        -1.0, -1.0, 1.5, 1.0, 0.0, 1.0,//v2
        1.0, -1.5, 1.0,  1.0, 0.5, 0.5,//v3
        1.0, -1.0, -1.5, 0.5, 1.0, 0.0,//v4
        1.0, 1.0, -1.0,  0.5, 1.0, 0.5,//v5
        -1.0, 1.5, -1.0, 0.5, 0.5, 0.5,//v6
        -1.0,-1.0, -1.5, 0.0, 1.0, 1.0,//v7
    ]
    const index2 = [
        0, 1, 7,
        0, 2, 7,
        0, 3, 4,
        0, 5, 7,
        0, 5, 6,
        0, 1, 7,
        1, 7, 6,
        1, 7, 2,
        3, 4, 7,
        7, 3, 2,
        4, 7, 6,
        4, 6, 5
    ]
    drawRectangle(gl, points, index)
    // drawRectangle(gl, points2, index2)
}