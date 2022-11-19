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
    gl.uniform1f(uniform, value)
}
Shader.prototype.setUniform1i = function (gl, uniformName, value) {
    const uniform = gl.getUniformLocation(gl.program, this.constant[uniformName])
    gl.uniform1i(uniform, value)
}
Shader.prototype.setUniformMatrix4fv = function (gl, uniformName, value) {
    const uniform = gl.getUniformLocation(gl.program, this.constant[uniformName])
    gl.uniformMatrix4fv(uniform, false, value.elements)
}

Shader.prototype.setDirLight = function (gl, light) {
    let {uniformName, direction, ambient, diffuse, specular} = light
    const u_dirLightDirection = gl.getUniformLocation(gl.program, `${uniformName}.direction`)
    const u_dirLightAmbient = gl.getUniformLocation(gl.program, `${uniformName}.ambient`)
    const u_dirLightDiffuse = gl.getUniformLocation(gl.program, `${uniformName}.diffuse`)
    const u_dirLightSpecular = gl.getUniformLocation(gl.program, `${uniformName}.specular`)
    gl.uniform3fv(u_dirLightDirection, direction.elements)
    gl.uniform3fv(u_dirLightAmbient, ambient.elements)
    gl.uniform3fv(u_dirLightDiffuse, diffuse.elements)
    gl.uniform3fv(u_dirLightSpecular, specular.elements)
}

Shader.prototype.setPointLight = function (gl, light) {
    let {uniformName, position, ambient, diffuse, specular, constant, linear, quadratic} = light
    const u_lightPosition = gl.getUniformLocation(gl.program, `${uniformName}.position`)
    const u_ambient = gl.getUniformLocation(gl.program, `${uniformName}.ambient`)
    const u_diffuse = gl.getUniformLocation(gl.program, `${uniformName}.diffuse`)
    const u_specular = gl.getUniformLocation(gl.program, `${uniformName}.specular`)
    const u_constant = gl.getUniformLocation(gl.program, `${uniformName}.constant`)
    const u_linear = gl.getUniformLocation(gl.program, `${uniformName}.linear`)
    const u_quadratic = gl.getUniformLocation(gl.program, `${uniformName}.quadratic`)
    gl.uniform3fv(u_lightPosition, position.elements)
    gl.uniform3fv(u_ambient, ambient.elements)
    gl.uniform3fv(u_diffuse, diffuse.elements)
    gl.uniform3fv(u_specular, specular.elements)
    gl.uniform1f(u_constant, constant)
    gl.uniform1f(u_linear, linear)
    gl.uniform1f(u_quadratic, quadratic)
}