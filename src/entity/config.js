const EntitySystem = require("./EntitySystem")
const config = require("../../entity-config.json")
const $entity = require("../util/entity.macro")

const entitySystem = new EntitySystem(config)

let idCounter = 0
$entity(identified => {
    entitySystem.onEnter(
        entitySystem.mask("Identity"),
        identified => {
            identified.id = idCounter++
        })
})

module.exports = entitySystem
