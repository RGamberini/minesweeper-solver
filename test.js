let size = 4;
for (let i = 0; i < Math.pow(2, size); i++) {
    result = []
    console.log(`Base b: ${(i).toString(2)}`);
    for (let j = 0; j < size; j++) {
        console.log(`Right shitfted ${j}: ${!!((i >> j) & 1)}`);
        // result.push((i >> j).toString(2));
    }
    // console.log(result.join(", "))
}