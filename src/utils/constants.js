/**
 * Constants used throughout the Game of Life application
 */

export const CONSTANTS = {
    // Grid configuration
    GRID_SIZE: 32,          // Size of the grid (32x32 cells)
    
    // Timing configuration
    UPDATE_INTERVAL: 200,   // Milliseconds between updates
    
    // GPU configuration
    WORKGROUP_SIZE: 8,      // Size of compute workgroups (8x8 threads)
    
    // Canvas configuration
    CANVAS_WIDTH: 512,      // Canvas width in pixels
    CANVAS_HEIGHT: 512,     // Canvas height in pixels
    
    // Cell rendering
    CELL_SCALE: 0.8,        // Scale factor for cell size (0.8 = 80% of grid cell)
};
