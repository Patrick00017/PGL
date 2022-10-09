function drawPoints(gl, points) {
    // attribute in shaders
    const A_POSITION = 'a_position'
    const A_POINTSIZE = 'a_PointSize'
    const A_POINTCOLOR = 'a_pointColor'
    // const U_FRAGCOLOR = 'u_fragColor'
    const V_POINTCOLOR = 'v_pointColor'
    const VERTEXT_SHADER = `
        attribute vec4 ${A_POSITION};
        attribute float ${A_POINTSIZE};
        attribute vec3 ${A_POINTCOLOR};
        varying vec3 ${V_POINTCOLOR};
        void main()
        {
            gl_Position = ${A_POSITION};
            gl_PointSize = ${A_POINTSIZE};
            ${V_POINTCOLOR} = ${A_POINTCOLOR};
        }
    `
    const FRAGMENT_SHADER = `
        precision mediump float;
        varying vec3 ${V_POINTCOLOR};
        void main()
        {
            gl_FragColor = vec4(${V_POINTCOLOR}, 1.0);
        }
    `
    const vertexArray = new Float32Array(points)
    if (!initShaders(gl, VERTEXT_SHADER, FRAGMENT_SHADER)) {
        console.log("init shader fail!")
        return
    }
    // create buffer and use it
    const vertexBuffer = gl.createBuffer()
    let n = points.length / 6
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW)

    const a_position = gl.getAttribLocation(gl.program, A_POSITION)
    const a_pointsize = gl.getAttribLocation(gl.program, A_POINTSIZE)
    const a_pointColor = gl.getAttribLocation(gl.program, A_POINTCOLOR)
    if (a_position < 0 || a_pointsize < 0 || a_pointColor < 0) {
        console.log(`fail to get the ${[A_POSITION, A_POINTSIZE, A_POINTCOLOR]} storage location.`)
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    // for(let i=0; i<points.length; i++){
    //     const xy = points[i]
    //     gl.vertexAttrib3f(a_position, xy[0], xy[1], 0.0)
    //     gl.vertexAttrib1f(a_pointsize, point_size)
    //     gl.uniform3f(u_fragcolor, xy[2], xy[3], xy[4])
    //     gl.drawArrays(gl.POINTS, 0, 1)
    // }
    const FSIZE = vertexArray.BYTES_PER_ELEMENT
    // use buffer to send data
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, FSIZE * 6, 0)
    gl.vertexAttribPointer(a_pointsize, 1, gl.FLOAT, false, FSIZE * 6, FSIZE * 2)
    gl.vertexAttribPointer(a_pointColor, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
    gl.enableVertexAttribArray(a_position)
    gl.enableVertexAttribArray(a_pointsize)
    gl.enableVertexAttribArray(a_pointColor)

    if(n>=3){
        const triangleNum = n % 3
        gl.drawArrays(gl.TRIANGLES, 0, n-triangleNum)
        gl.drawArrays(gl.POINTS, n-triangleNum, n)
    }
    else{
        gl.drawArrays(gl.POINTS, 0, n)
    }
}

function onCanvasClicked(event, gl, canvas, points) {
    const x = event.clientX
    const y = event.clientY
    const rect = event.target.getBoundingClientRect()
    let tx = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2)
    let ty = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2)
    if (tx >= 0.0 && ty >= 0) {
        points.push(tx, ty, 10, 1.0, 0.0, 0.0)
    }
    if (tx < 0.0 && ty >= 0) {
        points.push(tx, ty, 10, 0.0, 1.0, 0.0)
    }
    if (tx >= 0.0 && ty < 0) {
        points.push(tx, ty, 10, 0.0, 0.0, 1.0)
    }
    if (tx < 0.0 && ty < 0) {
        points.push(tx, ty, 10, 0.5, 0.5, 0.5)
    }
    console.log(points)
    drawPoints(gl, points)
}

function main() {
    const canvas = document.getElementById("canvas")
    const gl = getWebGLContext(canvas)
    if (!gl) {
        console.log("not support")
        return
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // add listener to click
    const points = []
    canvas.onmousedown = (event) => {
        onCanvasClicked(event, gl, canvas, points)
    }
}