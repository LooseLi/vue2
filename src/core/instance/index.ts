import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'
import type { GlobalAPI } from 'types/global-api'

// 此处不用class是因为方便后续给Vue实例混入成员
function Vue(options) {
  if (__DEV__ && !(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 调用_init()
  this._init(options)
}

// 注册vm的_init()方法，初始化vm
//@ts-expect-error Vue has function type
initMixin(Vue)
//@ts-expect-error Vue has function type
// 注册vm的$data/$props/$set/$delete/$watch
stateMixin(Vue)
//@ts-expect-error Vue has function type
// 初始化事件相关方法
eventsMixin(Vue)
//@ts-expect-error Vue has function type
// 初始化生命周期相关的混入方法
lifecycleMixin(Vue)
//@ts-expect-error Vue has function type
// 混入render
// $nextTick/_render
renderMixin(Vue)

export default Vue as unknown as GlobalAPI
