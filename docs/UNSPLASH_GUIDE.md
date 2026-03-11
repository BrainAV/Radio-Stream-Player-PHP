# Guide: Formatting Unsplash Links for Backgrounds

To ensure wallpapers display correctly in the Radio Stream Player, you should use direct image URLs rather than the standard Unsplash page link.

### ❌ What NOT to use:
Standard page link:
`https://unsplash.com/photos/brown-glass-bottle-across-two-women-BC49M6wl--8`

### ✅ What TO use:
Direct source link (from `images.unsplash.com`):
`https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1950`

---

### How to get the correct link:

1.  **Find your image** on Unsplash.
2.  **Right-click** on the image.
3.  Select **"Copy Link to Image"** (or "Open Image in New Tab" and copy that URL).
4.  **Recommended Parameters**: For the best performance and visual fit, ensure your link ends with (or includes) the following query parameters:
    - `?auto=format`: Serves the best image format for the user's browser (e.g., WebP).
    - `&fit=crop`: Ensures the image fills the screen without stretching.
    - `&w=1950`: Pins the width to a high enough resolution for most monitors while keeping the file size manageable.

**Example of a fully optimized URL:**
```text
https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1950
```

### Why does this matter?
The player uses CSS `background-image: url(...)`. Standard Unsplash page links return an HTML document, which CSS cannot use as an image, resulting in a blank background.
