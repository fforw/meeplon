export function clamp(v)
{
    return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function buttonPressed(b) {
    if (typeof b === "object") {
        return b.pressed;
    }
    return b === 1.0;
}

export function forEachHalfEdge(face, fn)
{
    const first = face.halfEdge;
    let curr = first;
    do
    {
        fn(curr)
        curr = curr.next
    }  while (curr !== first)
}
