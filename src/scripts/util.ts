function mulberry32(a: number)  {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

const static_random = mulberry32(4);

function pre_filled_array<T>(size: number, value: T): T[] {
    return Array.from({ length: size }, () => value);
}

function pre_filled_2d_array<T>(size: number, value: T): T[][] {
    return Array.from({ length: size }, () => Array.from({ length: size }, () => value));
}

function fixed_shuffle(array: any[]): any[] {
    var currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(static_random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

export {pre_filled_array, pre_filled_2d_array, static_random, fixed_shuffle}