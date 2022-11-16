function drawRectangle(gl, eye, projection, view, model, lightDirection, lightColor, ambientLight, color) {
    const A_POSITION = 'a_position'
    const A_POINTCOLOR = 'a_pointColor'
    const A_NORMAL = 'a_normal'
    const U_EYEPOSITION = 'u_eyePosition'
    const U_PROJECTION = 'u_projection'
    const U_VIEW = 'u_view'
    const U_MODEL = 'u_model'
    const U_NORMALMODEL = 'u_normalmodel'

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
        uniform mat4 ${U_NORMALMODEL};
        
        varying vec3 ${V_POINTCOLOR};
        varying vec3 ${V_NORMAL};
        varying vec3 ${V_FRAGPOS};
        void main()
        {
            gl_Position = ${U_PROJECTION} * ${U_VIEW} * ${U_MODEL} * ${A_POSITION};
            ${V_FRAGPOS} = mat3(${U_MODEL}) * vec3(${A_POSITION});
            ${V_NORMAL} = mat3(${U_NORMALMODEL}) * ${A_NORMAL};
            ${V_POINTCOLOR} = ${A_POINTCOLOR};
            gl_PointSize = 2.0;
        }
    `

    const dirLightStructName = 'DirLight'
    const dirLightStruct = `
        struct ${dirLightStructName} {
            vec3 direction;
            vec3 color;
            vec3 ambient;
            vec3 diffuse;
            vec3 specular;
        };
    `

    const pointLightStructName = 'PointLight'
    const pointLightStruct = `
        struct ${pointLightStructName} {
            vec3 position;
            vec3 ambient;
            vec3 diffuse;
            vec3 specular;
            vec3 color;
            float constant;
            float linear;
            float quadratic;
        };
    `
    const fragmentShader = `
        precision mediump float;
        #define NR_POINT_LIGHTS 1 
        ${pointLightStruct}
        ${dirLightStruct}
        uniform ${pointLightStructName} light[NR_POINT_LIGHTS];
        uniform ${dirLightStructName} dirLight;
        uniform vec3 ${U_EYEPOSITION};
        varying vec3 ${V_POINTCOLOR};
        varying vec3 ${V_NORMAL};
        varying vec3 ${V_FRAGPOS};
        
        vec3 calcDirLight(${dirLightStructName} light, vec3 normal, vec3 viewDir);
        vec3 calcPointLight(${pointLightStructName} light, vec3 normal, vec3 viewDir, vec3 fragPos);
        
        void main()
        {
            vec3 normal = normalize(${V_NORMAL});
            vec3 viewDir = normalize(${U_EYEPOSITION} - ${V_FRAGPOS});
            
            vec3 result = vec3(0.0, 0.0, 0.0);
            // result += calcDirLight(dirLight, normal, viewDir);
            for(int i=0;i<NR_POINT_LIGHTS;i++)
                result += calcPointLight(light[i], normal, viewDir, ${V_FRAGPOS});
            
            result *= ${V_POINTCOLOR};
            
            gl_FragColor = vec4(result, 1.0);
        }
        
        vec3 calcDirLight(${dirLightStructName} light, vec3 normal, vec3 viewDir){
            vec3 lightDir = normalize(-light.direction);
            // diffuse shading
            float diff = max(dot(normal, lightDir), 0.0);
            // specular shading
            vec3 reflectDir = reflect(-lightDir, normal);
            float shininess = 64.0;
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
            // combine results
            vec3 ambient  = light.ambient  * vec3(1.0, 0.5, 0.31);
            vec3 diffuse  = light.diffuse  * diff * vec3(1.0, 0.5, 0.31);
            vec3 specular = light.specular * spec * vec3(0.5, 0.5, 0.5);
            return (ambient + diffuse + specular);
        }
        
        vec3 calcPointLight(${pointLightStructName} light, vec3 normal, vec3 viewDir, vec3 fragPos){
            vec3 lightDir = normalize(light.position - fragPos);
            // diffuse shading
            float diff = max(dot(normal, lightDir), 0.0);
            // specular shading
            vec3 reflectDir = reflect(-lightDir, normal);
            float shininess = 32.0;
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
            // attenuation
            float distance    = length(light.position - fragPos);
            float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));    
            // combine results
            vec3 ambient  = light.ambient  * vec3(1.0, 0.5, 0.31);
            vec3 diffuse  = light.diffuse  * diff * vec3(1.0, 0.5, 0.31);
            vec3 specular = light.specular * spec * vec3(0.5, 0.5, 0.5);
            ambient  *= attenuation;
            diffuse  *= attenuation;
            specular *= attenuation;
            return (ambient + diffuse + specular);
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
        //position     color          normal
        1.0, 1.0, 1.0, color[0], color[1], color[2], 0.0, 0.0, 1.0,//v0
        -1.0, 1.0, 1.0, color[0], color[1], color[2], 0.0, 0.0, 1.0,  //v1
        -1.0, -1.0, 1.0, color[0], color[1], color[2], 0.0, 0.0, 1.0, //v2
        1.0, 1.0, 1.0, color[0], color[1], color[2], 0.0, 0.0, 1.0,//v0
        -1.0, -1.0, 1.0, color[0], color[1], color[2], 0.0, 0.0, 1.0, //v2
        1.0, -1.0, 1.0, color[0], color[1], color[2], 0.0, 0.0, 1.0,//v3

        1.0, 1.0, 1.0, color[0], color[1], color[2], 1.0, 0.0, 0.0,//v0
        1.0, -1.0, 1.0, color[0], color[1], color[2], 1.0, 0.0, 0.0,//v3
        1.0, -1.0, -1.0, color[0], color[1], color[2], 1.0, 0.0, 0.0, //v4
        1.0, 1.0, 1.0, color[0], color[1], color[2], 1.0, 0.0, 0.0,//v0
        1.0, -1.0, -1.0, color[0], color[1], color[2], 1.0, 0.0, 0.0, //v4
        1.0, 1.0, -1.0, color[0], color[1], color[2], 1.0, 0.0, 0.0,//v5

        1.0, 1.0, 1.0, color[0], color[1], color[2], 0.0, 1.0, 0.0,//v0
        1.0, 1.0, -1.0, color[0], color[1], color[2], 0.0, 1.0, 0.0,//v5
        -1.0, 1.0, -1.0, color[0], color[1], color[2], 0.0, 1.0, 0.0, //v6
        1.0, 1.0, 1.0, color[0], color[1], color[2], 0.0, 1.0, 0.0,//v0
        -1.0, 1.0, 1.0, color[0], color[1], color[2], 0.0, 1.0, 0.0, //v1
        -1.0, 1.0, -1.0, color[0], color[1], color[2], 0.0, 1.0, 0.0, //v6

        -1.0, 1.0, 1.0, color[0], color[1], color[2], -1.0, 0.0, 0.0, //v1
        -1.0, 1.0, -1.0, color[0], color[1], color[2], -1.0, 0.0, 0.0, //v6
        -1.0, -1.0, -1.0, color[0], color[1], color[2], -1.0, 0.0, 0.0,  //v7
        -1.0, 1.0, 1.0, color[0], color[1], color[2], -1.0, 0.0, 0.0, //v1
        -1.0, -1.0, 1.0, color[0], color[1], color[2], -1.0, 0.0, 0.0, //v2
        -1.0, -1.0, -1.0, color[0], color[1], color[2], -1.0, 0.0, 0.0,  //v7

        1.0, -1.0, 1.0, color[0], color[1], color[2], 0.0, -1.0, 0.0,//v3
        1.0, -1.0, -1.0, color[0], color[1], color[2], 0.0, -1.0, 0.0, //v4
        -1.0, -1.0, -1.0, color[0], color[1], color[2], 0.0, -1.0, 0.0,  //v7
        -1.0, -1.0, 1.0, color[0], color[1], color[2], 0.0, -1.0, 0.0, //v2
        1.0, -1.0, 1.0, color[0], color[1], color[2], 0.0, -1.0, 0.0,//v3
        -1.0, -1.0, -1.0, color[0], color[1], color[2], 0.0, -1.0, 0.0,  //v7

        1.0, -1.0, -1.0, color[0], color[1], color[2], 0.0, 0.0, -1.0, //v4
        -1.0, 1.0, -1.0, color[0], color[1], color[2], 0.0, 0.0, -1.0, //v6
        -1.0, -1.0, -1.0, color[0], color[1], color[2], 0.0, 0.0, -1.0,  //v7
        1.0, -1.0, -1.0, color[0], color[1], color[2], 0.0, 0.0, -1.0, //v4
        1.0, 1.0, -1.0, color[0], color[1], color[2], 0.0, 0.0, -1.0,//v5
        -1.0, 1.0, -1.0, color[0], color[1], color[2], 0.0, 0.0, -1.0, //v6

    ]
    const indexlength = 9
    const normalModel = new Matrix4()
    normalModel.setInverseOf(model)
    normalModel.transpose()
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
    const u_normalModel = gl.getUniformLocation(gl.program, U_NORMALMODEL)
    const u_eyePosition = gl.getUniformLocation(gl.program, U_EYEPOSITION)

    // find direction light and give the value.
    const u_dirLightDirection = gl.getUniformLocation(gl.program, 'dirLight.direction')
    const u_dirLightColor = gl.getUniformLocation(gl.program, 'dirLight.color')
    const u_dirLightAmbient = gl.getUniformLocation(gl.program, 'dirLight.ambient')
    const u_dirLightDiffuse = gl.getUniformLocation(gl.program, 'dirLight.diffuse')
    const u_dirLightSpecular = gl.getUniformLocation(gl.program, 'dirLight.specular')
    gl.uniform3fv(u_dirLightDirection, lightDirection.elements)
    gl.uniform3fv(u_dirLightColor, lightColor.elements)
    gl.uniform3fv(u_dirLightAmbient, new Vector3([0.3, 0.24, 0.14]).elements)
    gl.uniform3fv(u_dirLightDiffuse, new Vector3([0.5, 0.5, 0.31]).elements)
    gl.uniform3fv(u_dirLightSpecular, new Vector3([0.5, 0.5, 0.5]).elements)

    // find point light and give the value
    const u_lightPosition = gl.getUniformLocation(gl.program, 'light[0].position')
    const u_lightColor = gl.getUniformLocation(gl.program, 'light[0].color')
    const u_ambient = gl.getUniformLocation(gl.program, 'light[0].ambient')
    const u_diffuse = gl.getUniformLocation(gl.program, 'light[0].diffuse')
    const u_specStrength = gl.getUniformLocation(gl.program, 'light[0].specular')
    const u_constant = gl.getUniformLocation(gl.program, 'light[0].constant')
    const u_linear = gl.getUniformLocation(gl.program, 'light[0].linear')
    const u_quadratic = gl.getUniformLocation(gl.program, 'light[0].quadratic')
    gl.uniform3fv(u_lightPosition, new Vector3([0.5, 1.2, -0.5]).elements)
    gl.uniform3fv(u_lightColor, new Vector3([1.0, 1.0, 1.0]).elements)
    gl.uniform3fv(u_ambient, new Vector3([0.3, 0.24, 0.14]).elements)
    gl.uniform3fv(u_diffuse, new Vector3([0.5, 0.5, 0.31]).elements)
    gl.uniform3fv(u_specStrength, new Vector3([0.5,0.5,0.5]).elements)
    gl.uniform1f(u_constant, 1.0)
    gl.uniform1f(u_linear, 0.09)
    gl.uniform1f(u_quadratic, 0.032)

    gl.uniformMatrix4fv(u_projection, false, projection.elements)
    gl.uniformMatrix4fv(u_view, false, view.elements)
    gl.uniformMatrix4fv(u_model, false, model.elements)
    gl.uniformMatrix4fv(u_normalModel, false, normalModel.elements)

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


    const lightDirection = new Vector3([0.0, -2.5, 4.0])
    const lightColor = new Vector3([1.0, 1.0, 1.0])
    const ambientLight = new Vector3([0.2, 0.2, 0.2])
    const eyePosition = new Vector3([0.0, 2.5, 4.0])
    const projection = new Matrix4().setPerspective(30, 1, 1, 100)
    let view = new Matrix4().lookAt(0.0, 2.5, 4.0, 0, 0, 0, 0, 1, 0)
    const model1 = new Matrix4().scale(0.5, 0.5, 0.5).rotate(0.0, 1.0, 0.0, 0.0).translate(0.0, 0.0, 0.0)
    // const model2 = new Matrix4().scale(0.3, 0.3, 0.3).rotate(45.0, 1.0, 0.0, 0.0).translate(-2.5, 2.5, 0.2)
    //draw light
    const pointlightPosition = new Vector3([0.5, 1.2, -0.5])
    const lightModel = new Matrix4().translate(pointlightPosition.elements[0], pointlightPosition.elements[1], pointlightPosition.elements[2]).scale(0.2, 0.2, 0.2)
    drawRectangle(gl, eyePosition, projection, view, model1, lightDirection, lightColor, ambientLight, new Vector3([1.0, 0.0, 0.0]).elements)
    // drawRectangle(gl, eyePosition, projection, view, model2, lightDirection, lightColor, ambientLight, new Vector3([0.0, 1.0, 0.0]).elements)
    drawRectangle(gl, eyePosition, projection, view, lightModel, lightDirection, lightColor, ambientLight, new Vector3([1.0, 1.0, 1.0]).elements)


    const button = document.getElementById('button')
    button.addEventListener('click', (e) => {
        view = view.rotate(10.0, 0.0, 1.0, 0.0)
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        drawRectangle(gl, eyePosition, projection, view, model1, lightDirection, lightColor, ambientLight, new Vector3([1.0, 0.0, 0.0]).elements)
        drawRectangle(gl, eyePosition, projection, view, lightModel, lightDirection, lightColor, ambientLight, new Vector3([1.0, 1.0, 1.0]).elements)
    })

}