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

export const modelKey = (model = '') =>
  String(model).toLowerCase().replace(/^(qnap|synology|asustor)\s+/, '').replace(/\+/g, 'plus').replace(/[^a-z0-9-]/g, '');

export function productPhoto(model) {
  const key = modelKey(model);
  const size = PHOTOS[key];
  return size ? { src: `/images/products/${key}.webp`, width: size[0], height: size[1] } : null;
}
