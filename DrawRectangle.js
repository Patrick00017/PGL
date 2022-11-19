function drawRectangle(gl, eye, projection, view, model, lightDirection, lightColor, ambientLight, color) {
    const constant = {
        lightNum: 2,

        a_position: 'a_position',
        a_pointColor: 'a_pointColor',
        a_normal: 'a_normal',
        u_eyePosition: 'u_eyePosition',
        u_projection: 'u_projection',
        u_view: 'u_view',
        u_model: 'u_model',
        u_normalmodel: 'u_normalmodel',
        v_pointColor: 'v_pointColor',
        v_normal: 'v_normal',
        v_fragPos: 'v_fragPos'
    }

    const vertexShader = `
        attribute vec4 ${constant.a_position};
        attribute vec3 ${constant.a_pointColor};
        attribute vec3 ${constant.a_normal};
        
        uniform mat4 ${constant.u_projection};
        uniform mat4 ${constant.u_view};
        uniform mat4 ${constant.u_model};
        uniform mat4 ${constant.u_normalmodel};
        
        varying vec3 ${constant.v_pointColor};
        varying vec3 ${constant.v_normal};
        varying vec3 ${constant.v_fragPos};
        void main()
        {
            gl_Position = ${constant.u_projection} * ${constant.u_view} * ${constant.u_model} * ${constant.a_position};
            ${constant.v_fragPos} = mat3(${constant.u_model}) * vec3(${constant.a_position});
            ${constant.v_normal} = mat3(${constant.u_normalmodel}) * ${constant.a_normal};
            ${constant.v_pointColor} = ${constant.a_pointColor};
            gl_PointSize = 2.0;
        }
    `

    const dirLightStructName = 'DirLight'
    const dirLightStruct = `
        struct ${dirLightStructName} {
            vec3 direction;
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
            float constant;
            float linear;
            float quadratic;
        };
    `
    const fragmentShader = `
        precision mediump float;

        #define NR_POINT_LIGHTS ${constant.lightNum} 
        ${pointLightStruct}
        ${dirLightStruct}
        uniform ${pointLightStructName} light[NR_POINT_LIGHTS];
        uniform ${dirLightStructName} dirLight;
        uniform vec3 ${constant.u_eyePosition};
        varying vec3 ${constant.v_pointColor};
        varying vec3 ${constant.v_normal};
        varying vec3 ${constant.v_fragPos};
        
        vec3 calcDirLight(${dirLightStructName} light, vec3 normal, vec3 viewDir);
        vec3 calcPointLight(${pointLightStructName} light, vec3 normal, vec3 viewDir, vec3 fragPos);
        
        void main()
        {
            vec3 normal = normalize(${constant.v_normal});
            vec3 viewDir = normalize(${constant.u_eyePosition} - ${constant.v_fragPos});
            
            vec3 result = vec3(0.0, 0.0, 0.0);
            // result += calcDirLight(dirLight, normal, viewDir);
            for(int i=0;i<NR_POINT_LIGHTS;i++)
                result += calcPointLight(light[i], normal, viewDir, ${constant.v_fragPos});
            
            result *= ${constant.v_pointColor};
            
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

    const shader = new Shader(gl, constant, vertexShader, fragmentShader)
    shader.createVertexBufferAndBind(gl, vertexArray, 9)
    shader.setAttribValue(gl, 'a_position', 3, 0)
    shader.setAttribValue(gl, 'a_pointColor', 3, 3)
    shader.setAttribValue(gl, 'a_normal', 3, 6)
    shader.setUniformMatrix4fv(gl, constant.u_projection, projection)
    shader.setUniformMatrix4fv(gl, constant.u_view, view)
    shader.setUniformMatrix4fv(gl, constant.u_model, model)
    shader.setUniformMatrix4fv(gl, constant.u_normalmodel, normalModel)
    shader.setUniform3fv(gl, constant.u_eyePosition, eye)


    const dirLight = new DirectionLight(
        'dirLight',
        lightDirection,
        new Vector3([0.3, 0.24, 0.14]),
        new Vector3([0.5, 0.5, 0.31]),
        new Vector3([0.5, 0.5, 0.5])
    )
    shader.setDirLight(gl, dirLight)


    const pointLight1 = new PointLight(
        'light[0]',
        new Vector3([0.5, 1.2, -0.5]),
        new Vector3([0.3, 0.24, 0.14]),
        new Vector3([0.5, 0.5, 0.31]),
        new Vector3([0.5, 0.5, 0.5]),
        1.0,
        0.09,
        0.032
    )
    const pointLight2 = new PointLight(
        'light[1]',
        new Vector3([-0.5, 1.2, 0.5]),
        new Vector3([0.3, 0.24, 0.14]),
        new Vector3([0.5, 0.5, 0.31]),
        new Vector3([0.5, 0.5, 0.5]),
        1.0,
        0.09,
        0.032
    )
    shader.setPointLight(gl, pointLight1)
    shader.setPointLight(gl, pointLight2)


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
    const model1 = new Matrix4().scale(0.5, 0.5, 0.5).rotate(45.0, 0.0, 1.0, 0.0).translate(0.0, 0.0, 0.0)
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