import entity from "./util/entity.macro"

export default function testMacro(a,b)
{
        entity(a,b, () => {
            a.x = 0
            console.log(b.y)
        })
}
