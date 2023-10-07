class VMCode {
    additionMappedArray;

    constructor(rawCode) {
        let additionString = rawCode.replace(/\/\/.*/g, '');
        let additionArrayRaw = additionString.split(/\r?\n/);
        let additionArray = clearArray(additionArrayRaw);
        this.additionMappedArray = mapArray(additionArray);
    }
}

function clearArray(arr) {
    return arr.filter(item => item !== '');
}

function mapArray(arr) {
    let newArr = arr.map(item => item.split(' '));
    return newArr;
}

module.exports = VMCode; 