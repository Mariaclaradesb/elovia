import * as ImageManipulator from 'expo-image-manipulator';

export async function preparePickedImage(asset, fallbackName = `foto-${Date.now()}.jpg`) {
  if (!asset?.uri) return asset;

  const maxSide = Math.max(asset.width || 0, asset.height || 0);
  const shouldResize = maxSide > 1200;
  const resizeAction = shouldResize
    ? [{ resize: asset.width >= asset.height ? { width: 1200 } : { height: 1200 } }]
    : [];

  const result = await ImageManipulator.manipulateAsync(
    asset.uri,
    resizeAction,
    {
      compress: 0.55,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );

  return {
    ...asset,
    uri: result.uri,
    width: result.width,
    height: result.height,
    fileName: asset.fileName || asset.name || fallbackName,
    name: asset.name || asset.fileName || fallbackName,
    mimeType: 'image/jpeg',
    type: 'image/jpeg',
  };
}
