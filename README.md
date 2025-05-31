# WebGPU Conway's Game of Life

[Demo](https://krjadhav.github.io/webgpu_game_of_life/)

A modern implementation of Conway's Game of Life using WebGPU, featuring a modular architecture and clean separation of concerns.

## Project Structure

```
webgpu_game_of_life/
├── index.html              # Entry point
├── README.md              # This file
├── package.json           # Project configuration
└── src/
    ├── main.js            # Application entry point
    ├── modules/           # Core modules
    │   ├── GameOfLife.js      # Main game simulation class
    │   ├── WebGPUContext.js   # WebGPU initialization and management
    │   ├── ShaderManager.js   # Shader loading and preprocessing
    │   ├── BufferManager.js   # GPU buffer creation and management
    │   └── PipelineManager.js # Pipeline and bind group management
    ├── shaders/           # WGSL shader files
    │   ├── cellShader.wgsl     # Vertex/fragment shader for rendering
    │   └── simulationShader.wgsl # Compute shader for simulation
    └── utils/             # Utility files
        └── constants.js   # Application constants

```

## Architecture Overview

### Modules

- **GameOfLife**: Main class that orchestrates the simulation
- **WebGPUContext**: Handles WebGPU adapter, device, and canvas configuration
- **ShaderManager**: Loads and preprocesses WGSL shader files
- **BufferManager**: Creates and manages GPU buffers (vertex, uniform, storage)
- **PipelineManager**: Creates render/compute pipelines and bind groups

### Key Design Patterns

1. **Module Pattern**: Each module exports a class with static methods for specific functionality
2. **Separation of Concerns**: GPU resource management, shader handling, and game logic are separated
3. **Ping-Pong Buffer Pattern**: Two storage buffers alternate between read/write for parallel updates
4. **Factory Methods**: Static methods create GPU resources with consistent configurations

## How It Works

1. **Initialization**: WebGPU context is created and canvas is configured
2. **Resource Creation**: Buffers, shaders, and pipelines are created
3. **Simulation Loop**:
   - Compute shader reads from buffer A, writes to buffer B
   - Render shader displays buffer B
   - Buffers swap roles for next frame

## Running the Application

### Option 1: Local Web Server (Recommended)
```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx http-server -p 8080

# Then navigate to:
# http://localhost:8080/index_refactored.html
```

### Option 2: Direct File Access
Some browsers may allow direct file access with appropriate flags, but a web server is recommended for proper module loading.

## Browser Requirements

- Chrome 113+ or Edge 113+ with WebGPU enabled
- Safari Technology Preview with WebGPU enabled
- Firefox Nightly with WebGPU enabled

## Features

- **Interactive Controls**: Play/Pause, Reset, and Step buttons
- **Efficient GPU Computation**: Uses compute shaders for parallel cell updates
- **Instanced Rendering**: Draws all cells in a single draw call
- **Toroidal Topology**: Grid wraps around edges
- **Customizable**: Easy to modify grid size, colors, and rules

## Customization

### Change Grid Size
Edit `GRID_SIZE` in `src/utils/constants.js`

### Change Update Speed
Edit `UPDATE_INTERVAL` in `src/utils/constants.js`

### Change Cell Colors
Modify the fragment shader in `src/shaders/cellShader.wgsl`

### Change Initial Pattern
Modify the `initializeCells` method in `src/modules/GameOfLife.js`

## Technical Details

- **Workgroup Size**: 8x8 threads for compute shader
- **Buffer Layout**: 1D array representing 2D grid
- **Cell States**: 0 (dead) or 1 (alive)
- **Coordinate System**: WebGPU clip space (-1 to 1)

## Performance Considerations

- Compute shaders process cells in parallel
- Instanced rendering minimizes draw calls
- Ping-pong buffers prevent race conditions
- Workgroup size optimized for GPU cache
