export function optimizeCloudinaryImage(url, width) {
  if (typeof url !== "string" || !Number.isInteger(width) || width <= 0) return url;

  const uploadPath = "/image/upload/";
  const uploadIndex = url.indexOf(uploadPath);
  if (!url.startsWith("https://res.cloudinary.com/") || uploadIndex < 0) return url;

  const insertionIndex = uploadIndex + uploadPath.length;
  const transformations = `f_auto,q_auto,c_limit,w_${width}`;
  return `${url.slice(0, insertionIndex)}${transformations}/${url.slice(insertionIndex)}`;
}
