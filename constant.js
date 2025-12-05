 const generateUniqueFilename = () => {
    return `file-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  };

module.exports = {
  generateUniqueFilename,
};