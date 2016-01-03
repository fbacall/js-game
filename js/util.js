var X = 0;
var Y = 1;
var root2 = 1.41;

function abs(n) {
    return (n < 0 ? -n : n);
}

// Vectors!

function magnitude(vector) {
    return Math.sqrt(vector[X] * vector[X] + vector[Y] * vector[Y]);
}

function normalise(vector, factor) {
    factor = factor || 1;
    var mag = magnitude(vector);
    return [vector[X] * factor / mag, vector[Y] * factor / mag];
}

// Better way of inheritance
//http://stackoverflow.com/questions/4152931/javascript-inheritance-call-super-constructor-or-use-prototype-chain
function extend(base, sub) {
    // Avoid instantiating the base class just to setup inheritance
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
    // for a polyfill
    // Also, do a recursive merge of two prototypes, so we don't overwrite
    // the existing prototype, but still maintain the inheritance chain
    // Thanks to @ccnokes
    var origProto = sub.prototype;
    sub.prototype = Object.create(base.prototype);
    for (var key in origProto)  {
        sub.prototype[key] = origProto[key];
    }
    // Remember the constructor property was set wrong, let's fix it
    sub.prototype.constructor = sub;
    // In ECMAScript5+ (all modern browsers), you can make the constructor property
    // non-enumerable if you define it like this instead
    Object.defineProperty(sub.prototype, 'constructor', {
        enumerable: false,
        value: sub
    });
}
