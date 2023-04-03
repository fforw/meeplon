export function clamp(v)
{
    return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function resolve(names, values)
{
    const indexes = []
outer:
    for (let i = 0; i < names.length; i++)
    {
        const name = names[i]
        for (let j = 0; j < values.length; j++)
        {
            const value = values[j]
            if (value.name === name)
            {
                indexes.push(j)
                continue outer;
            }
        }
        throw new Error("Could not find element with name " + name);
    }
    return indexes;
}
