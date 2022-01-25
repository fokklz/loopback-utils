/**
 * add or remove values from a string array
 *
 * @export
 * @param {Array<string>} arr
 * @param {...string[]} extras
 * @return {*}
 */
export function modifyArray(arr: Array<string>, ...extras: string[]) {
  for (const extra of extras) {
    if (extra.startsWith('!')) {
      if (arr.includes(extra)) {
        arr.splice(arr.indexOf(extra), 1);
      }
    } else {
      if (!arr.includes(extra)) {
        arr.push(extra);
      }
    }
  }
  return arr;
}
