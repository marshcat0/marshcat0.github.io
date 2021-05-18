---
title: lodash-debounce
date: 2020-12-18 11:14:09
tags: 源码
---

## Overview

如图所示，lodash debounce函数接受的参数：![lodash参数](params.png)

## Lodash源码

```js
function debounce(func, wait, options) {
  let lastArgs,
    lastThis,
    maxWait,
    result,
    timerId,
    lastCallTime

  let lastInvokeTime = 0
  let leading = false
  let maxing = false
  let trailing = true

  // Bypass `requestAnimationFrame` by explicitly setting `wait=0`.
  const useRAF = (!wait && wait !== 0 && typeof root.requestAnimationFrame === 'function')

  if (typeof func !== 'function') {
    throw new TypeError('Expected a function')
  }
  wait = +wait || 0
  if (isObject(options)) {
    leading = !!options.leading
    maxing = 'maxWait' in options
    maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait
    trailing = 'trailing' in options ? !!options.trailing : trailing
  }

  function invokeFunc(time) {
    const args = lastArgs
    const thisArg = lastThis

    lastArgs = lastThis = undefined
    lastInvokeTime = time
    result = func.apply(thisArg, args)
    return result
  }

  function startTimer(pendingFunc, wait) {
    if (useRAF) {
      root.cancelAnimationFrame(timerId)
      return root.requestAnimationFrame(pendingFunc)
    }
    return setTimeout(pendingFunc, wait)
  }

  function cancelTimer(id) {
    if (useRAF) {
      return root.cancelAnimationFrame(id)
    }
    clearTimeout(id)
  }

  // 一个新的wait周期的开始
  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time
    // Start the timer for the trailing edge.
    timerId = startTimer(timerExpired, wait)
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = wait - timeSinceLastCall

    return maxing
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait))
  }

  function timerExpired() {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    // Restart the timer.
    // 现在还不到invoke的时间，因此设置定时器，等到可以执行后
    timerId = startTimer(timerExpired, remainingWait(time))
  }

  function trailingEdge(time) {
    timerId = undefined

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    // 个人理解，避免当leading和trailing都为true时，call了一次，invoke了两次
    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = lastThis = undefined
    return result
  }

  function cancel() {
    if (timerId !== undefined) {
      cancelTimer(timerId)
    }
    lastInvokeTime = 0
    lastArgs = lastCallTime = lastThis = timerId = undefined
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now())
  }

  function pending() {
    return timerId !== undefined
  }

  function debounced(...args) {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      // 关于timerId
      // 对于debounce，在一个wait周期内，如果调用了debounce后的函数，则重置wait周期，wait周期内没有再调用debounce后的函数，则执行函数
      // 因此需要在wait周期末端，即trailingEdge，判断是否需要执行函数
      // 在trailingEdge中，会将timerId设为undefined，因此timerId === undefined意味着此次调用debounce后的函数，是一个wait周期的开始
      // 因此需要调用leadingEdge
      if (timerId === undefined) {
        return leadingEdge(lastCallTime)
      }
      // isInvoking 为true的四个条件，在timeId !== undefined时，
      // lastCallTime !== undefined
      // timeSinceLastCall < wait
      // 所以在maxing为truthy的情况下
      // 可知 timeSinceLastInvoke >= maxWait
      if (maxing) {
        // 这句注释不知什么意思
        // Handle invocations in a tight loop.
        timerId = startTimer(timerExpired, wait)
        // 距上次invoke超过了maxWait，因此立即调用
        // 此处记得区分invoke与call
        // call指的是调用debounce后的函数，即本函数
        // invoke指的是调用传入debounce的函数，即args中作为传入参数的函数
        return invokeFunc(lastCallTime)
      }
    }

    // timerId为undefined，说明上个周期结束，已调用trailingEdge
    // 结合!isInvoking，说明距上个周期结束，不超过wait和maxWait
    if (timerId === undefined) {
      timerId = startTimer(timerExpired, wait)
    }
    // 补充，如timerId不是undefined，则直接return之前的result
    // 需要注意，此时lastCallTime已经被更新，因此，等timerId设置的定时器到期时，
    // 执行timerExpired，在shouldInvoke中发现之前还有一次call，会根据remainingWait
    // 来重新设置定时器，在这次call的trailingEdge执行。
    return result
  }
  debounced.cancel = cancel
  debounced.flush = flush
  debounced.pending = pending
  return debounced
}

export default debounce
```
