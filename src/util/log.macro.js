const t = require("@babel/types")
const { createMacro, MacroError } = require("babel-plugin-macros")
const {isCallExpression, isIdentifier} = require("@babel/types")

module.exports = createMacro(logMacro)


/**
 * Babel macro
 *
 * $log(a,b,c) generates console.log("a", a, "b", b, "c", c)
 */
function logMacro({references,config, state}) {

    references.default.forEach(ref => {

        if (!isCallExpression(ref.parentPath.node))
        {
            throw new MacroError("Expected macro to be a call expression")
        }

        const args = []

        const { arguments: argsIn } = ref.parentPath.node
        for (let i = 0; i < argsIn.length; i++)
        {
            const argument = argsIn[i]
            if (isIdentifier(argument))
            {
                args.push(
                    t.stringLiteral(argument.name)
                )
            }
            args.push(
                argument
            )
        }

        ref.parentPath.replaceWith(
            t.callExpression(
                t.memberExpression(
                    t.identifier("console"),
                    t.identifier("log"),
                    false
                ),
                args
            )
        )
    })
}
