export default function getDistance(x0, y0, z0, x1, y1, z1)
{
    const dx = x1 - x0
    const dy = y1 - y0
    const dz = z1 - z0

    return Math.sqrt(dx * dx + dy * dy + dz * dz)
}
