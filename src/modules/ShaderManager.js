/**
 * Shader Manager
 * Handles loading and preprocessing of WGSL shaders
 */

export class ShaderManager {
    /**
     * Load shader from URL and preprocess it
     * @param {string} url - URL to the shader file
     * @param {Object} defines - Preprocessor defines to replace in shader
     * @returns {Promise<string>} The processed shader code
     */
    static async loadShader(url, defines = {}) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load shader: ${url}`);
        }
        
        let shaderCode = await response.text();
        
        // Replace preprocessor defines
        for (const [key, value] of Object.entries(defines)) {
            shaderCode = shaderCode.replaceAll(key, value.toString());
        }
        
        return shaderCode;
    }

    /**
     * Create a shader module from code
     * @param {GPUDevice} device - The GPU device
     * @param {string} label - Label for the shader module
     * @param {string} code - The shader code
     * @returns {GPUShaderModule} The created shader module
     */
    static createShaderModule(device, label, code) {
        return device.createShaderModule({
            label,
            code
        });
    }
}
