let DirectionLight = function (uniformName, direction, ambient, diffuse, specular) {
    this.uniformName = uniformName
    this.direction = direction
    this.ambient = ambient
    this.diffuse = diffuse
    this.specular = specular
}

let PointLight = function (uniformName, position, ambient, diffuse, specular, constant, linear, quadratic) {
    this.uniformName = uniformName
    this.position = position
    this.ambient = ambient
    this.diffuse = diffuse
    this.specular = specular
    this.constant = constant
    this.linear = linear
    this.quadratic = quadratic
}