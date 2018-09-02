import Vue from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faCaretRight,
  faCaretDown,
  faFolder,
  faFolderOpen,
  faCheckSquare,
  faMinusSquare,
} from '@fortawesome/free-solid-svg-icons'
import { faSquare } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(
  faCaretRight,
  faCaretDown,
  faFolder,
  faFolderOpen,
  faCheckSquare,
  faMinusSquare,
  faSquare
)
Vue.component('font-awesome-icon', FontAwesomeIcon)
