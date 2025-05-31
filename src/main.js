// main.js - Entry point for Conway's Game of Life
import { GameOfLife } from './modules/GameOfLife.js';

// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const canvas = document.querySelector('canvas');
        const game = new GameOfLife(canvas);
        
        // Initialize the game
        await game.initialize();
        
        // Start the simulation
        game.start();
        
        // Update generation counter
        const updateGeneration = () => {
            const genElement = document.getElementById('generation');
            if (genElement) {
                genElement.textContent = game.step;
            }
        };
        
        // Set up periodic update of generation counter
        setInterval(updateGeneration, 100);
        
        // Add UI controls
        const container = document.querySelector('.container');
        
        // Create controls container
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'controls';
        
        // Play/Pause button
        const playPauseBtn = document.createElement('button');
        playPauseBtn.textContent = 'Pause';
        playPauseBtn.onclick = () => {
            if (game.animationId) {
                game.stop();
                playPauseBtn.textContent = 'Play';
            } else {
                game.start();
                playPauseBtn.textContent = 'Pause';
            }
        };
        controlsDiv.appendChild(playPauseBtn);
        
        // Reset button
        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset';
        resetBtn.onclick = () => {
            game.reset();
            updateGeneration();
            if (playPauseBtn.textContent === 'Play') {
                playPauseBtn.textContent = 'Pause';
            }
        };
        controlsDiv.appendChild(resetBtn);
        
        // Step button
        const stepBtn = document.createElement('button');
        stepBtn.textContent = 'Step';
        stepBtn.onclick = () => {
            if (game.animationId) {
                game.stop();
                playPauseBtn.textContent = 'Play';
            }
            game.updateGrid();
            updateGeneration();
        };
        controlsDiv.appendChild(stepBtn);
        
        // Insert controls after canvas container
        const canvasContainer = document.querySelector('.canvas-container');
        canvasContainer.parentNode.insertBefore(controlsDiv, canvasContainer.nextSibling);
        
    } catch (error) {
        console.error('Failed to initialize Game of Life:', error);
        
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = `Failed to initialize: ${error.message}`;
        document.querySelector('.container').appendChild(errorDiv);
    }
});
