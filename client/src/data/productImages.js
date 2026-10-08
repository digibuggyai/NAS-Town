// Official product photos (QNAP and Synology press images), saved in public/images/products/
// as transparent WebP. Keyed by model so the catalogue (products) and the configurator's price
// list (models) both find them. A model without a photo falls back to the NasVisual drawing.

// key: [width, height] of the saved file, so the browser reserves the space before it loads.
const PHOTOS = {
  'ts-216g-4g': [286, 480],
  'ts-233-2g': [231, 480],
  'ts-433-4g': [442, 480],
  'ts-462-4g': [604, 480],
  'ts-464-8g': [604, 480],
  'ts-664-8g': [720, 459],
  'ts-832px-4g': [720, 366],
  'ts-873a-8g': [720, 369],
  ds223j: [328, 368],
  ds225plus: [332, 336],
  ds725plus: [334, 338],
  ds425plus: [482, 336],
  ds925plus: [480, 336],
  ds1525plus: [522, 335],
  ds1825plus: [695, 336],
};

/** "QNAP TS-433-4G" → "ts-433-4g", "DS925+" → "ds925plus". */
export const modelKey = (model = '') =>
  String(model).toLowerCase().replace(/^(qnap|synology|asustor)\s+/, '').replace(/\+/g, 'plus').replace(/[^a-z0-9-]/g, '');

/** { src, width, height } for the model's photo, or null if there isn't one. */
export function productPhoto(model) {
  const key = modelKey(model);
  const size = PHOTOS[key];
  return size ? { src: `/images/products/${key}.webp`, width: size[0], height: size[1] } : null;
}
