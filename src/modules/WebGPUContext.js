/**
 * WebGPU Context Manager
 * Handles WebGPU initialization and device management
 */

export class WebGPUContext {
    constructor() {
        this.adapter = null;
        this.device = null;
        this.context = null;
        this.canvasFormat = null;
    }

    /**
     * Initialize WebGPU adapter and device
     * @throws {Error} if WebGPU is not supported or initialization fails
     */
    async initialize() {
        // Check WebGPU support
        if (!navigator.gpu) {
            throw new Error("WebGPU not supported on this browser.");
        }

        // Request adapter
        this.adapter = await navigator.gpu.requestAdapter();
        if (!this.adapter) {
            throw new Error("No appropriate GPUAdapter found.");
        }

        // Request device
        this.device = await this.adapter.requestDevice();
        
        // Get preferred canvas format
        this.canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    }

    /**
     * Configure canvas for WebGPU rendering
     * @param {HTMLCanvasElement} canvas - The canvas element to configure
     */
    configureCanvas(canvas) {
        this.context = canvas.getContext("webgpu");
        this.context.configure({
            device: this.device,
            format: this.canvasFormat,
        });
    }

    /**
     * Get the current texture view for rendering
     * @returns {GPUTextureView} The current texture view
     */
    getCurrentTextureView() {
        return this.context.getCurrentTexture().createView();
    }
}
