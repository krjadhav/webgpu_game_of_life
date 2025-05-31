/**
 * Buffer Manager
 * Handles creation and management of GPU buffers
 */

export class BufferManager {
    /**
     * Create a vertex buffer for a cell (square)
     * @param {GPUDevice} device - The GPU device
     * @returns {Object} Object containing buffer and layout
     */
    static createCellVertexBuffer(device) {
        // Define vertices for a square cell
        const vertices = new Float32Array([
            -0.8, -0.8,  // Bottom left
             0.8, -0.8,  // Bottom right
             0.8,  0.8,  // Top right

            -0.8, -0.8,  // Bottom left
             0.8,  0.8,  // Top right
            -0.8,  0.8,  // Top left
        ]);

        // Create buffer
        const buffer = device.createBuffer({
            label: "Cell vertices",
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        // Write data to buffer
        device.queue.writeBuffer(buffer, 0, vertices);

        // Define layout
        const layout = {
            arrayStride: 8, // 2 floats * 4 bytes
            attributes: [{
                format: "float32x2",
                offset: 0,
                shaderLocation: 0, // Position. Matches @location(0) in the @vertex shader.
            }],
        };

        return { buffer, layout, vertexCount: vertices.length / 2 };
    }

    /**
     * Create a uniform buffer for grid dimensions
     * @param {GPUDevice} device - The GPU device
     * @param {number} gridSize - The size of the grid
     * @returns {GPUBuffer} The created uniform buffer
     */
    static createUniformBuffer(device, gridSize) {
        const uniformArray = new Float32Array([gridSize, gridSize]);
        const buffer = device.createBuffer({
            label: "Grid Uniforms",
            size: uniformArray.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(buffer, 0, uniformArray);
        return buffer;
    }

    /**
     * Create storage buffers for cell states (ping-pong pattern)
     * @param {GPUDevice} device - The GPU device
     * @param {number} gridSize - The size of the grid
     * @param {Function} initFunction - Function to initialize cell states
     * @returns {Array<GPUBuffer>} Array of two storage buffers
     */
    static createCellStateBuffers(device, gridSize, initFunction) {
        const cellCount = gridSize * gridSize;
        const cellStateArray = new Uint32Array(cellCount);

        // Initialize cells using provided function
        if (initFunction) {
            initFunction(cellStateArray);
        }

        // Create two buffers for ping-pong pattern
        const buffers = [
            device.createBuffer({
                label: "Cell State A",
                size: cellStateArray.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            }),
            device.createBuffer({
                label: "Cell State B",
                size: cellStateArray.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            })
        ];

        // Initialize first buffer with cell states
        device.queue.writeBuffer(buffers[0], 0, cellStateArray);

        return buffers;
    }
}
