import { describe, it } from "mocha";
import assert from "power-assert";
import $entity from "@fforw/entity/entity.macro"
import EntitySystem from "@fforw/entity";

describe("Entity List", () => {
    it("manages lists", () => {

        const sys = new EntitySystem( require("./list-config.json") )

        const lists = new Map()
        const listMask = sys.mask(["EntityList"])
        const itemMask = sys.mask(["EntityListItem"])


        sys.onEnter(listMask, list => {
            $entity(list => {
                console.log("CREATE #"+ list)
                lists.set(list, [])
            })
        })

        sys.onExit(listMask, list => {
            $entity(list => {
                console.log("DESTROY #" + list)
                lists.delete(list)
            })
        })

        sys.onEnter(itemMask, item => {
            $entity(item => {
                console.log("ADD", item.valueEntity, "to #",  item.entityListRef)
                lists.get(item.entityListRef).push(item.valueEntity)
            })
        })
        sys.onExit(itemMask, item => {
            $entity(item => {
                console.log("REMOVE", item.valueEntity, "from #", item.entityListRef)
                lists.set(item.entityListRef,
                    lists.get(item.entityListRef).filter(n => n !== item.valueEntity)
                )
            })
        })

        const entityListRef = sys.newEntity({ "_" : ["EntityList"] })

        const item = sys.newEntity({
            entityListRef: 0,
            valueEntity: 12
        })

        const item2 = sys.newEntity({
            entityListRef: 0,
            valueEntity: 14
        })

        assert.deepEqual(lists.get(0), [12, 14])

        sys.removeComponent(item2, "EntityListItem")
        assert.deepEqual(lists.get(0), [14])
        sys.removeComponent(item, "EntityListItem")
        assert.deepEqual(lists.get(0), [])
    })
})
