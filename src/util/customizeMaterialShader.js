/**
 * Quick hack method to customize the three js material parameters. Plugs into onBeforeCompile in three's material
 * settings to customize its shader source
 *
 * @param {Object} parameters           material settings
 * @param {string} [defs]               additional glsl definitions
 * @param {string} [project_vertex]     project_vertex snippet replacement
 *
 * @return {function} onBeforeCompile function
 */
export default function customizeMaterialShader(parameters, defs = "", project_vertex = "")
{
    parameters.onBeforeCompile = ( shader, renderer) =>
    {
        if (defs.length)
        {
            shader.vertexShader = shader.vertexShader.replace("void main() {", `
                    ${ defs }
                    void main() {`
            )
        }

        if (project_vertex.length)
        {
            shader.vertexShader = shader.vertexShader.replace("#include <project_vertex>", project_vertex)
        }
    }

    return parameters
}
