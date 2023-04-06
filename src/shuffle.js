import env from "./env"


export default function shuffle(rnd, a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(rnd.next(0, (i + 1)));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
