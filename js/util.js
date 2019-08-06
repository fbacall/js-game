const X = 0;
const Y = 1;
const root2 = 1.41;

function abs(n) {
    return (n < 0 ? -n : n);
}

// Vectors!
function magnitude(vector) {
    return Math.sqrt(vector[X] * vector[X] + vector[Y] * vector[Y]);
}

function normalise(vector, factor) {
    factor = factor || 1;
    const mag = magnitude(vector);
    return [vector[X] * factor / mag, vector[Y] * factor / mag];
}
