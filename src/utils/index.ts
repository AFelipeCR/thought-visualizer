export const lightenColor = (color: string, factor) => {
    let r,g,b;
    if(color.charAt(0) === "#")
        [r,g,b] = hexToRGB(color);
    else {
        if(!color.startsWith('rgb'))
            color =  normalizeToRGB(color);

        [r,g,b] = rgbStringToArray(color);
    }
    
    r = Math.round(r + (255 - r) * factor);
    g = Math.round(g + (255 - g) * factor);
    b = Math.round(b + (255 - b) * factor);
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export const hexToRGB = (hex: string) => {
    const hexRegex = /^#(([A-Fa-f0-9]{6})|([A-Fa-f0-9]{3}))$/;

    const match = hex.match(hexRegex);

    if (!match) {
        throw new Error(`Invalid format: "${hex}" is not a valid HEX string.`);
    }

    let h = parseInt(match[1], 16);
    
    let r = (h >> 16) & 0xFF;
    let g = (h >> 8) & 0xFF;
    let b = h & 0xFF;

    return [r, g, b];
}

export const hexToRGBString = (hex: string) => {
    const [r,g,b] = hexToRGB(hex);
    return `rgb(${r}, ${g}, ${b})`;
}

export const rgbStringToHex = (rgb: string) => {
    const [r, g, b] = rgbStringToArray(rgb);
    return rgbToHex(r, g, b);
}

export const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

export const rgbStringToArray = (rgb:string) => {
    const rgbRegex = new RegExp([
        '^rgb\\(',
        '\\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)',
        '\\s*,\\s*',
        '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)',
        '\\s*,\\s*',
        '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)',
        '\\s*\\)$'
    ].join(''), 'i');
    
    const match = rgb.match(rgbRegex);

    if (!match) {
        throw new Error(`Invalid format: "${rgb}" is not a valid RGB string.`);
    }

    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);

    return [r, g, b];
}

export const normalizeToRGB = (color: string): string => {
    const tempDiv = document.createElement("div");
    tempDiv.style.display = "none";
    tempDiv.style.color = color;
    document.body.appendChild(tempDiv);
    const rgb = window.getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);

    return rgb;
};