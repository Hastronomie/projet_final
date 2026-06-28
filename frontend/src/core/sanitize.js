/**
* @param {*} value
* @returns {string}
*/
export function escape(value) {
const div = document.createElement('div');
div.textContent = String(value ?? '');
return div.innerHTML;
}