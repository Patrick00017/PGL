let Shader = function (gl, constantParamsName, vertexShader, fragmentShader) {
    if (!initShaders(gl, vertexShader, fragmentShader)) {
        this.check = false
    }
    this.check = true
    this.constant = constantParamsName
    this.vertexBuffer = undefined
    this.fragmentBuffer = undefined
}

Shader.prototype.createVertexBufferAndBind = function (gl, vertexArray, rowLength) {
    let buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW)
    this.vertexBuffer = buffer
    this.vertexSIZE = vertexArray.BYTES_PER_ELEMENT
    this.rowLength = rowLength
    return this
}

Shader.prototype.setAttribValue = function (gl, attribName, length, offset) {
    const nameInProgram = this.constant[attribName]
    const attrib = gl.getAttribLocation(gl.program, nameInProgram)
    gl.vertexAttribPointer(attrib, length, gl.FLOAT, false, this.vertexSIZE * this.rowLength, this.vertexSIZE * offset)
    gl.enableVertexAttribArray(attrib)
}

Shader.prototype.setUniform3fv = function (gl, uniformName, value) {
    const uniform = gl.getUniformLocation(gl.program, this.constant[uniformName])
    gl.uniform3fv(uniform, value.elements)
}
Shader.prototype.setUniform1f = function (gl, uniformName, value) {
    const uniform = gl.getUniformLocation(gl.program, this.constant[uniformName])
    gl.uniform3fv(uniform, value)
}
Shader.prototype.setUniformMatrix4fv = function (gl, uniformName, value) {
    const uniform = gl.getUniformLocation(gl.program, this.constant[uniformName])
    gl.uniformMatrix4fv(uniform, false, value.elements)
}