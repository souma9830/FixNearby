export class VercelBuildOptimizationService {
  static resolveDynamicChunkImports() {
    return {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        icons: ['lucide-react']
      }
    };
  }
}

export default VercelBuildOptimizationService;
