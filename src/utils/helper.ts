/**
 * Copies the given text to the clipboard asynchronously.
 *
 * This function uses the Clipboard API to perform the copy operation.  It provides
 * user feedback via an alert (for demonstration purposes).  In a real application,
 * you would likely use a more user-friendly method like a toast notification.
 *
 * @param text The text to copy to the clipboard.
 * @returns A Promise that resolves when the text is successfully copied, or rejects
 *          if an error occurs (e.g., Clipboard API not supported).  The Promise
 *          does not resolve with a value (void).
 * @throws {Error} If the Clipboard API is not supported by the browser.
 */
export async function copyToClipboardAsync(text: string): Promise<void> {
  if (!navigator.clipboard) {
    throw new Error('Clipboard API not supported.');
  }

  try {
    await navigator.clipboard.writeText(text);
    console.log('Text copied to clipboard successfully!');
    alert('Text Copied!'); // Example feedback (replace with a better method in production)
  } catch (err) {
    console.error('Failed to copy text: ', err);
    alert('Copy failed: ' + err); // Example feedback (replace with a better method in production)
    throw err; // Re-throw the error for handling by the caller
  }
}

/**
 * Copies the given text to the clipboard synchronously (if possible).
 *
 * This function attempts to use the Clipboard API to copy the text.  If the
 * Clipboard API is not available or an error occurs, it will log an error
 * to the console but will not throw an exception.  Synchronous clipboard
 * access is restricted by browsers for security reasons, so this function
 * may not always work as expected.  It's generally better to use the
 * asynchronous `copyToClipboardAsync` function if possible.
 *
 * @param text The text to copy to the clipboard.
 */
export function copyToClipboardSync(text: string): void {
  if (!navigator.clipboard) {
    console.error('Clipboard API not supported.');
    return; // Or handle it differently, e.g., fallback to an older method if needed
  }

  try {
    // Attempt synchronous copy (might not always succeed)
    navigator.clipboard.writeText(text);
    console.log(
      'Text copied to clipboard (synchronously - may not have succeeded).',
    );
  } catch (err) {
    console.error('Failed to copy text (synchronously): ', err);
  }
}

// Example usage:
//copyToClipboardSync("This is the text to copy.");

/**
 * Removes duplicates from an array.
 * @param arr - The input array
 * @returns A new array with unique elements
 */
export const uniqueArray = <T>(arr: T[]): T[] => [...new Set(arr)];
