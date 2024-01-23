import { URL } from 'url';

const filename = new URL('', import.meta.url).pathname;
const dirname = new URL('.', import.meta.url).pathname;

console.log(`${filename} ${dirname}`)