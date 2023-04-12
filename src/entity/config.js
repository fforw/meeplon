const EntitySystem = require("@fforw/entity")
const config = require("../../entity-config.json")
const $entity = require("@fforw/entity/entity.macro")

const sys = new EntitySystem(config)

let idCounter = 0
    sys.onEnter(
        sys.mask("Identity"),
        identified => {
            $entity(identified => {
                identified.id = idCounter++
            })
        })

//console.log("ENTITY SYSTEM", sys)

module.exports = sys
