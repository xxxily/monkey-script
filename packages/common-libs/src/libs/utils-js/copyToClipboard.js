/* Fallback for older browsers */
function fallbackCopyTextToClipboard(text, success, error) {
  var textarea = document.createElement("textarea");
  textarea.readOnly = true;
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0.001";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    document.execCommand("copy");
    success && success(text);
  } catch (err) {
    error && error(err || new Error('[execCommand] Failed to copy'), text);
  }

  document.body.removeChild(textarea);
}

function copyToClipboard(text, success, error) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => {
        success && success(text);
      })
      .catch(err => {
        console.warn("[navigator.clipboard.writeText] Failed to copy: ", err, text);
        fallbackCopyTextToClipboard(text, success, error);
      });
  } else {
    fallbackCopyTextToClipboard(text, success, error);
  }
}

export default copyToClipboard;