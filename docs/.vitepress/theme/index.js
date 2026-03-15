import DefaultTheme from 'vitepress/theme'
import HeroOrbs from './HeroOrbs.vue'
import './custom.css'
import { h } from 'vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-image': () => h(HeroOrbs),
    })
  },
  enhanceApp({ app }) {
    app.component('HeroOrbs', HeroOrbs)
  },
}
