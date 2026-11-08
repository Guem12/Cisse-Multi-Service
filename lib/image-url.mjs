export function optimizeCloudinaryImage(url, width) {
  if (typeof url !== "string" || !url) return url;
  if (!Number.isInteger(width) || width <= 0) return preferWebp(url);

  if (url.includes("images.unsplash.com")) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fm", "webp");
      parsed.searchParams.set("q", "75");
      parsed.searchParams.set("w", String(width));
      parsed.searchParams.set("fit", "crop");
      return parsed.toString();
    } catch {
      return url;
    }
  }

  const uploadPath = "/image/upload/";
  const uploadIndex = url.indexOf(uploadPath);
  if (!url.startsWith("https://res.cloudinary.com/") || uploadIndex < 0) return preferWebp(url);

  const insertionIndex = uploadIndex + uploadPath.length;
  const transformations = `f_auto,q_auto,c_limit,w_${width}`;
  return `${url.slice(0, insertionIndex)}${transformations}/${url.slice(insertionIndex)}`;
}

export function responsiveImageSrcSet(url, widths = [320, 480, 640, 960, 1280]) {
  if (
    typeof url !== "string" ||
    (!url.startsWith("https://res.cloudinary.com/") && !url.includes("images.unsplash.com"))
  ) {
    return undefined;
  }
  return widths.map((width) => `${optimizeCloudinaryImage(url, width)} ${width}w`).join(", ");
}

function preferWebp(url) {
  if (!url.includes("images.unsplash.com")) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("auto", "format");
    parsed.searchParams.set("fm", "webp");
    return parsed.toString();
  } catch {
    return url;
  }
}
