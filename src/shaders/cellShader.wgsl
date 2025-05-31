// Cell rendering shader for Conway's Game of Life
// This shader handles both vertex and fragment stages for rendering cells

// Output structure from vertex shader to fragment shader
struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) cell: vec2f, // Pass normalized cell coordinates to fragment shader
};

// Uniforms and storage buffers accessible to shaders
@group(0) @binding(0) var<uniform> grid: vec2f; // Grid dimensions
@group(0) @binding(1) var<storage> cellState: array<u32>; // Current cell states

@vertex
fn vertexMain(@location(0) position: vec2f,
              @builtin(instance_index) instance: u32) -> VertexOutput {
    var output: VertexOutput;

    // Convert instance index to 2D cell coordinates
    let i = f32(instance);
    let cell = vec2f(i % grid.x, floor(i / grid.x));

    // Scale the cell based on its state (0 = dead/invisible, 1 = alive/visible)
    let scale = f32(cellState[instance]);
    
    // Calculate cell position in the grid
    // cellOffset: moves each cell to its grid position (normalized to 0-1)
    let cellOffset = cell / grid * 2;
    // gridPos: final position in clip space (-1 to 1)
    let gridPos = (position*scale+1) / grid - 1 + cellOffset;

    output.position = vec4f(gridPos, 0, 1);
    output.cell = cell / grid; // Normalize cell coordinates for fragment shader
    return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
    // Color cells based on their position in the grid
    // This creates a gradient effect across the grid
    return vec4f(input.cell, 1.0 - input.cell.x, 1);
}
