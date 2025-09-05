/**
 * Tooltip utility component that matches Planet Horse's native tooltip styling
 * Provides rich content support with dynamic positioning and auto-cleanup
 */

import { CONFIG } from '../config.js';

export interface TooltipContent {
  title?: string;
  description?: string;
  usesLeft?: string;
  additionalInfo?: string;
}

export interface TooltipOptions {
  content: TooltipContent;
  followMouse?: boolean;
  offset?: { x: number; y: number };
  zIndex?: number;
}

/**
 * Creates and manages a tooltip instance
 */
export class Tooltip {
  private tooltipElement: HTMLDivElement | null = null;
  private isVisible = false;
  private targetElement: HTMLElement;
  private options: TooltipOptions;
  private mouseMoveHandler: ((event: MouseEvent) => void) | null = null;
  private mouseLeaveHandler: (() => void) | null = null;

  constructor(targetElement: HTMLElement, options: TooltipOptions) {
    this.targetElement = targetElement;
    this.options = {
      followMouse: false,
      offset: { x: 10, y: 10 },
      zIndex: 9999,
      ...options
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Show tooltip on mouse enter
    this.targetElement.addEventListener('mouseenter', () => {
      this.show();
    });

    // Hide tooltip on mouse leave
    this.mouseLeaveHandler = () => {
      this.hide();
    };
    this.targetElement.addEventListener('mouseleave', this.mouseLeaveHandler);

    // Follow mouse if enabled
    if (this.options.followMouse) {
      this.mouseMoveHandler = (event: MouseEvent) => {
        if (this.isVisible && this.tooltipElement) {
          this.updatePosition(event.clientX, event.clientY);
        }
      };
      this.targetElement.addEventListener('mousemove', this.mouseMoveHandler);
    }
  }

  private createTooltipElement(): HTMLDivElement {
    // Main container with fixed positioning
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      z-index: ${this.options.zIndex};
      pointer-events: none;
    `;

    // Tooltip portal (matches Planet Horse structure)
    const portal = document.createElement('div');
    portal.className = CONFIG.CSS_CLASSES.TOOLTIP_PORTAL;

    // Build content based on provided data
    if (this.options.content.title) {
      const titleElement = document.createElement('span');
      titleElement.className = CONFIG.CSS_CLASSES.TOOLTIP_TITLE;
      titleElement.textContent = this.options.content.title;
      portal.appendChild(titleElement);
    }

    if (this.options.content.description) {
      const descriptionElement = document.createElement('div');
      descriptionElement.innerHTML = this.options.content.description;
      portal.appendChild(descriptionElement);
    } 

    if (this.options.content.usesLeft) {
      const usesElement = document.createElement('span');
      usesElement.className = CONFIG.CSS_CLASSES.TOOLTIP_USES_LEFT;
      usesElement.textContent = this.options.content.usesLeft;
      portal.appendChild(usesElement);
    }

    if (this.options.content.additionalInfo) {
      const additionalElement = document.createElement('div');
      additionalElement.className = CONFIG.CSS_CLASSES.TOOLTIP_CONTENT;
      additionalElement.innerHTML = this.options.content.additionalInfo;
      portal.appendChild(additionalElement);
    }

    container.appendChild(portal);
    return container;
  }

  private updatePosition(mouseX?: number, mouseY?: number): void {
    if (!this.tooltipElement) return;

    let x: number, y: number;

    if (this.options.followMouse && mouseX !== undefined && mouseY !== undefined) {
      // Follow mouse position
      x = mouseX + this.options.offset!.x;
      y = mouseY + this.options.offset!.y;
    } else {
      // Position relative to target element
      const rect = this.targetElement.getBoundingClientRect();
      x = rect.left + this.options.offset!.x;
      y = rect.top + rect.height + this.options.offset!.y;
    }

    // Prevent tooltip from going off-screen
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (x + tooltipRect.width > viewportWidth) {
      x = viewportWidth - tooltipRect.width - 10;
    }
    if (y + tooltipRect.height > viewportHeight) {
      y = y - tooltipRect.height - (this.options.offset!.y * 2) - 10;
    }

    if (x < 0) x = 10;
    if (y < 0) y = 10;

    this.tooltipElement.style.left = `${x}px`;
    this.tooltipElement.style.top = `${y}px`;
  }

  public show(): void {
    if (this.isVisible) return;

    this.tooltipElement = this.createTooltipElement();
    document.body.appendChild(this.tooltipElement);

    // Initial positioning
    if (this.options.followMouse) {
      // Position will be updated on mouse move
      this.tooltipElement.style.left = '0px';
      this.tooltipElement.style.top = '0px';
    } else {
      this.updatePosition();
    }

    this.isVisible = true;
  }

  public hide(): void {
    if (!this.isVisible || !this.tooltipElement) return;

    document.body.removeChild(this.tooltipElement);
    this.tooltipElement = null;
    this.isVisible = false;
  }

  public updateContent(content: TooltipContent): void {
    this.options.content = content;
    
    // If tooltip is currently visible, recreate it with new content
    if (this.isVisible) {
      this.hide();
      this.show();
    }
  }

  public destroy(): void {
    this.hide();
    
    // Remove event listeners
    if (this.mouseMoveHandler) {
      this.targetElement.removeEventListener('mousemove', this.mouseMoveHandler);
    }
    if (this.mouseLeaveHandler) {
      this.targetElement.removeEventListener('mouseleave', this.mouseLeaveHandler);
    }
  }
}

/**
 * Factory function to create a tooltip quickly
 * 
 * @param targetElement - Element to attach tooltip to
 * @param content - Tooltip content
 * @param options - Additional options
 * @returns Tooltip instance for further control
 */
export function createTooltip(
  targetElement: HTMLElement, 
  content: TooltipContent, 
  options: Partial<TooltipOptions> = {}
): Tooltip {
  return new Tooltip(targetElement, { content, ...options });
}

/**
 * Simplified function for basic text tooltips
 * 
 * @param targetElement - Element to attach tooltip to
 * @param text - Simple text content
 * @param options - Additional options
 * @returns Tooltip instance
 */
export function createSimpleTooltip(
  targetElement: HTMLElement,
  text: string,
  options: Partial<TooltipOptions> = {}
): Tooltip {
  return createTooltip(targetElement, { description: text }, options);
}