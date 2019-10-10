/**
 * Convert given csv string to array
 * @param {String} strData csv string data
 * @param {Boolean} header shuld parse headers & group data?
 */
const csvStringToArray = (strData, header = true) => {
    //const objPattern = new RegExp(("(\\,|\\r?\\n|\\r|^)(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^\\,\\r\\n]*))"),"gi");
    const objPattern = new RegExp(("(\\,|\\r?\\n|\\r|^)(?:\"((?:\\\\.|\"\"|[^\\\\\"])*)\"|([^\\,\"\\r\\n]*))"), "gi");
    let arrMatches = null, arrData = [[]];
    while (arrMatches = objPattern.exec(strData)) {
        if (arrMatches[1].length && arrMatches[1] !== ",") arrData.push([]);
        arrData[arrData.length - 1].push(arrMatches[2] ?
            arrMatches[2].replace(new RegExp("[\\\\\"](.)", "g"), '$1') :
            arrMatches[3]);
    }
    if (header) {
        hData = arrData.shift();
        hashData = arrData.map(row => {
            let i = 0;
            return hData.reduce((acc, key) => {
                if (!acc[key]) {
                    acc[key] = row[i++];
                } else {
                    if(Array.isArray(acc[key])) {
                        acc[key] = [row[i++]].concat(acc[key])
                    } else {
                        acc[key] = [row[i++], acc[key]]
                    }
                }
                return acc;
            }, {});
        });
        return hashData;
    } else {
        return arrData;
    }
}

module.exports = csvStringToArray;