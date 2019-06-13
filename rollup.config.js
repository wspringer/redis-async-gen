import babel from 'rollup-plugin-babel'
import { name } from './package.json'


const plugins = targets => ([
  babel({
    exclude: 'node_modules/**',
    babelrc: false,
    presets: [['@babel/preset-env', { modules: false, targets }]],
    comments: false
  })
])

const external = [
  'util'
]

export default [{
  input: 'src/index.js',
  output: {
    file: `dist/${name}.esm.js`,
    format: 'esm',
    sourcemap: true,
  },
  external,
  plugins: plugins({ node: '8' }),
}, {
  input: 'src/index.js',
  output: {
    file: `dist/${name}.js`,
    format: 'cjs',
    sourcemap: true
  },
  external,
  plugins: plugins({ node: 6 })

}]