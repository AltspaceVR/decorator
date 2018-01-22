(function () {
'use strict';

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var runtime = createCommonjsModule(function (module) {
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = 'object' === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        if (delegate.iterator.return) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };
})(
  // In sloppy mode, unbound `this` refers to the global object, fallback to
  // Function constructor if we're in global strict mode. That is sadly a form
  // of indirect eval which violates Content Security Policy.
  (function() { return this })() || Function("return this")()
);
});

// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
var g = (function() { return this })() || Function("return this")();

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
var hadRuntime = g.regeneratorRuntime &&
  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
g.regeneratorRuntime = undefined;

var runtimeModule = runtime;

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  try {
    delete g.regeneratorRuntime;
  } catch(e) {
    g.regeneratorRuntime = undefined;
  }
}

var regenerator = runtimeModule;

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
var _toInteger = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

// 7.2.1 RequireObjectCoercible(argument)
var _defined = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

// true  -> String#at
// false -> String#codePointAt
var _stringAt = function (TO_STRING) {
  return function (that, pos) {
    var s = String(_defined(that));
    var i = _toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

var _library = true;

var _global = createCommonjsModule(function (module) {
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
});

var _core = createCommonjsModule(function (module) {
var core = module.exports = { version: '2.5.3' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
});

var _core_1 = _core.version;

var _aFunction = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

// optional / simple context binding

var _ctx = function (fn, that, length) {
  _aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

var _isObject = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

var _anObject = function (it) {
  if (!_isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

var _fails = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

// Thank's IE8 for his funny defineProperty
var _descriptors = !_fails(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

var document$1 = _global.document;
// typeof document.createElement is 'object' in old IE
var is = _isObject(document$1) && _isObject(document$1.createElement);
var _domCreate = function (it) {
  return is ? document$1.createElement(it) : {};
};

var _ie8DomDefine = !_descriptors && !_fails(function () {
  return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
});

// 7.1.1 ToPrimitive(input [, PreferredType])

// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
var _toPrimitive = function (it, S) {
  if (!_isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var dP = Object.defineProperty;

var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  _anObject(O);
  P = _toPrimitive(P, true);
  _anObject(Attributes);
  if (_ie8DomDefine) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var _objectDp = {
	f: f
};

var _propertyDesc = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var _hide = _descriptors ? function (object, key, value) {
  return _objectDp.f(object, key, _propertyDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] : (_global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && key in exports) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? _ctx(out, _global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) _hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
var _export = $export;

var _redefine = _hide;

var hasOwnProperty = {}.hasOwnProperty;
var _has = function (it, key) {
  return hasOwnProperty.call(it, key);
};

var _iterators = {};

var toString = {}.toString;

var _cof = function (it) {
  return toString.call(it).slice(8, -1);
};

// fallback for non-array-like ES3 and non-enumerable old V8 strings

// eslint-disable-next-line no-prototype-builtins
var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return _cof(it) == 'String' ? it.split('') : Object(it);
};

// to indexed object, toObject with fallback for non-array-like ES3 strings


var _toIobject = function (it) {
  return _iobject(_defined(it));
};

// 7.1.15 ToLength

var min = Math.min;
var _toLength = function (it) {
  return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

var max = Math.max;
var min$1 = Math.min;
var _toAbsoluteIndex = function (index, length) {
  index = _toInteger(index);
  return index < 0 ? max(index + length, 0) : min$1(index, length);
};

// false -> Array#indexOf
// true  -> Array#includes



var _arrayIncludes = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = _toIobject($this);
    var length = _toLength(O.length);
    var index = _toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

var SHARED = '__core-js_shared__';
var store = _global[SHARED] || (_global[SHARED] = {});
var _shared = function (key) {
  return store[key] || (store[key] = {});
};

var id = 0;
var px = Math.random();
var _uid = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

var shared = _shared('keys');

var _sharedKey = function (key) {
  return shared[key] || (shared[key] = _uid(key));
};

var arrayIndexOf = _arrayIncludes(false);
var IE_PROTO$1 = _sharedKey('IE_PROTO');

var _objectKeysInternal = function (object, names) {
  var O = _toIobject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO$1) _has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (_has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

// IE 8- don't enum bug keys
var _enumBugKeys = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

// 19.1.2.14 / 15.2.3.14 Object.keys(O)



var _objectKeys = Object.keys || function keys(O) {
  return _objectKeysInternal(O, _enumBugKeys);
};

var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
  _anObject(O);
  var keys = _objectKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
  return O;
};

var document$2 = _global.document;
var _html = document$2 && document$2.documentElement;

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



var IE_PROTO = _sharedKey('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE$1 = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = _domCreate('iframe');
  var i = _enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  _html.appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
  return createDict();
};

var _objectCreate = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE$1] = _anObject(O);
    result = new Empty();
    Empty[PROTOTYPE$1] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : _objectDps(result, Properties);
};

var _wks = createCommonjsModule(function (module) {
var store = _shared('wks');

var Symbol = _global.Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
};

$exports.store = store;
});

var def = _objectDp.f;

var TAG = _wks('toStringTag');

var _setToStringTag = function (it, tag, stat) {
  if (it && !_has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
_hide(IteratorPrototype, _wks('iterator'), function () { return this; });

var _iterCreate = function (Constructor, NAME, next) {
  Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
  _setToStringTag(Constructor, NAME + ' Iterator');
};

// 7.1.13 ToObject(argument)

var _toObject = function (it) {
  return Object(_defined(it));
};

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


var IE_PROTO$2 = _sharedKey('IE_PROTO');
var ObjectProto = Object.prototype;

var _objectGpo = Object.getPrototypeOf || function (O) {
  O = _toObject(O);
  if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

var ITERATOR = _wks('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  _iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = (!BUGGY && $native) || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = _objectGpo($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      _setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!_library && !_has(IteratorPrototype, ITERATOR)) _hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!_library || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    _hide(proto, ITERATOR, $default);
  }
  // Plug for library
  _iterators[NAME] = $default;
  _iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) _redefine(proto, key, methods[key]);
    } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

var $at = _stringAt(true);

// 21.1.3.27 String.prototype[@@iterator]()
_iterDefine(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});

var _iterStep = function (done, value) {
  return { value: value, done: !!done };
};

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
  this._t = _toIobject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return _iterStep(1);
  }
  if (kind == 'keys') return _iterStep(0, index);
  if (kind == 'values') return _iterStep(0, O[index]);
  return _iterStep(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
_iterators.Arguments = _iterators.Array;

var TO_STRING_TAG = _wks('toStringTag');

var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
  'TextTrackList,TouchList').split(',');

for (var i = 0; i < DOMIterables.length; i++) {
  var NAME = DOMIterables[i];
  var Collection = _global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) _hide(proto, TO_STRING_TAG, NAME);
  _iterators[NAME] = _iterators.Array;
}

// getting tag from 19.1.3.6 Object.prototype.toString()

var TAG$1 = _wks('toStringTag');
// ES3 wrong here
var ARG = _cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

var _classof = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG$1)) == 'string' ? T
    // builtinTag case
    : ARG ? _cof(O)
    // ES3 arguments fallback
    : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

var _anInstance = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};

// call something on iterator step with safe closing on error

var _iterCall = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(_anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) _anObject(ret.call(iterator));
    throw e;
  }
};

// check on default Array iterator

var ITERATOR$1 = _wks('iterator');
var ArrayProto = Array.prototype;

var _isArrayIter = function (it) {
  return it !== undefined && (_iterators.Array === it || ArrayProto[ITERATOR$1] === it);
};

var ITERATOR$2 = _wks('iterator');

var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR$2]
    || it['@@iterator']
    || _iterators[_classof(it)];
};

var _forOf = createCommonjsModule(function (module) {
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : core_getIteratorMethod(iterable);
  var f = _ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (_isArrayIter(iterFn)) for (length = _toLength(iterable.length); length > index; index++) {
    result = entries ? f(_anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = _iterCall(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;
});

// 7.3.20 SpeciesConstructor(O, defaultConstructor)


var SPECIES = _wks('species');
var _speciesConstructor = function (O, D) {
  var C = _anObject(O).constructor;
  var S;
  return C === undefined || (S = _anObject(C)[SPECIES]) == undefined ? D : _aFunction(S);
};

// fast apply, http://jsperf.lnkit.com/fast-apply/5
var _invoke = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};

var process$1 = _global.process;
var setTask = _global.setImmediate;
var clearTask = _global.clearImmediate;
var MessageChannel = _global.MessageChannel;
var Dispatch = _global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer;
var channel;
var port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      _invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (_cof(process$1) == 'process') {
    defer = function (id) {
      process$1.nextTick(_ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(_ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = _ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (_global.addEventListener && typeof postMessage == 'function' && !_global.importScripts) {
    defer = function (id) {
      _global.postMessage(id + '', '*');
    };
    _global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in _domCreate('script')) {
    defer = function (id) {
      _html.appendChild(_domCreate('script'))[ONREADYSTATECHANGE] = function () {
        _html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(_ctx(run, id, 1), 0);
    };
  }
}
var _task = {
  set: setTask,
  clear: clearTask
};

var macrotask = _task.set;
var Observer = _global.MutationObserver || _global.WebKitMutationObserver;
var process$2 = _global.process;
var Promise$1 = _global.Promise;
var isNode$1 = _cof(process$2) == 'process';

var _microtask = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode$1 && (parent = process$2.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (isNode$1) {
    notify = function () {
      process$2.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
  } else if (Observer && !(_global.navigator && _global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise$1 && Promise$1.resolve) {
    var promise = Promise$1.resolve();
    notify = function () {
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(_global, flush);
    };
  }

  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};

// 25.4.1.5 NewPromiseCapability(C)


function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = _aFunction(resolve);
  this.reject = _aFunction(reject);
}

var f$1 = function (C) {
  return new PromiseCapability(C);
};

var _newPromiseCapability = {
	f: f$1
};

var _perform = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};

var _promiseResolve = function (C, x) {
  _anObject(C);
  if (_isObject(x) && x.constructor === C) return x;
  var promiseCapability = _newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

var _redefineAll = function (target, src, safe) {
  for (var key in src) {
    if (safe && target[key]) target[key] = src[key];
    else _hide(target, key, src[key]);
  } return target;
};

var SPECIES$1 = _wks('species');

var _setSpecies = function (KEY) {
  var C = typeof _core[KEY] == 'function' ? _core[KEY] : _global[KEY];
  if (_descriptors && C && !C[SPECIES$1]) _objectDp.f(C, SPECIES$1, {
    configurable: true,
    get: function () { return this; }
  });
};

var ITERATOR$3 = _wks('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR$3]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  
} catch (e) { /* empty */ }

var _iterDetect = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR$3]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR$3] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};

var task = _task.set;
var microtask = _microtask();



var PROMISE = 'Promise';
var TypeError$1 = _global.TypeError;
var process = _global.process;
var $Promise = _global[PROMISE];
var isNode = _classof(process) == 'process';
var empty = function () { /* empty */ };
var Internal;
var newGenericPromiseCapability;
var OwnPromiseCapability;
var Wrapper;
var newPromiseCapability = newGenericPromiseCapability = _newPromiseCapability.f;

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[_wks('species')] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return _isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value);
            if (domain) domain.exit();
          }
          if (result === reaction.promise) {
            reject(TypeError$1('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(_global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = _perform(function () {
        if (isNode) {
          process.emit('unhandledRejection', value, promise);
        } else if (handler = _global.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = _global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};
var onHandleUnhandled = function (promise) {
  task.call(_global, function () {
    var handler;
    if (isNode) {
      process.emit('rejectionHandled', promise);
    } else if (handler = _global.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if (promise === value) throw TypeError$1("Promise can't be resolved itself");
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false }; // wrap
        try {
          then.call(value, _ctx($resolve, wrapper, 1), _ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e); // wrap
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    _anInstance(this, $Promise, PROMISE, '_h');
    _aFunction(executor);
    Internal.call(this);
    try {
      executor(_ctx($resolve, this, 1), _ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = _redefineAll($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(_speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = _ctx($resolve, promise, 1);
    this.reject = _ctx($reject, promise, 1);
  };
  _newPromiseCapability.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

_export(_export.G + _export.W + _export.F * !USE_NATIVE, { Promise: $Promise });
_setToStringTag($Promise, PROMISE);
_setSpecies(PROMISE);
Wrapper = _core[PROMISE];

// statics
_export(_export.S + _export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
_export(_export.S + _export.F * (_library || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return _promiseResolve(_library && this === Wrapper ? $Promise : this, x);
  }
});
_export(_export.S + _export.F * !(USE_NATIVE && _iterDetect(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = _perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      _forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = _perform(function () {
      _forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});

_export(_export.P + _export.R, 'Promise', { 'finally': function (onFinally) {
  var C = _speciesConstructor(this, _core.Promise || _global.Promise);
  var isFunction = typeof onFinally == 'function';
  return this.then(
    isFunction ? function (x) {
      return _promiseResolve(C, onFinally()).then(function () { return x; });
    } : onFinally,
    isFunction ? function (e) {
      return _promiseResolve(C, onFinally()).then(function () { throw e; });
    } : onFinally
  );
} });

// https://github.com/tc39/proposal-promise-try




_export(_export.S, 'Promise', { 'try': function (callbackfn) {
  var promiseCapability = _newPromiseCapability.f(this);
  var result = _perform(callbackfn);
  (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
  return promiseCapability.promise;
} });

var promise$1 = _core.Promise;

var promise = createCommonjsModule(function (module) {
module.exports = { "default": promise$1, __esModule: true };
});

var _Promise = unwrapExports(promise);

var asyncToGenerator = createCommonjsModule(function (module, exports) {
exports.__esModule = true;



var _promise2 = _interopRequireDefault(promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new _promise2.default(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return _promise2.default.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};
});

var _asyncToGenerator = unwrapExports(asyncToGenerator);

AFRAME.registerComponent('place-for-space', {
	schema: {
		templates: { default: [] },
		mixins: { default: [] },
		otherwise: { default: '' }
	},
	init: function () {
		var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
			var space, index;
			return regenerator.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							if (!altspace.inClient) {
								_context.next = 6;
								break;
							}

							_context.next = 3;
							return altspace.getSpace();

						case 3:
							_context.t0 = _context.sent;
							_context.next = 7;
							break;

						case 6:
							_context.t0 = {};

						case 7:
							space = _context.t0;

							console.log(space);
							index = this.data.templates.indexOf(space.templateSid);

							if (index >= 0) {
								this.el.setAttribute('mixin', this.data.mixins[index]);
							} else {
								this.el.setAttribute('mixin', this.data.otherwise);
							}

						case 11:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, this);
		}));

		function init() {
			return _ref.apply(this, arguments);
		}

		return init;
	}()
});

AFRAME.registerComponent('library-page', {
	schema: {
		service: { type: 'string', default: 'poly' },
		page: { type: 'int', default: 0 }
	},
	update: function () {
		var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(oldData) {
			var fnName;
			return regenerator.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							this.el.emit('pageupdatestart');
							_context.prev = 1;
							fnName = this.el.sceneEl.hasAttribute('debug') ? 'fakeGetListing' : 'getListing';
							_context.next = 5;
							return this.el.sceneEl.systems[this.data.service + '-service'][fnName](this.data.page);

						case 5:
							this.currentPage = _context.sent;
							_context.next = 11;
							break;

						case 8:
							_context.prev = 8;
							_context.t0 = _context['catch'](1);

							console.error(_context.t0.stack);

						case 11:
							this.el.emit('pageupdateend');

						case 12:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, this, [[1, 8]]);
		}));

		function update(_x) {
			return _ref.apply(this, arguments);
		}

		return update;
	}()
});

AFRAME.registerComponent('library-item', {
	schema: { type: 'int' },
	init: function init() {
		this.itemData = null;

		this.el.parentElement.addEventListener('pageupdatestart', this.showLoading.bind(this));
		this.el.parentElement.addEventListener('pageupdateend', this.updateContents.bind(this));
		this.el.addEventListener('materialtextureloaded', this.updateDimensions.bind(this));

		this.el.addEventListener('click', this.previewItem.bind(this));
	},
	showLoading: function showLoading() {
		this.el.setAttribute('color', '#555');
	},
	updateContents: function updateContents() {
		this.itemData = this.el.parentElement.components['library-page'].currentPage.assets[this.data];
		if (this.itemData) this.el.setAttribute('src', this.itemData.thumbnail.url);
	},
	updateDimensions: function updateDimensions() {
		var map = this.el.object3DMap.mesh.material.map;
		var img = map && map.image && map.image.tagName === 'IMG' ? map.image : { width: 1, height: 1 };
		var ratio = img.width / img.height;

		if (ratio > 1) {
			this.el.setAttribute('scale', { x: 1, y: 1 / ratio, z: 1 });
		} else {
			this.el.setAttribute('scale', { x: ratio, y: 1, z: 1 });
		}

		if (this.itemData) this.el.setAttribute('color', '#fff');
	},

	previewItem: function previewItem() {
		var spawn = document.querySelector('#spawn');
		var gltfUrls = this.itemData.formats.filter(function (x) {
			return x.formatType === 'GLTF2';
		});
		var polyId = spawn.components.spawner.setSpawn('model-gltf', gltfUrls[0].root.url, 'https://poly.google.com/view/' + this.itemData.name.slice(7));
	}
});

AFRAME.registerComponent('library-advance', {
	schema: { type: 'int' },
	init: function init() {
		this.active = false;
		this.el.addEventListener('click', this.advance.bind(this));
		this.el.parentElement.addEventListener('pageupdateend', this.updatePaging.bind(this));
	},
	advance: function advance() {
		if (this.active) {
			var pageEl = this.el.parentElement;
			var oldPage = pageEl.getAttribute('library-page').page;
			pageEl.setAttribute('library-page', 'page', oldPage + this.data);
		}
	},
	updatePaging: function updatePaging() {
		var page = this.el.parentElement.components['library-page'];
		var service = this.el.sceneEl.systems['poly-service'];

		if (service.pages[page.data.page + this.data] || this.data > 0 && page.currentPage.nextPageToken) {
			this.el.setAttribute('avr-visible', true);
			this.active = true;
			console.log('advance ' + this.data + ': shown');
		} else {
			this.el.setAttribute('avr-visible', false);
			this.active = false;
			console.log('advance ' + this.data + ': hidden');
		}
	}
});

var core_getIterator = _core.getIterator = function (it) {
  var iterFn = core_getIteratorMethod(it);
  if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
  return _anObject(iterFn.call(it));
};

var getIterator$1 = core_getIterator;

var getIterator = createCommonjsModule(function (module) {
module.exports = { "default": getIterator$1, __esModule: true };
});

var _getIterator = unwrapExports(getIterator);

var _meta = createCommonjsModule(function (module) {
var META = _uid('meta');


var setDesc = _objectDp.f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !_fails(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!_isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!_has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!_has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !_has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};
});

var _meta_1 = _meta.KEY;
var _meta_2 = _meta.NEED;
var _meta_3 = _meta.fastKey;
var _meta_4 = _meta.getWeak;
var _meta_5 = _meta.onFreeze;

var _validateCollection = function (it, TYPE) {
  if (!_isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  return it;
};

var dP$1 = _objectDp.f;









var fastKey = _meta.fastKey;

var SIZE = _descriptors ? '_s' : 'size';

var getEntry = function (that, key) {
  // fast case
  var index = fastKey(key);
  var entry;
  if (index !== 'F') return that._i[index];
  // frozen object case
  for (entry = that._f; entry; entry = entry.n) {
    if (entry.k == key) return entry;
  }
};

var _collectionStrong = {
  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      _anInstance(that, C, NAME, '_i');
      that._t = NAME;         // collection type
      that._i = _objectCreate(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
    });
    _redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        for (var that = _validateCollection(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p) entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function (key) {
        var that = _validateCollection(this, NAME);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.n;
          var prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if (prev) prev.n = next;
          if (next) next.p = prev;
          if (that._f == entry) that._f = next;
          if (that._l == entry) that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /* , that = undefined */) {
        _validateCollection(this, NAME);
        var f = _ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;
        while (entry = entry ? entry.n : this._f) {
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while (entry && entry.r) entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(_validateCollection(this, NAME), key);
      }
    });
    if (_descriptors) dP$1(C.prototype, 'size', {
      get: function () {
        return _validateCollection(this, NAME)[SIZE];
      }
    });
    return C;
  },
  def: function (that, key, value) {
    var entry = getEntry(that, key);
    var prev, index;
    // change existing entry
    if (entry) {
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if (!that._f) that._f = entry;
      if (prev) prev.n = entry;
      that[SIZE]++;
      // add to index
      if (index !== 'F') that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function (C, NAME, IS_MAP) {
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    _iterDefine(C, NAME, function (iterated, kind) {
      this._t = _validateCollection(iterated, NAME); // target
      this._k = kind;                     // kind
      this._l = undefined;                // previous
    }, function () {
      var that = this;
      var kind = that._k;
      var entry = that._l;
      // revert to the last existing entry
      while (entry && entry.r) entry = entry.p;
      // get next entry
      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
        // or finish the iteration
        that._t = undefined;
        return _iterStep(1);
      }
      // return step by kind
      if (kind == 'keys') return _iterStep(0, entry.k);
      if (kind == 'values') return _iterStep(0, entry.v);
      return _iterStep(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    _setSpecies(NAME);
  }
};

// 7.2.2 IsArray(argument)

var _isArray = Array.isArray || function isArray(arg) {
  return _cof(arg) == 'Array';
};

var SPECIES$2 = _wks('species');

var _arraySpeciesConstructor = function (original) {
  var C;
  if (_isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || _isArray(C.prototype))) C = undefined;
    if (_isObject(C)) {
      C = C[SPECIES$2];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};

// 9.4.2.3 ArraySpeciesCreate(originalArray, length)


var _arraySpeciesCreate = function (original, length) {
  return new (_arraySpeciesConstructor(original))(length);
};

// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex





var _arrayMethods = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || _arraySpeciesCreate;
  return function ($this, callbackfn, that) {
    var O = _toObject($this);
    var self = _iobject(O);
    var f = _ctx(callbackfn, that, 3);
    var length = _toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res;   // map
        else if (res) switch (TYPE) {
          case 3: return true;             // some
          case 5: return val;              // find
          case 6: return index;            // findIndex
          case 2: result.push(val);        // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};

var dP$2 = _objectDp.f;
var each = _arrayMethods(0);


var _collection = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
  var Base = _global[NAME];
  var C = Base;
  var ADDER = IS_MAP ? 'set' : 'add';
  var proto = C && C.prototype;
  var O = {};
  if (!_descriptors || typeof C != 'function' || !(IS_WEAK || proto.forEach && !_fails(function () {
    new C().entries().next();
  }))) {
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    _redefineAll(C.prototype, methods);
    _meta.NEED = true;
  } else {
    C = wrapper(function (target, iterable) {
      _anInstance(target, C, NAME, '_c');
      target._c = new Base();
      if (iterable != undefined) _forOf(iterable, IS_MAP, target[ADDER], target);
    });
    each('add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON'.split(','), function (KEY) {
      var IS_ADDER = KEY == 'add' || KEY == 'set';
      if (KEY in proto && !(IS_WEAK && KEY == 'clear')) _hide(C.prototype, KEY, function (a, b) {
        _anInstance(this, C, KEY);
        if (!IS_ADDER && IS_WEAK && !_isObject(a)) return KEY == 'get' ? undefined : false;
        var result = this._c[KEY](a === 0 ? 0 : a, b);
        return IS_ADDER ? this : result;
      });
    });
    IS_WEAK || dP$2(C.prototype, 'size', {
      get: function () {
        return this._c.size;
      }
    });
  }

  _setToStringTag(C, NAME);

  O[NAME] = C;
  _export(_export.G + _export.W + _export.F, O);

  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

  return C;
};

var SET = 'Set';

// 23.2 Set Objects
var es6_set = _collection(SET, function (get) {
  return function Set() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value) {
    return _collectionStrong.def(_validateCollection(this, SET), value = value === 0 ? 0 : value, value);
  }
}, _collectionStrong);

var _arrayFromIterable = function (iter, ITERATOR) {
  var result = [];
  _forOf(iter, false, result.push, result, ITERATOR);
  return result;
};

// https://github.com/DavidBruant/Map-Set.prototype.toJSON


var _collectionToJson = function (NAME) {
  return function toJSON() {
    if (_classof(this) != NAME) throw TypeError(NAME + "#toJSON isn't generic");
    return _arrayFromIterable(this);
  };
};

// https://github.com/DavidBruant/Map-Set.prototype.toJSON


_export(_export.P + _export.R, 'Set', { toJSON: _collectionToJson('Set') });

// https://tc39.github.io/proposal-setmap-offrom/


var _setCollectionOf = function (COLLECTION) {
  _export(_export.S, COLLECTION, { of: function of() {
    var length = arguments.length;
    var A = new Array(length);
    while (length--) A[length] = arguments[length];
    return new this(A);
  } });
};

// https://tc39.github.io/proposal-setmap-offrom/#sec-set.of
_setCollectionOf('Set');

// https://tc39.github.io/proposal-setmap-offrom/





var _setCollectionFrom = function (COLLECTION) {
  _export(_export.S, COLLECTION, { from: function from(source /* , mapFn, thisArg */) {
    var mapFn = arguments[1];
    var mapping, A, n, cb;
    _aFunction(this);
    mapping = mapFn !== undefined;
    if (mapping) _aFunction(mapFn);
    if (source == undefined) return new this();
    A = [];
    if (mapping) {
      n = 0;
      cb = _ctx(mapFn, arguments[2], 2);
      _forOf(source, false, function (nextItem) {
        A.push(cb(nextItem, n++));
      });
    } else {
      _forOf(source, false, A.push, A);
    }
    return new this(A);
  } });
};

// https://tc39.github.io/proposal-setmap-offrom/#sec-set.from
_setCollectionFrom('Set');

var set$1 = _core.Set;

var set = createCommonjsModule(function (module) {
module.exports = { "default": set$1, __esModule: true };
});

var _Set = unwrapExports(set);

function loadFile(url) {
	var loader = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new AFRAME.THREE.FileLoader();

	return new _Promise(function (resolve, reject) {
		loader.load(url, resolve, function () {}, reject);
	});
}

function obj2array(obj, keys) {
	return keys.map(function (k) {
		return obj[k];
	});
}

function set_difference(a, b) {
	var diff = new _Set(a);
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = _getIterator(b), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var elem = _step.value;

			diff.delete(elem);
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	return diff;
}

var pos = new AFRAME.THREE.Vector3();
var quat = new AFRAME.THREE.Quaternion();
var scale = new AFRAME.THREE.Vector3();

function setLocalTransform(el, newTransform) {
	// compute spawn point position
	newTransform.decompose(pos, quat, scale);

	// position at spawn point
	el.setAttribute('position', pos);
	el.setAttribute('quaternion', quat);
	el.setAttribute('scale', scale);
}

function arrayDeepEquals(a, b) {
	return a && b && a.length === b.length && a.every(function (x, i) {
		return x === b[i];
	});
}

function objFromKeys(src, keys) {
	return keys.reduce(function (dest, k) {
		dest[k] = src[k];return dest;
	}, {});
}

AFRAME.registerSystem('poly-service', {
	schema: {
		key: { type: 'string' }
	},
	init: function init() {
		this.pages = [];
		this.loader = new AFRAME.THREE.FileLoader();
		this.query = 'https://poly.googleapis.com/v1/assets/?format=GLTF2&maxComplexity=SIMPLE&pageSize=20&key=' + this.data.key;
	},
	getListing: function () {
		var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(page) {
			var data, json, prevPage, _data, _json;

			return regenerator.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							console.log('attemping grab of page', page);

							if (!(page < 0)) {
								_context.next = 3;
								break;
							}

							throw new Error('Requested page (' + page + ') before beginning');

						case 3:
							if (!this.pages[page]) {
								_context.next = 7;
								break;
							}

							return _context.abrupt('return', this.pages[page]);

						case 7:
							if (!(page === 0)) {
								_context.next = 16;
								break;
							}

							_context.next = 10;
							return loadFile(this.query, this.loader);

						case 10:
							data = _context.sent;
							json = JSON.parse(data);

							this.pages.push(json);
							return _context.abrupt('return', json);

						case 16:
							prevPage = {};
							_context.prev = 17;
							_context.next = 20;
							return this.getListing(page - 1);

						case 20:
							prevPage = _context.sent;
							_context.next = 27;
							break;

						case 23:
							_context.prev = 23;
							_context.t0 = _context['catch'](17);

							console.log(_context.t0.stack);
							throw new Error('Requested page (' + page + ') past end, no previous page');

						case 27:
							if (!prevPage.nextPageToken) {
								_context.next = 36;
								break;
							}

							_context.next = 30;
							return loadFile(this.query + '&pageToken=' + prevPage.nextPageToken, this.loader);

						case 30:
							_data = _context.sent;
							_json = JSON.parse(_data);

							this.pages.push(_json);
							return _context.abrupt('return', _json);

						case 36:
							throw new Error('Requested page (' + page + ') past end, no page token');

						case 37:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, this, [[17, 23]]);
		}));

		function getListing(_x) {
			return _ref.apply(this, arguments);
		}

		return getListing;
	}(),
	fakeGetListing: function () {
		var _ref2 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2(page) {
			var data;
			return regenerator.wrap(function _callee2$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							_context2.next = 2;
							return loadFile('testdata/listing.json', this.loader);

						case 2:
							data = _context2.sent;
							return _context2.abrupt('return', JSON.parse(data));

						case 4:
						case 'end':
							return _context2.stop();
					}
				}
			}, _callee2, this);
		}));

		function fakeGetListing(_x2) {
			return _ref2.apply(this, arguments);
		}

		return fakeGetListing;
	}()
});

AFRAME.registerComponent('avr-visible', {
	schema: { type: 'boolean', default: false },
	init: function init() {
		this.el.addEventListener('model-loaded', this.update.bind(this));
	},
	update: function update() {
		var _this = this;

		console.log('visible update:', this.data);
		this.el.object3D.traverse(function (o) {
			return o.visible = _this.data;
		});
	}
});

var scaleFactor = 1.2;

AFRAME.registerComponent('hover-scale', {
	init: function init() {
		var _this = this;

		// create animation
		this.el.setAttribute('animation__hover', {
			startEvents: ['hoverstart', 'mouseleave'],
			property: 'scale',
			dir: 'alternate',
			easing: 'easeOutQuad',
			dur: 200
		});

		// update scale
		this.el.addEventListener('mouseenter', function () {
			var smallScale = obj2array(_this.el.getAttribute('scale'), ['x', 'y', 'z']);
			var bigScale = smallScale.map(function (x) {
				return x * scaleFactor;
			});
			_this.el.setAttribute('animation__hover', { from: smallScale.join(' '), to: bigScale.join(' ') });

			_this.el.emit('hoverstart');
		});
	}
});

AFRAME.registerComponent('maintain-size', {
	schema: { type: 'vec3' },
	init: function init() {
		this.el.addEventListener('model-loaded', this.rescale.bind(this));
	},
	rescale: function rescale() {
		this.el.setAttribute('position', { x: 0, y: 0, z: 0 });
		this.el.setAttribute('scale', { x: 1, y: 1, z: 1 });

		var box = new AFRAME.THREE.Box3();
		box.setFromObject(this.el.object3D);
		var size = box.getSize(),
		    center = this.el.object3D.worldToLocal(box.getCenter());
		var ratio = Math.min(this.data.x / size.x, this.data.y / size.y, this.data.z / size.z);

		this.el.setAttribute('scale', { x: ratio, y: ratio, z: ratio });
		this.el.setAttribute('position', center.multiplyScalar(-ratio));

		if (this.el.components.collision) {
			this.el.components.collision.updateTransform();
		}
	}
});

function getGamepads() {
	if (!altspace.inClient) return _Promise.reject();

	function getPads(resolve, reject) {
		console.log('Attempting to get controllers');
		gamepads = altspace.getGamepads();
		if (gamepads.length > 0) {
			console.log('Got controllers');
			resolve(gamepads.filter(function (g) {
				return !!g.hand;
			}));
		} else {
			reject();
		}
	}

	function waitForFocus(resolve, reject) {
		var scene = document.querySelector('a-scene');
		function clearAndResolve() {
			scene.removeEventListener('click', clearAndResolve);
			resolve();
		}

		console.log('waiting for focus');
		scene.addEventListener('click', clearAndResolve);
	}

	function getPadsRepeatedly(attemptsRemaining) {
		return new _Promise(getPads).catch(function () {
			if (--attemptsRemaining > 0) {
				return new _Promise(function (resolve, reject) {
					return setTimeout(resolve, 500);
				}).then(function () {
					return getPadsRepeatedly(attemptsRemaining);
				});
			} else console.log('Failed to get controllers');
		});
	}

	return new _Promise(getPads).catch(function () {
		return new _Promise(waitForFocus);
	}).then(function () {
		return getPadsRepeatedly(20);
	});
}

var gamepads = [];
var gamepadsPromise = null;

AFRAME.registerComponent('altspace-controls', {
	schema: { default: 'right' },
	init: function () {
		var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
			var _this = this;

			var pads;
			return regenerator.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							this.gamepad = null;
							this.parentInverse = new THREE.Matrix4().getInverse(this.el.parentElement.object3D.matrixWorld);
							if (!gamepadsPromise) gamepadsPromise = getGamepads();

							if (!(gamepads.length > 0)) {
								_context.next = 7;
								break;
							}

							_context.t0 = gamepads;
							_context.next = 10;
							break;

						case 7:
							_context.next = 9;
							return gamepadsPromise;

						case 9:
							_context.t0 = _context.sent;

						case 10:
							pads = _context.t0;

							this.gamepad = pads.filter(function (p) {
								return p.hand === _this.data;
							})[0];
							if (!this.gamepad) {
								console.log('No ' + this.data + '-hand controller found');
							}

						case 13:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, this);
		}));

		function init() {
			return _ref.apply(this, arguments);
		}

		return init;
	}(),
	tick: function tick() {
		if (!this.gamepad) return;

		this.el.object3D.position.copy(this.gamepad.position).applyMatrix4(this.parentInverse);
		this.el.object3D.quaternion.copy(this.gamepad.rotation);

		if (!this.gripState && this.gamepad.buttons[1].pressed) {
			this.gripState = true;
			this.el.emit('gripdown', this.el, false);
		} else if (this.gripState && !this.gamepad.buttons[1].pressed) {
			this.gripState = false;
			this.el.emit('gripup', this.el, false);
		}
	}
});

var mat = new AFRAME.THREE.Matrix4();

AFRAME.registerComponent('grabbable', {
	dependencies: ['sync'],
	schema: {
		enabled: { default: true }
	},
	init: function init() {
		this.grabber = null;
		this.localTransform = new AFRAME.THREE.Matrix4();

		// pre-bound event handlers
		this._hoverStart = this.hoverStart.bind(this);
		this._pickup = this.pickup.bind(this);
		this._drop = this.drop.bind(this);
		this._hoverEnd = this.hoverEnd.bind(this);

		this.sync = this.el.components.sync;
		if (this.sync.isConnected) this.spawnPickup();else this.el.addEventListener('connected', this.spawnPickup.bind(this));
	},
	update: function update() {
		if (this.data.enabled) {
			this.el.addEventListener('collision-start', this._hoverStart);
			this.el.addEventListener('collision-end', this._hoverEnd);
		} else {
			this.el.removeEventListener('collision-start', this._hoverStart);
			this.el.removeEventListener('collision-end', this._hoverEnd);
		}
	},
	hoverStart: function hoverStart(_ref) {
		var hand = _ref.detail;

		hand.addEventListener('gripdown', this._pickup);
	},
	pickup: function pickup(_ref2) {
		var hand = _ref2.detail;

		this.grabber = hand;

		// the transform of the object in hand space
		hand.object3D.updateMatrixWorld(true);
		this.el.object3D.updateMatrixWorld(true);
		this.localTransform.getInverse(hand.object3D.matrixWorld).multiply(this.el.object3D.matrixWorld);

		this.el.setAttribute('collision', 'kinematic', true);
		hand.addEventListener('gripup', this._drop);
	},
	drop: function drop(_ref3) {
		var hand = _ref3.detail;

		if (this.grabber === hand) {
			this.grabber = null;
			this.el.setAttribute('collision', 'kinematic', false);
		}
	},
	hoverEnd: function hoverEnd(_ref4) {
		var hand = _ref4.detail;

		hand.removeEventListener('gripdown', this._pickup);
	},
	tick: function tick() {
		if (this.grabber) {
			this.grabber.object3D.updateMatrixWorld(true);
			setLocalTransform(this.el, mat.getInverse(this.el.object3D.parent.matrixWorld).multiply(this.grabber.object3D.matrixWorld).multiply(this.localTransform));
		}
	},
	spawnPickup: function spawnPickup() {
		var self = this,
		    syncSys = this.el.sceneEl.systems['sync-system'];

		self.sync.dataRef.child('spawnClient').on('value', checkSpawnClient);
		function checkSpawnClient(snapshot) {
			if (snapshot.val() === syncSys.clientId) {
				self.sync.dataRef.child('grabber').on('value', assignGrabHand);
			}
		}

		function assignGrabHand(snapshot) {
			if (!snapshot.val()) return;

			var hand = document.getElementById(snapshot.val());
			console.log(snapshot.val(), hand);
			self.pickup({ detail: hand });
			self.sync.dataRef.child('spawnClient').remove();
			self.sync.dataRef.child('grabber').remove();
		}
	}
});

var _createProperty = function (object, index, value) {
  if (index in object) _objectDp.f(object, index, _propertyDesc(0, value));
  else object[index] = value;
};

_export(_export.S + _export.F * !_iterDetect(function (iter) {  }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = _toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = core_getIteratorMethod(O);
    var length, result, step, iterator;
    if (mapping) mapfn = _ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if (iterFn != undefined && !(C == Array && _isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        _createProperty(result, index, mapping ? _iterCall(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = _toLength(O.length);
      for (result = new C(length); length > index; index++) {
        _createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

var from$3 = _core.Array.from;

var from$1 = createCommonjsModule(function (module) {
module.exports = { "default": from$3, __esModule: true };
});

unwrapExports(from$1);

var toConsumableArray = createCommonjsModule(function (module, exports) {
exports.__esModule = true;



var _from2 = _interopRequireDefault(from$1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  } else {
    return (0, _from2.default)(arr);
  }
};
});

var _toConsumableArray = unwrapExports(toConsumableArray);

var ITERATOR$4 = _wks('iterator');

var core_isIterable = _core.isIterable = function (it) {
  var O = Object(it);
  return O[ITERATOR$4] !== undefined
    || '@@iterator' in O
    // eslint-disable-next-line no-prototype-builtins
    || _iterators.hasOwnProperty(_classof(O));
};

var isIterable$2 = core_isIterable;

var isIterable = createCommonjsModule(function (module) {
module.exports = { "default": isIterable$2, __esModule: true };
});

unwrapExports(isIterable);

var slicedToArray = createCommonjsModule(function (module, exports) {
exports.__esModule = true;



var _isIterable3 = _interopRequireDefault(isIterable);



var _getIterator3 = _interopRequireDefault(getIterator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = (0, _getIterator3.default)(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if ((0, _isIterable3.default)(Object(arr))) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();
});

var _slicedToArray = unwrapExports(slicedToArray);

var MAP = 'Map';

// 23.1 Map Objects
var es6_map = _collection(MAP, function (get) {
  return function Map() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key) {
    var entry = _collectionStrong.getEntry(_validateCollection(this, MAP), key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value) {
    return _collectionStrong.def(_validateCollection(this, MAP), key === 0 ? 0 : key, value);
  }
}, _collectionStrong, true);

// https://github.com/DavidBruant/Map-Set.prototype.toJSON


_export(_export.P + _export.R, 'Map', { toJSON: _collectionToJson('Map') });

// https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
_setCollectionOf('Map');

// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
_setCollectionFrom('Map');

var map$1 = _core.Map;

var map = createCommonjsModule(function (module) {
module.exports = { "default": map$1, __esModule: true };
});

var _Map = unwrapExports(map);

var classCallCheck = createCommonjsModule(function (module, exports) {
exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
});

var _classCallCheck = unwrapExports(classCallCheck);

// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
_export(_export.S + _export.F * !_descriptors, 'Object', { defineProperty: _objectDp.f });

var $Object = _core.Object;
var defineProperty$2 = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};

var defineProperty = createCommonjsModule(function (module) {
module.exports = { "default": defineProperty$2, __esModule: true };
});

unwrapExports(defineProperty);

var createClass = createCommonjsModule(function (module, exports) {
exports.__esModule = true;



var _defineProperty2 = _interopRequireDefault(defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
});

var _createClass = unwrapExports(createClass);

var DoubleMap = function () {
	function DoubleMap() {
		_classCallCheck(this, DoubleMap);

		this.aToB = new _Map();
		this.bToA = new _Map();
	}

	_createClass(DoubleMap, [{
		key: "set",
		value: function set(a, b) {
			var oldA = this.bToA.get(b),
			    oldB = this.aToB.get(a);
			if (oldA !== a || oldB !== b) {
				this.aToB.delete(oldA);
				this.bToA.delete(oldB);
			}

			this.aToB.set(a, b);
			this.bToA.set(b, a);
		}
	}, {
		key: "getB",
		value: function getB(a) {
			return this.aToB.get(a);
		}
	}, {
		key: "getA",
		value: function getA(b) {
			return this.bToA.get(b);
		}
	}, {
		key: "forEach",
		value: function forEach(fn) {
			return this.bToA.forEach(fn);
		}
	}, {
		key: "deleteA",
		value: function deleteA(a) {
			if (!this.aToB.get(a)) return;
			this.bToA.delete(this.aToB.get(a));
			this.aToB.delete(a);
		}
	}, {
		key: "deleteB",
		value: function deleteB(b) {
			if (!this.bToA.get(b)) return;
			this.aToB.delete(this.bToA.get(b));
			this.bToA.delete(b);
		}
	}]);

	return DoubleMap;
}();

var _global$2 = createCommonjsModule(function (module) {
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
});

var _core$2 = createCommonjsModule(function (module) {
var core = module.exports = { version: '2.5.3' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
});

var _core_1$1 = _core$2.version;

var _isObject$2 = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

var _anObject$2 = function (it) {
  if (!_isObject$2(it)) throw TypeError(it + ' is not an object!');
  return it;
};

var _fails$2 = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

// Thank's IE8 for his funny defineProperty
var _descriptors$2 = !_fails$2(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

var document$3 = _global$2.document;
// typeof document.createElement is 'object' in old IE
var is$1 = _isObject$2(document$3) && _isObject$2(document$3.createElement);
var _domCreate$2 = function (it) {
  return is$1 ? document$3.createElement(it) : {};
};

var _ie8DomDefine$2 = !_descriptors$2 && !_fails$2(function () {
  return Object.defineProperty(_domCreate$2('div'), 'a', { get: function () { return 7; } }).a != 7;
});

// 7.1.1 ToPrimitive(input [, PreferredType])

// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
var _toPrimitive$2 = function (it, S) {
  if (!_isObject$2(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !_isObject$2(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !_isObject$2(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !_isObject$2(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var dP$3 = Object.defineProperty;

var f$2 = _descriptors$2 ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  _anObject$2(O);
  P = _toPrimitive$2(P, true);
  _anObject$2(Attributes);
  if (_ie8DomDefine$2) try {
    return dP$3(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var _objectDp$2 = {
	f: f$2
};

var _propertyDesc$2 = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var _hide$2 = _descriptors$2 ? function (object, key, value) {
  return _objectDp$2.f(object, key, _propertyDesc$2(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var hasOwnProperty$1 = {}.hasOwnProperty;
var _has$2 = function (it, key) {
  return hasOwnProperty$1.call(it, key);
};

var id$1 = 0;
var px$1 = Math.random();
var _uid$2 = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id$1 + px$1).toString(36));
};

var _redefine$2 = createCommonjsModule(function (module) {
var SRC = _uid$2('src');
var TO_STRING = 'toString';
var $toString = Function[TO_STRING];
var TPL = ('' + $toString).split(TO_STRING);

_core$2.inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) _has$2(val, 'name') || _hide$2(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) _has$2(val, SRC) || _hide$2(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === _global$2) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    _hide$2(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    _hide$2(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});
});

var _aFunction$2 = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

// optional / simple context binding

var _ctx$2 = function (fn, that, length) {
  _aFunction$2(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

var PROTOTYPE$2 = 'prototype';

var $export$2 = function (type, name, source) {
  var IS_FORCED = type & $export$2.F;
  var IS_GLOBAL = type & $export$2.G;
  var IS_STATIC = type & $export$2.S;
  var IS_PROTO = type & $export$2.P;
  var IS_BIND = type & $export$2.B;
  var target = IS_GLOBAL ? _global$2 : IS_STATIC ? _global$2[name] || (_global$2[name] = {}) : (_global$2[name] || {})[PROTOTYPE$2];
  var exports = IS_GLOBAL ? _core$2 : _core$2[name] || (_core$2[name] = {});
  var expProto = exports[PROTOTYPE$2] || (exports[PROTOTYPE$2] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? _ctx$2(out, _global$2) : IS_PROTO && typeof out == 'function' ? _ctx$2(Function.call, out) : out;
    // extend global
    if (target) _redefine$2(target, key, out, type & $export$2.U);
    // export
    if (exports[key] != out) _hide$2(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
_global$2.core = _core$2;
// type bitmap
$export$2.F = 1;   // forced
$export$2.G = 2;   // global
$export$2.S = 4;   // static
$export$2.P = 8;   // proto
$export$2.B = 16;  // bind
$export$2.W = 32;  // wrap
$export$2.U = 64;  // safe
$export$2.R = 128; // real proto method for `library`
var _export$2 = $export$2;

var toString$1 = {}.toString;

var _cof$2 = function (it) {
  return toString$1.call(it).slice(8, -1);
};

// fallback for non-array-like ES3 and non-enumerable old V8 strings

// eslint-disable-next-line no-prototype-builtins
var _iobject$2 = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return _cof$2(it) == 'String' ? it.split('') : Object(it);
};

// 7.2.1 RequireObjectCoercible(argument)
var _defined$2 = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

// to indexed object, toObject with fallback for non-array-like ES3 strings


var _toIobject$2 = function (it) {
  return _iobject$2(_defined$2(it));
};

// 7.1.4 ToInteger
var ceil$1 = Math.ceil;
var floor$1 = Math.floor;
var _toInteger$2 = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor$1 : ceil$1)(it);
};

// 7.1.15 ToLength

var min$2 = Math.min;
var _toLength$2 = function (it) {
  return it > 0 ? min$2(_toInteger$2(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

var max$1 = Math.max;
var min$3 = Math.min;
var _toAbsoluteIndex$2 = function (index, length) {
  index = _toInteger$2(index);
  return index < 0 ? max$1(index + length, 0) : min$3(index, length);
};

// false -> Array#indexOf
// true  -> Array#includes



var _arrayIncludes$2 = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = _toIobject$2($this);
    var length = _toLength$2(O.length);
    var index = _toAbsoluteIndex$2(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

var SHARED$1 = '__core-js_shared__';
var store$1 = _global$2[SHARED$1] || (_global$2[SHARED$1] = {});
var _shared$2 = function (key) {
  return store$1[key] || (store$1[key] = {});
};

var _wks$2 = createCommonjsModule(function (module) {
var store = _shared$2('wks');

var Symbol = _global$2.Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid$2)('Symbol.' + name));
};

$exports.store = store;
});

// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = _wks$2('unscopables');
var ArrayProto$1 = Array.prototype;
if (ArrayProto$1[UNSCOPABLES] == undefined) _hide$2(ArrayProto$1, UNSCOPABLES, {});
var _addToUnscopables$2 = function (key) {
  ArrayProto$1[UNSCOPABLES][key] = true;
};

// https://github.com/tc39/Array.prototype.includes

var $includes = _arrayIncludes$2(true);

_export$2(_export$2.P, 'Array', {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

_addToUnscopables$2('includes');

var includes = _core$2.Array.includes;

var AmmoPool = function () {
	function AmmoPool() {
		_classCallCheck(this, AmmoPool);

		this._pools = {};
		this._refs = new _Map();
	}

	_createClass(AmmoPool, [{
		key: "get",
		value: function get(type) {
			this._pools[type] = this._pools[type] || [];
			var ret = this._pools[type].shift() || new Ammo[type]();
			this._refs.set(ret, type);
			return ret;
		}
	}, {
		key: "getSome",
		value: function getSome(type, count) {
			var acc = [];
			for (var i = 0; i < count; i++) {
				acc.push(this.get(type));
			}return acc;
		}
	}, {
		key: "done",
		value: function done() {
			var _this = this;

			for (var _len = arguments.length, vals = Array(_len), _key = 0; _key < _len; _key++) {
				vals[_key] = arguments[_key];
			}

			vals.forEach(function (val) {
				var type = _this._refs.get(val);
				_this._pools[type] = _this._pools[type] || [];
				_this._pools[type].push(val);
			});
		}
	}]);

	return AmmoPool;
}();

/* Useful guide: http://hamelot.io/programming/using-bullet-only-for-collision-detection/ */

AFRAME.registerSystem('collision', {
	init: function init() {
		var _this = this;

		// entity mapping
		this.el2co = new DoubleMap();
		this.el2localBounds = new _Map();
		this.regQueue = [];
		this.manifolds = new _Set();
		this.forceUpdateObjects = new _Set();
		this._debugMeshes = new _Map();
		this.ap = new AmmoPool();

		// ammo setup
		Ammo().then(function () {

			// initialize sim world
			var collisionConfig = new Ammo.btDefaultCollisionConfiguration();
			var dispatcher = new Ammo.btCollisionDispatcher(collisionConfig);

			var _ap$getSome = _this.ap.getSome('btVector3', 2),
			    _ap$getSome2 = _slicedToArray(_ap$getSome, 2),
			    min = _ap$getSome2[0],
			    max = _ap$getSome2[1];

			min.setValue(-100, -100, -100);max.setValue(100, 100, 100);
			var broadphase = new Ammo.btAxisSweep3(min, max);
			_this.world = new Ammo.btCollisionWorld(dispatcher, broadphase, collisionConfig);
			_this.ap.done(min, max);

			_this.regQueue.forEach(function (el) {
				return _this.registerCollisionBody(el);
			});
			_this.regQueue = null;
		});
	},

	tick: function tick() {
		var _this2 = this;

		if (!this.world) return;

		// update object transforms
		this.el2co.forEach(function (el, co) {
			try {
				if (!_this2.forceUpdateObjects.has(el) && !el.getAttribute('collision').kinematic) {
					return;
				}

				el.object3D.updateMatrixWorld(true);
				var localBounds = _this2.el2localBounds.get(el);
				var worldPos = el.object3D.localToWorld(localBounds.getCenter());
				var worldRot = el.object3D.getWorldQuaternion();
				var worldScale = el.object3D.getWorldScale();
				var transform = co.getWorldTransform();
				var shape = co.getCollisionShape();
				/*if(el.id === 'spawn'){
    	console.log('transform update');
    	console.log('local center:', localBounds.getCenter().toArray());
    	console.log('world center:', worldPos.toArray());
    	console.log('object root:', el.object3D.getWorldPosition().toArray());
    }*/

				// make sure to free any allocated vectors!

				var _ap$getSome3 = _this2.ap.getSome('btVector3', 2),
				    _ap$getSome4 = _slicedToArray(_ap$getSome3, 2),
				    pos = _ap$getSome4[0],
				    scale = _ap$getSome4[1];

				var quat = _this2.ap.get('btQuaternion');
				pos.setValue.apply(pos, _toConsumableArray(worldPos.toArray()));
				quat.setValue.apply(quat, _toConsumableArray(worldRot.toArray()));
				scale.setValue.apply(scale, _toConsumableArray(worldScale.toArray()));
				transform.setOrigin(pos);
				transform.setRotation(quat);
				shape.setLocalScaling(scale);
				_this2.ap.done(pos, quat, scale);

				_this2.forceUpdateObjects.delete(el);

				if (_this2.el.sceneEl.hasAttribute('debug') && _this2._debugMeshes.has(el)) {
					var mesh = _this2._debugMeshes.get(el);
					mesh.position.copy(worldPos);
					mesh.quaternion.copy(worldRot);
					mesh.scale.copy(worldScale);
				}
			} catch (e) {
				console.error('xfrm update failed:', err, el);
			}
		});

		// update collision list
		this.world.performDiscreteCollisionDetection();

		// get list of intersecting objects
		var dispatcher = this.world.getDispatcher();
		var hitCount = dispatcher.getNumManifolds();
		var hits = new _Set();
		for (var i = 0; i < hitCount; i++) {
			var manifold = dispatcher.getManifoldByIndexInternal(i);
			if (manifold.getNumContacts() > 0) hits.add(manifold);
		}

		try {
			// detect collision-start
			var newHits = set_difference(hits, this.manifolds);
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = _getIterator(newHits), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var _manifold = _step.value;

					console.log('new hit!');
					var co1 = _manifold.getBody0(),
					    co2 = _manifold.getBody1();
					var el1 = this.el2co.getA(co1),
					    el2 = this.el2co.getA(co2);
					if (!el1 || !el2) continue;

					console.log('valid hit');
					var el1targets = el1.getAttribute('collision').with,
					    el2targets = el2.getAttribute('collision').with;
					console.log(el1targets.map(function (x) {
						return x.id;
					}), el2targets.map(function (x) {
						return x.id;
					}));
					if (el1targets.includes(el2) && el2targets.includes(el1)) {
						console.log('collision-start', el1.id, el2.id);
						el2.emit('collision-start', el1, false);
						el1.emit('collision-start', el2, false);
					}
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		} catch (e) {
			console.error('coll-start failed:', e);
		}

		try {
			// detect collision-end
			var oldHits = set_difference(this.manifolds, hits);
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = _getIterator(oldHits), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var _manifold2 = _step2.value;

					var _co = _manifold2.getBody0(),
					    _co2 = _manifold2.getBody1();
					var _el = this.el2co.getA(_co),
					    _el2 = this.el2co.getA(_co2);
					if (!_el || !_el2) continue;

					var _el1targets = [].concat(_toConsumableArray(_el.getAttribute('collision').with)),
					    _el2targets = [].concat(_toConsumableArray(_el2.getAttribute('collision').with));
					if (_el1targets.includes(_el2) && _el2targets.includes(_el)) {
						console.log('hit end');
						_el2.emit('collision-end', _el, false);
						_el.emit('collision-end', _el2, false);
					}
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}
		} catch (e) {
			console.error('coll-end failed:', e);
		}

		// remember last frame's collisions
		this.manifolds = hits;
	},

	registerCollisionBody: function registerCollisionBody(el) {
		if (!this.world) {
			this.regQueue.push(el);
			return;
		}

		// compute bounding box of entity
		var bounds = new AFRAME.THREE.Box3();
		bounds.setFromObject(el.object3DMap.mesh);
		var inv = new THREE.Matrix4().getInverse(el.object3D.matrixWorld);
		bounds.applyMatrix4(inv);
		this.el2localBounds.set(el, bounds);

		// create shape
		var size = bounds.getSize();
		var halfExtants = new Ammo.btVector3(size.x / 2, size.y / 2, size.z / 2);
		var co = new Ammo.btCollisionObject();
		co.setCollisionShape(new Ammo.btBoxShape(halfExtants));
		this.el2co.set(el, co);

		this.world.addCollisionObject(co);

		// create debug mesh
		if (this.el.sceneEl.hasAttribute('debug')) {
			var mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(size.x, size.y, size.z), new THREE.MeshBasicMaterial({ color: 'magenta', transparent: true, opacity: .2 }));
			this._debugMeshes.set(el, mesh);
			this.el.sceneEl.object3D.add(mesh);
		}
	},
	removeCollisionBody: function removeCollisionBody(el) {
		var co = this.el2co.getB(el);
		this.world.removeCollisionObject(co);
		this.el2co.deleteA(el);

		if (this.el.sceneEl.hasAttribute('debug')) {
			this.el.sceneEl.object3D.remove(this._debugMeshes.get(el));
			this._debugMeshes.delete(el);
		}
	},
	isRegistered: function isRegistered(el) {
		return !!this.el2co.getB(el);
	},
	forceUpdateTransform: function forceUpdateTransform(el) {
		this.forceUpdateObjects.add(el);
	}
});

AFRAME.registerComponent('collision', {
	schema: {
		with: { type: 'selectorAll'
			/*default: [],
   parse: function(value){
   	if (!value) { return null; }
   	if (typeof value !== 'string') { return value; }
   			let sel = value.split(',').map(x => `${x}[collision]`).join(',');
   	return Array.prototype.slice.call(document.querySelectorAll(sel), 0);
   }*/
		},
		kinematic: { type: 'boolean', default: false }
	},
	init: function init() {
		if (this.el.object3DMap.mesh) this.updateBounds();
		this.el.addEventListener('model-loaded', this.updateBounds.bind(this));
	},
	update: function update(oldData) {
		// one last late update when kinematic stops
		if (oldData.kinematic && !this.data.kinematic) this.system.forceUpdateTransform(this.el);

		if (!arrayDeepEquals(oldData.with, this.data.with)) {
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = _getIterator(this.data.with), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var el = _step3.value;

					if (el !== this.el && el.components && el.components.collision) {
						console.log('updating collider of', el.id);
						el.components.collision.updateProperties();
					}
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}
		}
	},
	updateBounds: function updateBounds() {
		//if(this.el.id === 'spawn') console.log('updateBounds');
		if (this.system.isRegistered(this.el)) this.system.removeCollisionBody(this.el);
		this.system.registerCollisionBody(this.el);
		this.updateTransform();
	},
	updateTransform: function updateTransform() {
		//if(this.el.id === 'spawn') console.log('updateTransform');
		this.system.forceUpdateTransform(this.el);
	},
	remove: function remove() {
		this.system.removeCollisionBody(this.el);
	}
});

AFRAME.registerComponent('grab-indicator', {
	init: function init() {
		var _this = this;

		this.el.setAttribute('color', 'white');
		this.el.addEventListener('collision-start', function () {
			_this.el.setAttribute('color', 'yellow');
		});
		this.el.addEventListener('collision-end', function () {
			_this.el.setAttribute('color', 'white');
		});
	}
});

AFRAME.registerComponent('spawner', {
	schema: {
		enabled: { default: true },
		spawnTarget: { type: 'selector', default: '#decor' }
	},
	init: function init() {
		this._hoverStart = this.hoverStart.bind(this);
		this._hoverEnd = this.hoverEnd.bind(this);
		this.handlers = new _Map();

		this.syncSys = this.el.sceneEl.systems['sync-system'];
		this.activeItem = null;
		if (this.el.sceneEl.hasAttribute('debug')) {
			this.setSpawn('model-gltf', 'https://poly.googleapis.com/downloads/428MKgODp0H/aDT46ikQ6r4/Seal_01.gltf', 'https://poly.google.com/view/428MKgODp0H');
		}
	},
	update: function update() {
		if (this.data.enabled) {
			this.el.addEventListener('collision-start', this._hoverStart);
			this.el.addEventListener('collision-end', this._hoverEnd);
		} else {
			this.el.removeEventListener('collision-start', this._hoverStart);
			this.el.removeEventListener('collision-end', this._hoverEnd);

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = _getIterator(this.handlers), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var _ref = _step.value;

					var _ref2 = _slicedToArray(_ref, 2);

					var el = _ref2[0];
					var handler = _ref2[1];

					this.hoverEnd({ detail: el });
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}
	},
	hoverStart: function hoverStart(_ref3) {
		var target = _ref3.detail;

		var handler = this.spawn(target);
		this.handlers.set(target, handler);
		target.addEventListener('gripdown', handler);
	},
	spawn: function spawn(target) {
		var _this = this;

		return function () {
			// create new model
			/*let child = document.createElement('a-entity');
   child.id = key;
   child.setAttribute('mixin', 'decoration');
   child.setAttribute('data-src', this.el.getAttribute('gltf-model'));
   child.setAttribute('data-spawnedby', this.el.id);
   child.setAttribute('data-spawnedto', target.id);
   this.data.spawnTarget.appendChild(child);*/

			/*this.data.spawnTarget.components['decor-sync'].instantiate(
   	this.activeItem.type,
   	this.activeItem.srcUrl,
   	this.activeItem.moreInfoUrl
   );*/

			if (!_this.syncSys.isConnected) {
				console.error('Spawner: sync system not yet connected, cannot spawn.');
				return;
			}

			/*
   This is copy-pasted from the source code for sync-system#instantiate with minor changes
   */
			var instantiationProps = {
				instantiatorId: '',
				groupName: 'main',
				mixin: 'decoration',
				parent: _this.attrValue.spawnTarget || '#decor',
				creatorUserId: _this.syncSys.userInfo.userId,
				clientId: _this.syncSys.clientId
			};

			var instance = _this.syncSys.instantiatedElementsRef.child(instantiationProps.groupName).push(instantiationProps);

			var entityRef = _this.syncSys.sceneRef.child('main-instance-' + instance.key()),
			    dataRef = entityRef.child('data');

			// compute new local transform matrix
			_this.data.spawnTarget.object3D.updateMatrixWorld(true);
			_this.el.object3D.updateMatrixWorld(true);
			var mat = new AFRAME.THREE.Matrix4().getInverse(_this.data.spawnTarget.object3D.matrixWorld).multiply(_this.el.object3D.matrixWorld);

			// extract to transform data
			var pos = new AFRAME.THREE.Vector3(),
			    quat = new AFRAME.THREE.Quaternion(),
			    rot = new AFRAME.THREE.Euler(),
			    scale = new AFRAME.THREE.Vector3();
			mat.decompose(pos, quat, scale);
			rot = rot.setFromQuaternion(quat).toVector3().multiplyScalar(180 / Math.PI);

			// set sync initial position
			dataRef.child('position').set(objFromKeys(pos, ['x', 'y', 'z']));
			dataRef.child('rotation').set(objFromKeys(rot, ['x', 'y', 'z']));
			dataRef.child('scale').set(objFromKeys(scale, ['x', 'y', 'z']));

			// assign model properties
			dataRef.child('type').set(_this.activeItem.type);
			dataRef.child('srcUrl').set(_this.activeItem.srcUrl);
			dataRef.child('moreInfoUrl').set(_this.activeItem.moreInfoUrl);

			// assign grab properties
			dataRef.child('spawnClient').set(_this.syncSys.clientId);
			dataRef.child('grabber').set(target.id);

			// disable this spawner until the hand clears the collider
			_this.el.setAttribute('spawner', 'enabled', false);
		};
	},
	hoverEnd: function hoverEnd(_ref4) {
		var target = _ref4.detail;

		target.removeEventListener('gripdown', this.handlers.get(target));
		this.handlers.delete(target);
		this.el.setAttribute('spawner', 'enabled', true);
	},
	setSpawn: function setSpawn(type, srcUrl, moreInfoUrl) {
		this.activeItem = { type: type, srcUrl: srcUrl, moreInfoUrl: moreInfoUrl };
		if (type === 'model-gltf') this.el.setAttribute('gltf-model', srcUrl);
	}
});

AFRAME.registerComponent('set-from-data', {
	schema: {
		from: { type: 'string' },
		to: { type: 'array' }
	},
	multiple: true,
	update: function update() {
		var _el;

		(_el = this.el).setAttribute.apply(_el, _toConsumableArray(this.data.to).concat([this.el.dataset[this.data.from]]));
	}
});

AFRAME.registerComponent('quaternion', {
	schema: { type: 'vec4' },
	update: function update() {
		//this.el.object3D.quaternion.copy(this.data);
		var e = new AFRAME.THREE.Euler().setFromQuaternion(this.data, 'YZX').toVector3().multiplyScalar(180 / Math.PI);
		this.el.setAttribute('rotation', e);
	}
});

AFRAME.registerComponent('decor-sync', {
	init: function init() {
		this.queuedInstantiations = [];
		this.syncSys = this.el.sceneEl.systems['sync-system'];
		this.el.sceneEl.addEventListener('connected', this.connected.bind(this));
	},
	connected: function connected() {
		this.instances = this.syncSys.connection.space.child('decorations');
		this.instances.on('child_added', this.listenToInstanceGroup.bind(this));
		this.instances.on('child_removed', this.stopListeningToInstanceGroup.bind(this));
	},
	listenToInstanceGroup: function listenToInstanceGroup(snapshot) {
		snapshot.ref().on('child_added', this.createDecoration.bind(this));
		snapshot.ref().on('child_removed', this.removeDecoration.bind(this));
	},
	stopListeningToInstanceGroup: function stopListeningToInstanceGroup(snapshot) {
		snapshot.ref().off('child_added');
		snapshot.ref().off('child_removed');
	},
	createDecoration: function createDecoration(snapshot) {
		var val = snapshot.val(),
		    key = snapshot.key();

		// create new model
		/*let child = document.createElement('a-entity');
  child.id = key;
  child.setAttribute('mixin', 'decoration');
  child.setAttribute('data-src', this.el.getAttribute('gltf-model'));
  child.setAttribute('data-spawnedby', this.el.id);
  child.setAttribute('data-spawnedto', target.id);
  this.el.appendChild(child);*/
	},
	removeDecoration: function removeDecoration(snapshot) {
		var key = snapshot.key();
		var el = this.el.querySelector('#' + key);
		el.parentNode.removeChild(el);
	},
	processQueuedInstantiations: function processQueuedInstantiations() {
		var _this = this;

		this.queuedInstantiations.forEach(function (instanceProps) {
			_this.instances.push(instanceProps).onDisconnect().remove();
		});
		this.queuedInstantiations.length = 0;
	},
	instantiate: function instantiate(type, srcUrl) {
		/*
  General: ownerId, clientId
  Specific: type, srcUrl
  */
		var instanceProps = {};

		this.queuedInstantiations.push(instanceProps);
		if (this.syncSys.connected) {
			this.processQueuedInstantiations();
		}
	}
});

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing. The function also has a property 'clear' 
 * that is a function which will clear the timer to prevent previously scheduled executions. 
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

var debounce = function debounce(func, wait, immediate){
  var timeout, args, context, timestamp, result;
  if (null == wait) wait = 100;

  function later() {
    var last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        context = args = null;
      }
    }
  }

  var debounced = function(){
    context = this;
    args = arguments;
    timestamp = Date.now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };

  debounced.clear = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  debounced.flush = function() {
    if (timeout) {
      result = func.apply(context, args);
      context = args = null;
      
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
};

AFRAME.registerComponent('sync-src', {
	dependencies: ['sync'],
	init: function init() {
		var _this = this;

		this.currentData = { type: '', srcUrl: '', moreInfoUrl: '' };
		this.sync = this.el.components.sync;

		this.el.addEventListener('click', function () {
			if (_this.currentData.moreInfoUrl) altspace.open(_this.currentData.moreInfoUrl);
		});

		if (this.sync.isConnected) this.init2();else this.el.addEventListener('connected', this.init2.bind(this));
	},
	init2: function init2() {
		var _this2 = this;

		var applyData = debounce(function () {
			if (_this2.currentData.type === 'model-gltf') {
				// TODO: remove other types
				_this2.el.setAttribute('gltf-model', _this2.currentData.srcUrl);
			}
		}, 150);

		var typeRef = this.sync.dataRef.child('type'),
		    srcRef = this.sync.dataRef.child('srcUrl'),
		    moreInfoRef = this.sync.dataRef.child('moreInfoUrl');

		typeRef.on('value', function (snapshot) {
			if (!_this2.currentData.type) {
				_this2.currentData.type = snapshot.val();
				applyData();
			}
		});

		srcRef.on('value', function (snapshot) {
			if (!_this2.currentData.srcUrl) {
				_this2.currentData.srcUrl = snapshot.val();
				applyData();
			}
		});

		moreInfoRef.on('value', function (snapshot) {
			if (!_this2.currentData.moreInfoUrl) {
				_this2.currentData.moreInfoUrl = snapshot.val();
			}
		});
	}
});

AFRAME.registerComponent('if-mod', {
	schema: { type: 'string', default: '' },
	init: function init() {
		var syncSys = this.el.sceneEl.systems['sync-system'];
		var evaluateModStatus = function () {
			if (syncSys.userInfo.isModerator) this.el.setAttribute('mixin', this.data + ' ' + this.el.getAttribute('mixin'));
		}.bind(this);

		if (syncSys.isConnected) {
			evaluateModStatus();
		} else {
			this.el.sceneEl.addEventListener('connected', evaluateModStatus);
		}
	}
});

}());
//# sourceMappingURL=bundle.js.map
