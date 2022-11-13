function drawRectangle(gl, points, elementIndexes, indexlength, lightDirection, lightColor, ambientLight) {
    const A_POSITION = 'a_position'
    const A_POINTCOLOR = 'a_pointColor'
    const V_POINTCOLOR = 'v_pointColor'
    const A_NORMAL = 'a_normal'
    const U_LIGHTDIRECTION = 'u_lightDirection'
    const U_LIGHTCOLOR = 'u_lightColor'
    const U_AMBIENT = 'u_ambient'
    const U_EYE = 'u_eye'
    const U_MVP = 'u_mvp'
    const vertexShader = `
        attribute vec4 ${A_POSITION};
        attribute vec3 ${A_POINTCOLOR};
        attribute vec3 ${A_NORMAL};
        uniform vec3 ${U_LIGHTDIRECTION};
        uniform vec3 ${U_LIGHTCOLOR};
        uniform vec3 ${U_AMBIENT};
        uniform mat4 ${U_MVP};
        uniform vec3 ${U_EYE};
        varying vec3 ${V_POINTCOLOR};
        void main()
        {
            gl_Position = ${U_MVP} * ${A_POSITION};
            gl_PointSize = 5.0;
            
            vec3 normal = normalize(${A_NORMAL});
            vec3 lightDirection = normalize(${U_LIGHTDIRECTION});
            float nDotL = max(dot(normal, lightDirection), 0.0);
            vec3 ambient = ${U_AMBIENT} * ${A_POINTCOLOR};
            vec3 diffuse = ${U_LIGHTCOLOR} * ${A_POINTCOLOR} * nDotL;
            ${V_POINTCOLOR} = diffuse + ambient;
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
    // const indexesArray = new Uint8Array(elementIndexes)
    if (!initShaders(gl, vertexShader, fragmentShader)) {
        console.log('fail to init the shader program.')
    }
    const vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW)
    const a_position = gl.getAttribLocation(gl.program, A_POSITION)
    const a_pointColor = gl.getAttribLocation(gl.program, A_POINTCOLOR)
    const a_normal = gl.getAttribLocation(gl.program, A_NORMAL)
    const u_mvp = gl.getUniformLocation(gl.program, U_MVP)
    const u_lightDirection = gl.getUniformLocation(gl.program, U_LIGHTDIRECTION)
    const u_lightColor = gl.getUniformLocation(gl.program, U_LIGHTCOLOR)
    const u_ambient = gl.getUniformLocation(gl.program, U_AMBIENT)

    gl.uniform3fv(u_lightDirection, lightDirection.elements)
    gl.uniform3fv(u_lightColor, lightColor.elements)
    gl.uniform3fv(u_ambient, ambientLight.elements)

    const mvp = new Matrix4()
    mvp.setPerspective(30, 1, 1, 100)
    mvp.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0)
    gl.uniformMatrix4fv(u_mvp, false, mvp.elements)

    const FSIZE = vertexArray.BYTES_PER_ELEMENT
    const n = elementIndexes.length
    gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, FSIZE * indexlength, 0)
    gl.vertexAttribPointer(a_pointColor, 3, gl.FLOAT, false, FSIZE * indexlength, FSIZE * 3)
    gl.vertexAttribPointer(a_normal, 3, gl.FLOAT, false, FSIZE * indexlength, FSIZE * 6)
    gl.enableVertexAttribArray(a_position)
    gl.enableVertexAttribArray(a_pointColor)
    gl.enableVertexAttribArray(a_normal)
    // const elementBuffer = gl.createBuffer()
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer)
    // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexesArray, gl.STATIC_DRAW)
    //
    // gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
    console.log('ok')
    gl.drawArrays(gl.TRIANGLES, 0, 36)
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
        // 1.0, 1.0, 1.0, 1.0, 0.0, 0.0,  //v0
        // -1.0, 1.0, 1.0, 1.0, 0.0, 0.0,   //v1
        // -1.0, -1.0, 1.0, 1.0, 0.0, 0.0,  //v2
        // 1.0, -1.0, 1.0, 1.0, 0.0, 0.0,  //v3
        // 1.0, -1.0, -1.0, 1.0, 0.0, 0.0,  //v4
        // 1.0, 1.0, -1.0, 1.0, 0.0, 0.0,  //v5
        // -1.0, 1.0, -1.0, 1.0, 0.0, 0.0,  //v6
        // -1.0, -1.0, -1.0, 1.0, 0.0, 0.0,  //v7

        1.0, 1.0, 1.0, 1.0, 0.0, 0.0,   0.0, 0.0, 1.0,//v0
        -1.0, 1.0, 1.0, 1.0, 0.0, 0.0,  0.0, 0.0, 1.0,  //v1
        -1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, //v2
        1.0, 1.0, 1.0, 1.0, 0.0, 0.0,   0.0, 0.0, 1.0,//v0
        -1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, //v2
        1.0, -1.0, 1.0, 1.0, 0.0, 0.0,  0.0, 0.0, 1.0,//v3

        1.0, 1.0, 1.0, 1.0, 0.0, 0.0,   1.0, 0.0, 0.0,//v0
        1.0, -1.0, 1.0, 1.0, 0.0, 0.0,  1.0, 0.0, 0.0,//v3
        1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //v4
        1.0, 1.0, 1.0, 1.0, 0.0, 0.0,   1.0, 0.0, 0.0,//v0
        1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //v4
        1.0, 1.0, -1.0, 1.0, 0.0, 0.0,  1.0, 0.0, 0.0,//v5

        1.0, 1.0, 1.0, 1.0, 0.0, 0.0,   0.0, 1.0, 0.0,//v0
        1.0, 1.0, -1.0, 1.0, 0.0, 0.0,  0.0, 1.0, 0.0,//v5
        -1.0, 1.0, -1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, //v6
        1.0, 1.0, 1.0, 1.0, 0.0, 0.0,   0.0, 1.0, 0.0,//v0
        -1.0, 1.0, 1.0, 1.0, 0.0, 0.0,  0.0, 1.0, 0.0, //v1
        -1.0, 1.0, -1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, //v6

        -1.0, 1.0, 1.0, 1.0, 0.0, 0.0,  -1.0, 0.0, 0.0, //v1
        -1.0, 1.0, -1.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, //v6
        -1.0, -1.0, -1.0, 1.0, 0.0, 0.0,-1.0, 0.0, 0.0,  //v7
        -1.0, 1.0, 1.0, 1.0, 0.0, 0.0,  -1.0, 0.0, 0.0, //v1
        -1.0, -1.0, 1.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, //v2
        -1.0, -1.0, -1.0, 1.0, 0.0, 0.0,-1.0, 0.0, 0.0,  //v7

        1.0, -1.0, 1.0, 1.0, 0.0, 0.0,  0.0, -1.0, 0.0,//v3
        1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 0.0, -1.0, 0.0, //v4
        -1.0, -1.0, -1.0, 1.0, 0.0, 0.0,0.0, -1.0, 0.0,  //v7
        -1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 0.0, -1.0, 0.0, //v2
        1.0, -1.0, 1.0, 1.0, 0.0, 0.0,  0.0, -1.0, 0.0,//v3
        -1.0, -1.0, -1.0, 1.0, 0.0, 0.0,0.0, -1.0, 0.0,  //v7

        1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 0.0, 0.0, -1.0, //v4
        -1.0, 1.0, -1.0, 1.0, 0.0, 0.0, 0.0, 0.0, -1.0, //v6
        -1.0, -1.0, -1.0, 1.0, 0.0, 0.0,0.0, 0.0, -1.0,  //v7
        1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 0.0, 0.0, -1.0, //v4
        1.0, 1.0, -1.0, 1.0, 0.0, 0.0,  0.0, 0.0, -1.0,//v5
        -1.0, 1.0, -1.0, 1.0, 0.0, 0.0, 0.0, 0.0, -1.0, //v6

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
    const lightDirection = new Vector3([0.5, 3.0, 4.0])
    const lightColor = new Vector3([1.0, 1.0, 1.0])
    const ambientLight = new Vector3([0.2, 0.2, 0.2])

    drawRectangle(gl, points, index, 9, lightDirection, lightColor)
    // drawRectangle(gl, points2, index2)
}