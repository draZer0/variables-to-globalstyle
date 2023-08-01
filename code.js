console.clear();

function exportToCSSVariables() {
    const collections = figma.variables.getLocalVariableCollections();
    let cssVariables = "";

    collections.forEach((collection) => {
        cssVariables += processCollectionToCSSVariables(collection);
    });

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
${addIndentation(cssVariables, 8)}
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

function getValue(value, resolvedType) {
    if (value.type === "VARIABLE_ALIAS") {
        return `var(--${figma.variables.getVariableById(value.id).name.replace(/\//g, "-")})`;
    } else if (resolvedType === "COLOR") {
        return rgbToHex(value);
    } else {
        return value;
    }
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

function addIndentation(text, spaces) {
    return text
        .split('\n')
        .map((line) => line.padStart(line.length + spaces, ' '))
        .join('\n');
}