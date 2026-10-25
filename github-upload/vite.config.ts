import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          includeDependenciesRecursively: false,
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            {
              name: 'motion',
              test: /node_modules[\\/](motion|framer-motion|motion-dom|motion-utils)[\\/]/,
            },
            { name: 'three-core', test: /node_modules[\\/]three[\\/]build[\\/]three\.core\.js$/ },
            {
              name: 'three-renderer',
              test: /node_modules[\\/]three[\\/]build[\\/]three\.module\.js$/,
            },
          ],
        },
      },
    },
  },
})
