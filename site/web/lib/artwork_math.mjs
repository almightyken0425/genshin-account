const ZOOM_MIN = 0.1;
const ZOOM_MAX = 20;
const OFFSET_LIMIT = 20;

const finite = value => typeof value === 'number' && Number.isFinite(value);

function positiveSize(size) {
  if (!size || !finite(size.width) || !finite(size.height) || size.width <= 0 || size.height <= 0) {
    throw new RangeError('Image and frame dimensions must be positive finite numbers.');
  }
  return size;
}

export function frameSize(role) {
  if (role === 'roster') return { width: 600, height: 800 };
  if (role === 'portrait') return { width: 900, height: 900 };
  throw new RangeError('Unknown artwork role.');
}

export function assertValidView(view) {
  if (!view || typeof view !== 'object' || Array.isArray(view)
      || !finite(view.zoom) || view.zoom < ZOOM_MIN || view.zoom > ZOOM_MAX
      || !finite(view.offsetX) || Math.abs(view.offsetX) > OFFSET_LIMIT
      || !finite(view.offsetY) || Math.abs(view.offsetY) > OFFSET_LIMIT) {
    throw new RangeError('View requires finite zoom (0.1–20) and offsets (−20–20).');
  }
  return { zoom: view.zoom, offsetX: view.offsetX, offsetY: view.offsetY };
}

export function clampView(view) {
  const clamp = (value, fallback, min, max) => finite(value) ? Math.min(max, Math.max(min, value)) : fallback;
  return {
    zoom: clamp(view?.zoom, 1, ZOOM_MIN, ZOOM_MAX),
    offsetX: clamp(view?.offsetX, 0, -OFFSET_LIMIT, OFFSET_LIMIT),
    offsetY: clamp(view?.offsetY, 0, -OFFSET_LIMIT, OFFSET_LIMIT),
  };
}

export function imagePlacement(source, view, frame) {
  positiveSize(source);
  positiveSize(frame);
  const valid = assertValidView(view);
  const scale = Math.min(frame.width / source.width, frame.height / source.height) * valid.zoom;
  const width = source.width * scale;
  const height = source.height * scale;
  return {
    left: (frame.width - width) / 2 + valid.offsetX * frame.width,
    top: (frame.height - height) / 2 + valid.offsetY * frame.height,
    width,
    height,
  };
}

export function viewFromCrop(crop, role) {
  const frame = frameSize(role);
  const width = crop?.w ?? crop?.width;
  const height = crop?.h ?? crop?.height;
  const source = { width: crop?.sourceWidth, height: crop?.sourceHeight };
  positiveSize(source);
  positiveSize({ width, height });
  if (!finite(crop.x) || !finite(crop.y)) throw new RangeError('Crop coordinates must be finite.');
  if (Math.abs((width / height) / (frame.width / frame.height) - 1) > 1e-8) {
    throw new RangeError('Crop aspect ratio must match the artwork frame.');
  }
  const scale = frame.width / width;
  const containScale = Math.min(frame.width / source.width, frame.height / source.height);
  return assertValidView({
    zoom: scale / containScale,
    offsetX: ((source.width / 2 - crop.x) * scale - frame.width / 2) / frame.width,
    offsetY: ((source.height / 2 - crop.y) * scale - frame.height / 2) / frame.height,
  });
}

export function zoomView(view, nextZoom, anchorX = 0.5, anchorY = 0.5) {
  const valid = assertValidView(view);
  if (!finite(nextZoom) || nextZoom < ZOOM_MIN || nextZoom > ZOOM_MAX || !finite(anchorX) || !finite(anchorY)) {
    throw new RangeError('Zoom and anchor coordinates must be finite and zoom must be within 0.1–20.');
  }
  const ratio = nextZoom / valid.zoom;
  return {
    zoom: nextZoom,
    offsetX: ratio * valid.offsetX + (1 - ratio) * (anchorX - 0.5),
    offsetY: ratio * valid.offsetY + (1 - ratio) * (anchorY - 0.5),
  };
}
