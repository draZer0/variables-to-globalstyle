console.clear();

function exportToCSSVariables() {
    const collections = figma.variables.getLocalVariableCollections();
    let cssVariables = "";

    collections.forEach((collection) => {
        cssVariables += processCollectionToCSSVariables(collection);
    });
    
    const textStyles = figma.getLocalTextStyles();
    let processedTextStyles = processTextStylesToCSSVariables(textStyles);

    const globalStyle = `
import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle\`
    * {
        box-sizing: border-box;
    }

    html, body {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        line-height: 1.5;
        -webkit-text-size-adjust: 100%;
        tab-size: 4;
        font-feature-settings: normal;
    }

    :root {
        // Colors
${addIndentation(cssVariables, 8)}

        // Font 
${addIndentation(processedTextStyles, 8)}
    }
\`;
    `;

    figma.ui.postMessage({ type: "EXPORT_RESULT", globalStyle });
}

function processCollectionToCSSVariables({ modes, variableIds }) {
    let cssVariables = "";

    modes.forEach((mode) => {
        variableIds.forEach((variableId) => {
            const { name, resolvedType, valuesByMode } = figma.variables.getVariableById(variableId);
            const value = valuesByMode[mode.modeId];

            if (value !== undefined && ["COLOR", "FLOAT"].includes(resolvedType)) {
                cssVariables += `--${name.replace(/\//g, "-")}: ${getValue(value, resolvedType)};\n`;
            }
        });
    });

    return cssVariables;
}

function processTextStylesToCSSVariables(textStyles) {
    const fontFamilies = new Set();
    const fontWeights = new Set();
    
    let fontFamilyStyles = "";
    let fontSizeStyles = "";
    let fontWeightStyles = "";

    textStyles.forEach((textStyle) => {
        const { name, fontName, fontSize } = textStyle;
        
        const fontKey = `${fontName.family.toLowerCase().replace(/ /g, "-")}`;
        if (!fontFamilies.has(fontKey)) {
            fontFamilyStyles += `--font-${fontKey}: '${fontName.family}', sans-serif;\n`;
            fontFamilies.add(fontKey);
        }

        const fontWeightData = fontWeightToKeyValuePair(fontName.style);
        const fontWeightKey = fontWeightData.key;
        if (fontWeightKey && !fontWeights.has(fontWeightKey)) {
            fontWeightStyles += `--font-weight-${fontWeightKey}: ${fontWeightData.value};\n`;
            fontWeights.add(fontWeightKey);
        }

        fontSizeStyles += `--font-size-${name}: ${fontSize}px;\n`;
    });

    return fontFamilyStyles + fontSizeStyles + fontWeightStyles;
}

figma.ui.onmessage = (e) => {
    console.log("code received message", e);
    exportToCSSVariables();
};

figma.showUI(__uiFiles__["export"], {
    width: 768,
    height: 500,
    themeColors: true,
});

function addIndentation(text, spaces) {
    return text
        .split('\n')
        .map((line) => line.padStart(line.length + spaces, ' '))
        .join('\n');
}

function getValue(value, resolvedType) {
    if (value.type === "VARIABLE_ALIAS") {
        return `var(--${figma.variables.getVariableById(value.id).name.replace(/\//g, "-")})`;
    } else if (resolvedType === "COLOR") {
        return rgbToHex(value);
    } else {
        return value;
    }
}

function fontWeightToKeyValuePair(fontWeight) {
    const fontWeightMap = {
        "Thin": 100,
        "ExtraLight": 200,
        "UltraLight": 200,
        "Light": 300,
        "Regular": 400,
        "Normal": 400,
        "Medium": 500,
        "SemiBold": 600,
        "DemiBold": 600,
        "Bold": 700,
        "ExtraBold": 800,
        "UltraBold": 800,
        "Black": 900,
        "Heavy": 900,
    };

    const weightKey = Object.keys(fontWeightMap).find(key => key.toLowerCase() === fontWeight.toLowerCase().replace(/ /g, ""));

    return weightKey ? { key: weightKey.toLowerCase().replace(/ /g, "-"), value: fontWeightMap[weightKey] } : null;
}

function rgbToHex({ r, g, b, a }) {
    if (a !== undefined && a !== 1) {
        return `rgba(${[r, g, b]
            .map((n) => Math.round(n * 255))
            .join(", ")}, ${a.toFixed(2)})`;
    }
    const toHex = (value) => {
        const hex = Math.round(value * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };

    const hex = [toHex(r), toHex(g), toHex(b)].join("");
    return `#${hex}`;
}