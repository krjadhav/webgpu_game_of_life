/**
 * Game of Life Simulation
 * Main class that orchestrates the Conway's Game of Life simulation
 */

import { WebGPUContext } from './WebGPUContext.js';
import { ShaderManager } from './ShaderManager.js';
import { BufferManager } from './BufferManager.js';
import { PipelineManager } from './PipelineManager.js';
import { CONSTANTS } from '../utils/constants.js';

export class GameOfLife {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = new WebGPUContext();
        
        // GPU resources
        this.device = null;
        this.renderPipeline = null;
        this.simulationPipeline = null;
        this.bindGroups = null;
        this.vertexBuffer = null;
        this.vertexCount = 0;
        this.cellStateBuffers = null; // Add this to store buffer references
        
        // Simulation state
        this.step = 0;
        this.animationId = null;
    }

    /**
     * Initialize the Game of Life simulation
     */
    async initialize() {
        // Initialize WebGPU context
        await this.context.initialize();
        this.context.configureCanvas(this.canvas);
        this.device = this.context.device;

        // Create vertex buffer for cell geometry
        const vertexData = BufferManager.createCellVertexBuffer(this.device);
        this.vertexBuffer = vertexData.buffer;
        this.vertexCount = vertexData.vertexCount;

        // Create layouts
        const bindGroupLayout = PipelineManager.createBindGroupLayout(this.device);
        const pipelineLayout = PipelineManager.createPipelineLayout(this.device, bindGroupLayout);

        // Load and create shaders
        const cellShaderCode = await ShaderManager.loadShader('./src/shaders/cellShader.wgsl');
        const cellShaderModule = ShaderManager.createShaderModule(
            this.device, 
            "Cell shader", 
            cellShaderCode
        );

        const simulationShaderCode = await ShaderManager.loadShader(
            './src/shaders/simulationShader.wgsl',
            {
                'WORKGROUP_SIZE_X': CONSTANTS.WORKGROUP_SIZE,
                'WORKGROUP_SIZE_Y': CONSTANTS.WORKGROUP_SIZE
            }
        );
        const simulationShaderModule = ShaderManager.createShaderModule(
            this.device, 
            "Life simulation shader", 
            simulationShaderCode
        );

        // Create pipelines
        this.renderPipeline = PipelineManager.createRenderPipeline(
            this.device,
            pipelineLayout,
            cellShaderModule,
            vertexData.layout,
            this.context.canvasFormat
        );

        this.simulationPipeline = PipelineManager.createComputePipeline(
            this.device,
            pipelineLayout,
            simulationShaderModule
        );

        // Create buffers
        const uniformBuffer = BufferManager.createUniformBuffer(this.device, CONSTANTS.GRID_SIZE);
        this.cellStateBuffers = BufferManager.createCellStateBuffers(
            this.device,
            CONSTANTS.GRID_SIZE,
            this.initializeCells
        );

        // Create bind groups
        this.bindGroups = PipelineManager.createBindGroups(
            this.device,
            bindGroupLayout,
            uniformBuffer,
            this.cellStateBuffers
        );
    }

    /**
     * Initialize cell states with random pattern
     * @param {Uint32Array} cellStateArray - Array to fill with cell states
     */
    initializeCells(cellStateArray) {
        for (let i = 0; i < cellStateArray.length; i++) {
            cellStateArray[i] = Math.random() > 0.6 ? 1 : 0;
        }
    }

    /**
     * Update and render one frame of the simulation
     */
    updateGrid() {
        // Create command encoder to record GPU commands
        const encoder = this.device.createCommandEncoder();

        // Start a compute pass to update cell states
        const computePass = encoder.beginComputePass();
        computePass.setPipeline(this.simulationPipeline);
        computePass.setBindGroup(0, this.bindGroups[this.step % 2]); // Alternate between bind groups
        
        // Dispatch enough workgroups to cover the entire grid
        const workgroupCount = Math.ceil(CONSTANTS.GRID_SIZE / CONSTANTS.WORKGROUP_SIZE);
        computePass.dispatchWorkgroups(workgroupCount, workgroupCount);
        computePass.end();

        this.step++; // Increment step AFTER compute to render the NEW state

        // Start a render pass to draw the updated grid
        const renderPass = encoder.beginRenderPass({
            colorAttachments: [{
                view: this.context.getCurrentTextureView(), // Render to canvas
                loadOp: 'clear', // Clear the texture when the pass starts
                storeOp: 'store', // Store the result after rendering
                clearValue: { r: 0.0, g: 0.0, b: 0.4, a: 1.0 }, // Dark blue background
            }]
        });
        
        // Draw the grid using instanced rendering
        renderPass.setPipeline(this.renderPipeline);
        renderPass.setVertexBuffer(0, this.vertexBuffer);
        renderPass.setBindGroup(0, this.bindGroups[this.step % 2]); // Use the bind group with updated state
        renderPass.draw(this.vertexCount, CONSTANTS.GRID_SIZE * CONSTANTS.GRID_SIZE); // Draw all cells in one call
                
        // Finalize the command buffer and submit it to the GPU for execution
        renderPass.end();
        this.device.queue.submit([encoder.finish()]);
    }

    /**
     * Start the simulation
     */
    start() {
        if (this.animationId) return; // Already running
        
        const animate = () => {
            this.updateGrid();
            // Schedule next update
            this.animationId = setTimeout(() => {
                requestAnimationFrame(animate);
            }, CONSTANTS.UPDATE_INTERVAL);
        };
        
        animate();
    }

    /**
     * Stop the simulation
     */
    stop() {
        if (this.animationId) {
            clearTimeout(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Reset the simulation with new random state
     */
    reset() {
        this.stop();
        this.step = 0;
        
        // Reinitialize cell states
        const cellStateArray = new Uint32Array(CONSTANTS.GRID_SIZE * CONSTANTS.GRID_SIZE);
        this.initializeCells(cellStateArray);
        
        // Write new states to first buffer
        this.device.queue.writeBuffer(
            this.cellStateBuffers[0],
            0,
            cellStateArray
        );
        
        // Render once to show new state
        this.updateGrid();
        
        // Start the simulation again
        this.start();
    }
}
