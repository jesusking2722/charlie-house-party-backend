const getFileCategory = (mimeType) => {
  if (mimeType.startsWith("image/")) return "photo";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "file";
};

const formatTimestamp = () => {
  const now = new Date();
  return now
    .toISOString()
    .replace(/T/, "_")
    .replace(/\..+/, "")
    .replace(/:/g, "-");
};

module.exports = { getFileCategory, formatTimestamp };
