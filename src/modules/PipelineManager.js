/**
 * Pipeline Manager
 * Handles creation of render and compute pipelines
 */

export class PipelineManager {
    /**
     * Create bind group layout for the Game of Life
     * @param {GPUDevice} device - The GPU device
     * @returns {GPUBindGroupLayout} The created bind group layout
     */
    static createBindGroupLayout(device) {
        return device.createBindGroupLayout({
            label: "Cell Bind Group Layout",
            entries: [{
                binding: 0,
                // The grid uniform buffer needs to be accessible in vertex, fragment, and compute shaders
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
                buffer: {} // Grid uniform buffer
            }, {
                binding: 1,
                // Cell state input buffer needs to be readable in vertex and compute shaders
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
                buffer: { type: "read-only-storage" } // Cell state input buffer
            }, {
                binding: 2,
                // Cell state output buffer only needs to be writable in compute shader
                visibility: GPUShaderStage.COMPUTE,
                buffer: { type: "storage" } // Cell state output buffer
            }]
        });
    }

    /**
     * Create pipeline layout
     * @param {GPUDevice} device - The GPU device
     * @param {GPUBindGroupLayout} bindGroupLayout - The bind group layout
     * @returns {GPUPipelineLayout} The created pipeline layout
     */
    static createPipelineLayout(device, bindGroupLayout) {
        return device.createPipelineLayout({
            label: "Cell Pipeline Layout",
            bindGroupLayouts: [bindGroupLayout],
        });
    }

    /**
     * Create render pipeline for drawing cells
     * @param {GPUDevice} device - The GPU device
     * @param {GPUPipelineLayout} pipelineLayout - The pipeline layout
     * @param {GPUShaderModule} shaderModule - The shader module
     * @param {Object} vertexBufferLayout - The vertex buffer layout
     * @param {GPUTextureFormat} canvasFormat - The canvas texture format
     * @returns {GPURenderPipeline} The created render pipeline
     */
    static createRenderPipeline(device, pipelineLayout, shaderModule, vertexBufferLayout, canvasFormat) {
        return device.createRenderPipeline({
            label: "Cell pipeline",
            layout: pipelineLayout,
            vertex: {
                module: shaderModule,
                entryPoint: "vertexMain",
                buffers: [vertexBufferLayout]
            },
            fragment: {
                module: shaderModule,
                entryPoint: "fragmentMain",
                targets: [{
                    format: canvasFormat
                }]
            }
        });
    }

    /**
     * Create compute pipeline for simulation
     * @param {GPUDevice} device - The GPU device
     * @param {GPUPipelineLayout} pipelineLayout - The pipeline layout
     * @param {GPUShaderModule} shaderModule - The shader module
     * @returns {GPUComputePipeline} The created compute pipeline
     */
    static createComputePipeline(device, pipelineLayout, shaderModule) {
        return device.createComputePipeline({
            label: "Simulation pipeline",
            layout: pipelineLayout,
            compute: {
                module: shaderModule,
                entryPoint: "computeMain",
            }
        });
    }

    /**
     * Create bind groups for ping-pong pattern
     * @param {GPUDevice} device - The GPU device
     * @param {GPUBindGroupLayout} layout - The bind group layout
     * @param {GPUBuffer} uniformBuffer - The uniform buffer
     * @param {Array<GPUBuffer>} cellStateBuffers - The cell state buffers
     * @returns {Array<GPUBindGroup>} Array of two bind groups
     */
    static createBindGroups(device, layout, uniformBuffer, cellStateBuffers) {
        return [
            device.createBindGroup({
                label: "Cell renderer bind group A",
                layout: layout,
                entries: [{
                    binding: 0,
                    resource: { buffer: uniformBuffer }
                }, {
                    binding: 1,
                    resource: { buffer: cellStateBuffers[0] } // Read from A
                }, {
                    binding: 2,
                    resource: { buffer: cellStateBuffers[1] } // Write to B
                }]
            }),
            device.createBindGroup({
                label: "Cell renderer bind group B",
                layout: layout,
                entries: [{
                    binding: 0,
                    resource: { buffer: uniformBuffer }
                }, {
                    binding: 1,
                    resource: { buffer: cellStateBuffers[1] } // Read from B
                }, {
                    binding: 2,
                    resource: { buffer: cellStateBuffers[0] } // Write to A
                }]
            })
        ];
    }
}
