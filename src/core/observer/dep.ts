import { remove } from '../util/index'
import config from '../config'
import { DebuggerOptions, DebuggerEventExtraInfo } from 'v3'

let uid = 0

/**
 * @internal
 */
export interface DepTarget extends DebuggerOptions {
  id: number
  addDep(dep: Dep): void
  update(): void
}

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 * @internal
 */
export default class Dep {
  static target?: DepTarget | null
  id: number
  subs: Array<DepTarget>

  constructor() {
    this.id = uid++
    this.subs = []
  }

  // 添加新的订阅者watcher对象
  addSub(sub: DepTarget) {
    this.subs.push(sub)
  }

  removeSub(sub: DepTarget) {
    remove(this.subs, sub)
  }

  // 将观察对象和watcher建立依赖
  depend(info?: DebuggerEventExtraInfo) {
    // 如果target存在，把dep对象添加到watcher的依赖中
    if (Dep.target) {
      Dep.target.addDep(this)
      if (__DEV__ && info && Dep.target.onTrack) {
        Dep.target.onTrack({
          effect: Dep.target,
          ...info
        })
      }
    }
  }

  // 发布通知
  notify(info?: DebuggerEventExtraInfo) {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (__DEV__ && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    // 调用每个订阅者的update方法进行更新
    for (let i = 0, l = subs.length; i < l; i++) {
      if (__DEV__ && info) {
        const sub = subs[i]
        sub.onTrigger &&
          sub.onTrigger({
            effect: subs[i],
            ...info
          })
      }
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null
const targetStack: Array<DepTarget | null | undefined> = []

/**
 * 入栈并将当前watcher赋值给Dep.target
 * 父子组件嵌套的时候先把父组件对应的watcher入栈
 * 再去处理子组件的watcher，子组件的处理完毕后，再把父组件对应的watcher出栈，继续操作
 */
export function pushTarget(target?: DepTarget | null) {
  // 入栈
  targetStack.push(target)
  Dep.target = target
}

export function popTarget() {
  // 出栈
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
