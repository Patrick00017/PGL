function drawRectangle(gl, eye, projection, view, model, lightDirection, lightColor, ambientLight) {
    const A_POSITION = 'a_position'
    const A_POINTCOLOR = 'a_pointColor'
    const A_NORMAL = 'a_normal'
    const U_LIGHTPOSITION = 'u_lightPosition'
    const U_LIGHTCOLOR = 'u_lightColor'
    const U_AMBIENT = 'u_ambient'
    const U_EYEPOSITION = 'u_eyePosition'
    const U_PROJECTION = 'u_projection'
    const U_VIEW = 'u_view'
    const U_MODEL = 'u_model'

    const V_POINTCOLOR = 'v_pointColor'
    const V_NORMAL = 'v_normal'
    const V_FRAGPOS = 'v_fragPos'
    const vertexShader = `
        attribute vec4 ${A_POSITION};
        attribute vec3 ${A_POINTCOLOR};
        attribute vec3 ${A_NORMAL};
        
        uniform mat4 ${U_PROJECTION};
        uniform mat4 ${U_VIEW};
        uniform mat4 ${U_MODEL};
        
        varying vec3 ${V_POINTCOLOR};
        varying vec3 ${V_NORMAL};
        varying vec3 ${V_FRAGPOS};
        void main()
        {
            gl_Position = ${U_PROJECTION} * ${U_VIEW} * ${U_MODEL} * ${A_POSITION};
            ${V_FRAGPOS} = vec3(${A_POSITION});
            ${V_NORMAL} = ${A_NORMAL};
            ${V_POINTCOLOR} = ${A_POINTCOLOR};
            gl_PointSize = 2.0;
        }
    `
    const fragmentShader = `
        precision mediump float;
        uniform vec3 ${U_LIGHTPOSITION};
        uniform vec3 ${U_LIGHTCOLOR};
        uniform vec3 ${U_AMBIENT};
        uniform vec3 ${U_EYEPOSITION};
        varying vec3 ${V_POINTCOLOR};
        varying vec3 ${V_NORMAL};
        varying vec3 ${V_FRAGPOS};
        void main()
        {
            vec3 normal = normalize(${V_NORMAL});
            vec3 lightDirection = normalize(${U_LIGHTPOSITION} - ${V_FRAGPOS});
            float nDotL = max(dot(normal, lightDirection), 0.0);
            vec3 ambient = ${U_AMBIENT} * ${U_LIGHTCOLOR};
            vec3 diffuse = ${U_LIGHTCOLOR} * ${U_LIGHTCOLOR} * nDotL;
            
            vec3 eyeDirection = normalize(${U_EYEPOSITION});
            vec3 reflectDirection = reflect(-lightDirection, normal);
            float eDotR = max(dot(eyeDirection, reflectDirection), 0.0);
            float specStrength = 0.5;
            float shininess = 64.0;
            float spec = pow(eDotR, shininess);
            vec3 specular = specStrength * spec * ${U_LIGHTCOLOR};
            
            vec3 result = (ambient + diffuse + specular) * ${V_POINTCOLOR};
            gl_FragColor = vec4(result, 1.0);
        }
    `

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

        1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,//v0
        -1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,  //v1
        -1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, //v2
        1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,//v0
        -1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, //v2
        1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,//v3

        1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,//v0
        1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,//v3
        1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //v4
        1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,//v0
        1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //v4
        1.0, 1.0, -1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,//v5

        1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0,//v0
        1.0, 1.0, -1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0,//v5
        -1.0, 1.0, -1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, //v6
        1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0,//v0
        -1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, //v1
        -1.0, 1.0, -1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, //v6

        -1.0, 1.0, 1.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, //v1
        -1.0, 1.0, -1.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, //v6
        -1.0, -1.0, -1.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  //v7
        -1.0, 1.0, 1.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, //v1
        -1.0, -1.0, 1.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, //v2
        -1.0, -1.0, -1.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  //v7

        1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 0.0, -1.0, 0.0,//v3
        1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 0.0, -1.0, 0.0, //v4
        -1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 0.0, -1.0, 0.0,  //v7
        -1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 0.0, -1.0, 0.0, //v2
        1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 0.0, -1.0, 0.0,//v3
        -1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 0.0, -1.0, 0.0,  //v7

        1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 0.0, 0.0, -1.0, //v4
        -1.0, 1.0, -1.0, 1.0, 0.0, 0.0, 0.0, 0.0, -1.0, //v6
        -1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 0.0, 0.0, -1.0,  //v7
        1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 0.0, 0.0, -1.0, //v4
        1.0, 1.0, -1.0, 1.0, 0.0, 0.0, 0.0, 0.0, -1.0,//v5
        -1.0, 1.0, -1.0, 1.0, 0.0, 0.0, 0.0, 0.0, -1.0, //v6

    ]
    const indexlength = 9
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
    // const u_mvp = gl.getUniformLocation(gl.program, U_MVP)
    const u_projection = gl.getUniformLocation(gl.program, U_PROJECTION)
    const u_view = gl.getUniformLocation(gl.program, U_VIEW)
    const u_model = gl.getUniformLocation(gl.program, U_MODEL)
    const u_lightDirection = gl.getUniformLocation(gl.program, U_LIGHTPOSITION)
    const u_lightColor = gl.getUniformLocation(gl.program, U_LIGHTCOLOR)
    const u_ambient = gl.getUniformLocation(gl.program, U_AMBIENT)
    const u_eyePosition = gl.getUniformLocation(gl.program, U_EYEPOSITION)

    gl.uniform3fv(u_lightDirection, lightDirection.elements)
    gl.uniform3fv(u_lightColor, lightColor.elements)
    gl.uniform3fv(u_ambient, ambientLight.elements)
    gl.uniformMatrix4fv(u_projection, false, projection.elements)
    gl.uniformMatrix4fv(u_view, false, view.elements)
    gl.uniformMatrix4fv(u_model, false, model.elements)

    const mvp = new Matrix4()
    mvp.setPerspective(30, 1, 1, 100)
    mvp.lookAt(4.0, 2.5, 4.0, 0, 0, 0, 0, 1, 0)
    gl.uniform3fv(u_eyePosition, eye.elements)

    const FSIZE = vertexArray.BYTES_PER_ELEMENT
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


    const lightDirection = new Vector3([-2.0, 2.5, -2.0])
    const lightColor = new Vector3([1.0, 1.0, 1.0])
    const ambientLight = new Vector3([0.2, 0.2, 0.2])
    const eyePosition = new Vector3([4.0, 2.5, 4.0])
    const projection = new Matrix4().setPerspective(30, 1, 1, 100)
    const view = new Matrix4().lookAt(4.0, 2.5, 4.0, 0, 0, 0, 0, 1, 0)
    const model = new Matrix4().scale(0.2, 0.2, 0.2).rotate(45.0, 1.0, 0.0, 0.0)

    drawRectangle(gl, eyePosition, projection, view, model, lightDirection, lightColor, ambientLight)
    // drawRectangle(gl, points2, index2)
}