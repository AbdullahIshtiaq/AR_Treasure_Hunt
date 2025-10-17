// polyfills.ts
import { decode, encode } from 'base-64';

// Polyfill for URL
import 'react-native-url-polyfill/auto';

// Polyfill for Buffer
if (!global.Buffer) {
  global.Buffer = require('buffer').Buffer;
}

// Polyfill for Base64
if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

console.log('✅ Polyfills loaded successfully');