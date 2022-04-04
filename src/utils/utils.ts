import d3 from './d3-import';
import type { Icon } from './my-types';
// import type { SvelteComponent } from 'svelte';

/**
 * Round a number to a given decimal.
 * @param {number} num Number to round
 * @param {number} decimal Decimal place
 * @returns number
 */
export const round = (num: number, decimal: number) => {
  return Math.round((num + Number.EPSILON) * 10 ** decimal) / 10 ** decimal;
};

/**
 * Get a random number between [min, max], inclusive
 * @param {number} min Min value
 * @param {number} max Max value
 * @returns number
 */
export const random = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

/**
 * Pre-process the svg string to replace fill, stroke, color settings
 * @param {string} svgString
 * @param {string[]} resetColors A list of colors to reset to currentcolor
 * @returns {string}
 */
export const preProcessSVG = (svgString: string, resetColors = []) => {
  let newString = svgString
    .replaceAll('black', 'currentcolor')
    .replaceAll('fill:none', 'fill:currentcolor')
    .replaceAll('stroke:none', 'fill:currentcolor');

  resetColors.forEach(c => {
    newString = newString.replaceAll(c, 'currentcolor');
  });

  return newString;
};

/**
 * Dynamically bind SVG files as inline SVG strings in this component
 * @param {HTMLElement} component Current component
 * @param {Icon[]} iconList A list of icon mappings (class => icon string)
 */
export const bindInlineSVG = (component: HTMLElement, iconList: Icon[]) => {
  iconList.forEach(d => {
    d3.select(component)
      .selectAll(`.svg-icon.${d.class}`)
      .each((_, i, g) => {
        const ele = d3.select(g[i]);
        let html = ele.html();
        html = html.concat(' ', preProcessSVG(d.svg));
        ele.html(html);
      });
  });
};

/**
 * Download a JSON file
 * @param {any} object
 * @param {HTMLElement | null} [dlAnchorElem]
 * @param {string} [fileName]
 */
export const downloadJSON = (
  object: object,
  dlAnchorElem: HTMLElement | null = null,
  fileName = 'download.json'
) => {
  const dataStr =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(object));

  // Create dlAnchor if it is not given
  let myDlAnchorElem = dlAnchorElem;
  let needToRemoveAnchor = false;

  if (dlAnchorElem === null) {
    myDlAnchorElem = document.createElement('a');
    myDlAnchorElem.style.display = 'none';
    needToRemoveAnchor = true;
  }

  myDlAnchorElem?.setAttribute('href', dataStr);
  myDlAnchorElem?.setAttribute('download', `${fileName}`);
  myDlAnchorElem?.click();

  if (needToRemoveAnchor) {
    myDlAnchorElem?.remove();
  }
};

/**
 * Download a text file
 * @param {string} textString
 * @param {HTMLElement | null} [dlAnchorElem]
 * @param {string} [fileName]
 */
export const downloadText = (
  textString: string,
  dlAnchorElem: HTMLElement | null,
  fileName = 'download.json'
) => {
  const dataStr =
    'data:text/plain;charset=utf-8,' + encodeURIComponent(textString);

  // Create dlAnchor if it is not given
  let myDlAnchorElem = dlAnchorElem;
  let needToRemoveAnchor = false;

  if (dlAnchorElem === null) {
    myDlAnchorElem = document.createElement('a');
    myDlAnchorElem.style.display = 'none';
    needToRemoveAnchor = true;
  }

  myDlAnchorElem?.setAttribute('href', dataStr);
  myDlAnchorElem?.setAttribute('download', `${fileName}`);
  myDlAnchorElem?.click();

  if (needToRemoveAnchor) {
    myDlAnchorElem?.remove();
  }
};

/**
 * Compute the luminance of a RGB color
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 * @param color [R, G, B in 0..255]
 * @returns number
 */
export const getLuminance = (color: number[]) => {
  const r = color[0];
  const g = color[1];
  const b = color[2];

  // Some strange required transformations
  const transformedRGB = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return (
    transformedRGB[0] * 0.2126 +
    transformedRGB[1] * 0.7152 +
    transformedRGB[2] * 0.0722
  );
};

/**
 * Compute color contrast ratio
 * @param color1 [r, g, b] in 255 scale
 * @param color2 [r, g, b] in 255 scale
 * @returns Contrast ratio
 */
export const getContrastRatio = (color1: number[], color2: number[]) => {
  const color1L = getLuminance(color1);
  const color2L = getLuminance(color2);
  const ratio =
    color1L > color2L
      ? (color2L + 0.05) / (color1L + 0.05)
      : (color1L + 0.05) / (color2L + 0.05);
  return ratio;
};

/**
 * Check if two colors have enough contrast
 * @param color1 [r, g, b] in 255 scale
 * @param color2 [r, g, b] in 255 scale
 * @param condition 'AA' or 'AAA'
 * @param smallText If it is small text
 * @returns If two colors have enough contrast
 */
export const haveContrast = (
  color1: number[],
  color2: number[],
  condition = 'AAA',
  smallText = true
) => {
  const ratio = getContrastRatio(color1, color2);

  // Compare the ratio with different thresholds
  if (condition === 'AA') {
    if (smallText) {
      return ratio <= 1 / 4.5;
    } else {
      return ratio <= 1 / 3;
    }
  } else {
    if (smallText) {
      return ratio <= 1 / 7;
    } else {
      return ratio <= 1 / 4.5;
    }
  }
};

/**
 * Check if two sets are the same
 * @param set1 Set 1
 * @param set2 Set 2
 */
export const setsAreEqual = <T>(set1: Set<T>, set2: Set<T>): boolean => {
  return set1.size === set2.size && [...set1].every(d => set2.has(d));
};
