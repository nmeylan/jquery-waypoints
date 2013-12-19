/*
 Initialy write with jQuery, to see the full doc : http://imakewebthings.com/jquery-waypoints
 Rewrite with prototype 1.7 by nmeylan.
 Nothing change except all $.waypoints functions calls. To call waypoints (with 'S') you 'll need to do like this:
 PrototypeWaypoint.waypoints...
 
 To call waypoint you'll need to use $ operator from prototype.
 */

var PrototypeWaypoint;
(function() {
    var __indexOf = [].indexOf || function(item) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this && this[i] === item)
                return i;
        }
        return -1;
    },
            __slice = [].slice;

    (function(root, factory) {
        if (typeof define === 'function' && define.amd) {
            return define('waypoints', ['prototype'], function($) {
                return factory($, root);
            });
        } else {
            return factory(root.jQuery, root);
        }
    })(this, function($, window) {
        var viewport, Context, Waypoint, allWaypoints, contextCounter, contextKey, contexts, isTouch, jQMethods, methods, resizeEvent, scrollEvent, waypointCounter, waypointKey, wp, wps;
        viewport = document.viewport;

        isTouch = __indexOf.call(window, 'ontouchstart') >= 0;
        allWaypoints = {
            horizontal: {},
            vertical: {}
        };
        contextCounter = 1;
        contexts = {};
        contextKey = 'waypoints-context-id';
        resizeEvent = 'resize';
        scrollEvent = 'scroll';
        waypointCounter = 1;
        waypointKey = 'waypoints-waypoint-ids';
        wp = 'waypoint';
        wps = 'waypoints';
        Context = (function() {
            function Context(windowElement) {

                this.windowElement = windowElement;
                this.element = windowElement;
                this.didResize = false;
                this.didScroll = false;
                this.id = 'context' + contextCounter++;
                var self = this;
                this.oldScroll = {
                    x: this.windowElement.scrollLeft,
                    y: this.windowElement.scrollTop
                };
                this.waypoints = {
                    horizontal: {},
                    vertical: {}
                };
                if (jQMethods.isWindow(this.windowElement)) {
                    this.windowElement.data = $H();
                    this.windowElement.data[contextKey] = this.id;
                } else {
                    this.windowElement.writeAttribute('data-' + contextKey, this.id)
                }
                contexts[this.id] = this;
                Event.observe(self.element, scrollEvent, function() {
                    var scrollHandler;

                    if (!(self.didScroll || isTouch)) {
                        self.didScroll = true;
                        scrollHandler = function() {
                            self.doScroll();
                            return self.didScroll = false;
                        };
                        return window.setTimeout(scrollHandler, PrototypeWaypoint.waypoints_settings.scrollThrottle);
                    }
                });
                Event.observe(self.element, resizeEvent, function() {
                    var resizeHandler;
                    if (!self.didResize) {
                        self.didResize = true;
                        resizeHandler = function() {
                            PrototypeWaypoint.waypoints('refresh');
                            return self.didResize = false;
                        };

                        return window.setTimeout(resizeHandler, PrototypeWaypoint.waypoints_settings.resizeThrottle);
                    }
                });
            }

            Context.prototype.doScroll = function() {
                var axes,
                        self = this;
                axes = {
                    horizontal: {
                        newScroll: this.element.scrollX != null ? this.element.scrollX : window.pageXOffset || jQMethods.getScrollXY()[0],
                        oldScroll: this.oldScroll.x,
                        forward: 'right',
                        backward: 'left'
                    },
                    vertical: {
                        newScroll: this.element.scrollY != null ? this.element.scrollY : window.pageYOffset || jQMethods.getScrollXY()[1],
                        oldScroll: this.oldScroll.y,
                        forward: 'down',
                        backward: 'up'
                    }
                };
                if (isTouch && (!axes.vertical.oldScroll || !axes.vertical.newScroll)) {
                    PrototypeWaypoint.waypoints('refresh');
                }

                $H(axes).each(function(axe) {
                    var direction, isForward, triggered;
                    var axis = axe.value;
                    var aKey = axe.key;
                    triggered = [];
                    isForward = axis.newScroll > axis.oldScroll;
                    direction = isForward ? axis.forward : axis.backward;
                    $H(self.waypoints[aKey]).each(function(point) {
                        var _ref, _ref1;
                        var wKey = point.key;
                        var waypoint = point.value;
                        if ((axis.oldScroll < (_ref = waypoint.offset) && _ref <= axis.newScroll)) {
                            return triggered.push(waypoint);
                        } else if ((axis.newScroll < (_ref1 = waypoint.offset) && _ref1 <= axis.oldScroll)) {
                            return triggered.push(waypoint);
                        }
                    });
                    triggered.sort(function(a, b) {
                        return a.offset - b.offset;
                    });
                    if (!isForward) {
                        triggered.reverse();
                    }

                    return triggered.each(function(waypoint, i) {
                        if (waypoint.options.continuous || i === triggered.length - 1) {
                            return waypoint.trigger([direction]);
                        }
                    });
                });

                return this.oldScroll = {
                    x: axes.horizontal.newScroll,
                    y: axes.vertical.newScroll
                };
            };

            Context.prototype.refresh = function() {
                var axes, cOffset, isWin,
                        self = this;


                isWin = jQMethods.isWindow(this.element);
                cOffset = this.windowElement.offset;
                this.doScroll();
                axes = {
                    horizontal: {
                        contextOffset: isWin ? 0 : this.windowElement.offsetLeft,
                        contextScroll: isWin ? 0 : this.oldScroll.x,
                        contextDimension: this.windowElement.width,
                        oldScroll: this.oldScroll.x,
                        forward: 'right',
                        backward: 'left',
                        offsetProp: 'left'
                    },
                    vertical: {
                        contextOffset: isWin ? 0 : this.windowElement.offsetTop,
                        contextScroll: isWin ? 0 : this.oldScroll.y,
                        contextDimension: isWin ? PrototypeWaypoint.waypoints('viewportHeight') : this.windowElement.height,
                        oldScroll: this.oldScroll.y,
                        forward: 'down',
                        backward: 'up',
                        offsetProp: 'top'
                    }
                };
                return $H(axes).each(function(axe) {
                    var aKey = axe.key;
                    var axis = axe.value;
                    return $H(self.waypoints[aKey]).each(function(elem) {
                        var adjustment, elementOffset, oldOffset, _ref, _ref1;
                        var i = elem.key;
                        var waypoint = elem.value;
                        adjustment = waypoint.options.offset;
                        oldOffset = waypoint.offset;
                        var offset = axis.offsetProp === 'left' ? waypoint.element.offsetLeft : waypoint.element.offsetTop;
                        elementOffset = jQMethods.isWindow(waypoint.element) ? 0 : offset;
                        if (jQMethods.isFunction(adjustment)) {
                            adjustment = adjustment.apply(waypoint.element);
                        } else if (typeof adjustment === 'string') {
                            adjustment = parseFloat(adjustment);
                            if (waypoint.options.offset.indexOf('%') > -1) {
                                adjustment = Math.ceil(axis.contextDimension * adjustment / 100);
                            }
                        }
                        waypoint.offset = elementOffset - axis.contextOffset + axis.contextScroll - adjustment;
                        if ((waypoint.options.onlyOnScroll && (oldOffset != null)) || !waypoint.enabled) {
                            return;
                        }
                        if (oldOffset !== null && (oldOffset < (_ref = axis.oldScroll) && _ref <= waypoint.offset)) {
                            return waypoint.trigger([axis.backward]);
                        } else if (oldOffset !== null && (oldOffset > (_ref1 = axis.oldScroll) && _ref1 >= waypoint.offset)) {
                            return waypoint.trigger([axis.forward]);
                        } else if (oldOffset === null && axis.oldScroll >= waypoint.offset) {
                            return waypoint.trigger([axis.forward]);
                        }
                    });
                });
            };

            Context.prototype.checkEmpty = function() {
                if (jQMethods.isEmptyObject(this.waypoints.horizontal) && jQMethods.isEmptyObject(this.waypoints.vertical)) {
                    Event.stopObserving(this.element, [resizeEvent, scrollEvent].join(' '));
                    return delete contexts[this.id];
                }
            };

            return Context;

        })();
        Waypoint = (function() {
            function Waypoint(element, context, options) {
                var idList, _ref;
                options = $H(Element.waypoint_defaults).merge(options);
                options = options.toObject();
                if (options.offset === 'bottom-in-view') {
                    options.offset = function() {
                        var contextHeight;
                        contextHeight = PrototypeWaypoint.waypoints('viewportHeight');
                        if (!jQMethods.isWindow(context.element)) {
                            contextHeight = context.window_element.getHeight();
                        }
                        return contextHeight - element.outerHeight();
                    };

                }
                this.element = element;
                this.axis = options.horizontal ? 'horizontal' : 'vertical';
                this.callback = options.handler;
                this.context = context;
                this.enabled = options.enabled;
                this.id = 'waypoints' + waypointCounter++;
                this.offset = null;
                this.options = options;
                context.waypoints[this.axis][this.id] = this;
                allWaypoints[this.axis][this.id] = this;
                idList = (_ref = this.element.readAttribute('data-' + waypointKey)) != null ? _ref : "";
                idList = this.id;
                this.element.writeAttribute('data-' + waypointKey, idList);
            }

            Waypoint.prototype.trigger = function(args) {

                if (!this.enabled) {
                    return;
                }
                if (this.callback != null) {
                    this.callback.apply(this.element, args);
                }
                if (this.options.triggerOnce) {
                    return this.destroy();
                }
            };

            Waypoint.prototype.disable = function() {
                return this.enabled = false;
            };

            Waypoint.prototype.enable = function() {
                this.context.refresh();
                return this.enabled = true;
            };

            Waypoint.prototype.destroy = function() {
                delete allWaypoints[this.axis][this.id];
                delete this.context.waypoints[this.axis][this.id];
                return this.context.checkEmpty();
            };

            Waypoint.getWaypointsByElement = function(element) {
                var all;
                var ids = [];
                var data = Prototype.Selector.extendElement(element).readAttribute('data-' + waypointKey);
                ids.push(data);
                if (!ids) {
                    return [];
                }
                all = $H(allWaypoints.horizontal).merge(allWaypoints.vertical);
                all = all.toObject();
                return ids.map(function(id) {
                    return all[id];
                });
            };

            return Waypoint;

        })();
        methods = {
            init: function(f, options) {
                var _ref;
                if (options == null) {
                    options = {};
                }
                if ((_ref = options.handler) == null) {
                    options.handler = f;
                }
                var selfElement, context, contextElement, _ref1;
                selfElement = this;
                contextElement = (_ref1 = options.context) != null ? _ref1 : Element.waypoint_defaults.context;
                if (!jQMethods.isWindow(contextElement)) {
                    contextElement = selfElement.getOffsetParent(contextElement);
                }
                
                contextElement = Prototype.Selector.extendElement(contextElement);
                
                if (jQMethods.isWindow(contextElement)) {
                    context = contextElement.data !== undefined ? contexts[contextElement.data[contextKey]] : undefined;
                } else {
                    context = contexts[contextElement.readAttribute('data-' + contextKey)];
                }
                
                if (!context) {
                    context = new Context(contextElement);
                }
                new Waypoint(selfElement, context, options);
                PrototypeWaypoint.waypoints('refresh');
                return this;
            },
            disable: function() {
                return methods._invoke(this, 'disable');
            },
            enable: function() {
                return methods._invoke(this, 'enable');
            },
            destroy: function() {
                return methods._invoke(this, 'destroy');
            },
            prev: function(axis, selector) {
                return methods._traverse.call(this, axis, selector, function(stack, index, waypoints) {
                    if (index > 0) {
                        return stack.push(waypoints[index - 1]);
                    }
                });
            },
            next: function(axis, selector) {
                return methods._traverse.call(this, axis, selector, function(stack, index, waypoints) {
                    if (index < waypoints.length - 1) {
                        return stack.push(waypoints[index + 1]);
                    }
                });
            },
            _traverse: function(axis, selector, push) {
                var stack, waypoints;

                if (axis == null) {
                    axis = 'vertical';
                }
                if (selector == null) {
                    selector = window;
                }
                waypoints = jQMethods.aggregate(selector);
                stack = [];
                var self_element = Prototype.Selector.extendElement(this);
                var index;

                index = waypoints[axis].indexOf(self_element);

                push(stack, index, waypoints[axis]);
                return stack;
            },
            _invoke: function(window_elements, method) {
                var waypoints;
                waypoints = Waypoint.getWaypointsByElement(window_elements);

                return waypoints.each(function(waypoint) {
                    if (waypoint !== undefined)
                        waypoint[method]();
                    return true;
                });
                return this;
            }
        };
        Element.addMethods({
            waypoint: function(element) {
                var args;
                var self_element = arguments[0];
                method = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];

                if (methods[method]) {
                    return methods[method].apply(self_element, args);
                } else if (Object.isFunction(method)) {
                    arguments = $H(arguments);
                    arguments.unset(0);
                    arguments = arguments.toObject();
                    if (arguments[2] === undefined)
                        arguments[2] = {}
                    arguments[2]['handler'] = method;
                    var ary = [];
                    ary.push(method);
                    ary.push(arguments[2]);
                    return methods.init.apply(self_element, ary);
                } else if (jQMethods.isPlainObject(method)) {
                    return methods.init.apply(self_element, [null, method]);
                } else if (!method) {
                    return new Error("Prototype Waypoints needs a callback function or handler option.");
                } else {
                    return new Error("The " + method + " method does not exist in prototype Waypoints.");
                }
            },
            waypoint_defaults: {
                context: window,
                continuous: true,
                enabled: true,
                horizontal: false,
                offset: 0,
                triggerOnce: false
            },
            outerHeight: function(element) {
                var $element = Prototype.Selector.extendElement(element);
                var layout = $element.getLayout();
                return layout.get('padding-box-height');
            }
        });

        jQMethods = {
            refresh: function() {
                return $H(contexts).each(function(context) {
                    return context.value.refresh();
                });
            },
            viewportHeight: function() {
                var _ref;
                return (_ref = window.innerHeight) != null ? _ref : document.viewport.getHeight();
            },
            aggregate: function(contextSelector) {
                var collection, waypoints;
                collection = allWaypoints;
                if (contextSelector) {
                    if (jQMethods.isWindow(contextSelector)) {
                        var contextElement = Prototype.Selector.extendElement(contextSelector);
                        var context = contextElement.data !== undefined ? contexts[contextElement.data[contextKey]] : undefined;
                    } else {
                        var contextElement = $$(contextSelector);
                        var context = contexts[contextElement[0].readAttribute('data-' + contextKey)];
                    }
                    collection = context != null ? context.waypoints : void 0;

                }
                if (!collection) {
                    return [];
                }
                waypoints = {
                    horizontal: [],
                    vertical: []
                };
                $H(waypoints).each(function(axe) {
                    var axis = axe.key;
                    var arr = axe.value;
                    $H(collection[axis]).each(function(point) {
                        var waypoint = point.value;
                        return arr.push(waypoint);
                    });
                    arr.sort(function(a, b) {
                        return a.offset - b.offset;
                    });
                    waypoints[axis] = arr.map(function(waypoint) {
                        return waypoint.element;
                    });
                    return waypoints[axis] = waypoints[axis].uniq();
                });
                return waypoints;
            },
            above: function(contextSelector) {
                if (contextSelector == null) {
                    contextSelector = window;
                }
                return jQMethods._filter(contextSelector, 'vertical', function(context, waypoint) {
                    return waypoint.offset <= context.oldScroll.y;
                });
            },
            below: function(contextSelector) {
                if (contextSelector == null) {
                    contextSelector = window;
                }
                return jQMethods._filter(contextSelector, 'vertical', function(context, waypoint) {
                    return waypoint.offset > context.oldScroll.y;
                });
            },
            left: function(contextSelector) {
                if (contextSelector == null) {
                    contextSelector = window;
                }
                return jQMethods._filter(contextSelector, 'horizontal', function(context, waypoint) {
                    return waypoint.offset <= context.oldScroll.x;
                });
            },
            right: function(contextSelector) {
                if (contextSelector == null) {
                    contextSelector = window;
                }
                return jQMethods._filter(contextSelector, 'horizontal', function(context, waypoint) {
                    return waypoint.offset > context.oldScroll.x;
                });
            },
            enable: function() {
                return jQMethods._invoke('enable');
            },
            disable: function() {
                return jQMethods._invoke('disable');
            },
            destroy: function() {
                return jQMethods._invoke('destroy');
            },
            extendFn: function(methodName, f) {
                return methods[methodName] = f;
            },
            _invoke: function(method) {
                var waypoints;
                waypoints = $H(allWaypoints.horizontal).merge(allWaypoints.vertical);

                return waypoints.each(function(point) {
                    waypoint = point.value;
                    waypoint[method]();
                    return true;
                });
            },
            _filter: function(selector, axis, test) {
                var context, waypoints;
                var contextElement = Prototype.Selector.extendElement(selector);
                context = contextElement.data !== undefined ? contextElement.data[contextKey] : undefined;
                
                if (!context) {
                    return [];
                } else
                    context = contexts[context];
                
                waypoints = [];
                $H(context.waypoints[axis]).each(function(point) {
                    var waypoint = point.value;
                    if (test(context, waypoint)) {
                        return waypoints.push(waypoint);
                    }
                });
                waypoints.sort(function(a, b) {
                    return a.offset - b.offset;
                });
                return waypoints.map(function(waypoint) {
                    return waypoint.element;
                });
            },
            isPlainObject: function(o) {
                return typeof o == 'object' && o.constructor == Object;
            },
            isWindow: function(o) {
                return o && typeof o === "object" && "setInterval" in o;
            },
            isFunction: function(functionToCheck) {
                var getType = {};
                return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
            }, 
            isEmptyObject: function(obj) {
                for (var name in obj) {
                    return false;
                }
                return true;
            },
            isArray: function(array){
                return (Object.prototype.toString.call(array) === '[object Array]');
            },
            getScrollXY: function() {
                var scrOfX = 0, scrOfY = 0;
                if (typeof (window.pageYOffset) == 'number') {
                    //Netscape compliant
                    scrOfY = window.pageYOffset;
                    scrOfX = window.pageXOffset;
                } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
                    //DOM compliant
                    scrOfY = document.body.scrollTop;
                    scrOfX = document.body.scrollLeft;
                } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
                    //IE6 standards compliant mode
                    scrOfY = document.documentElement.scrollTop;
                    scrOfX = document.documentElement.scrollLeft;
                }
                return [scrOfX, scrOfY];
            }
        };
        PrototypeWaypoint = function() {
        }
        Function.prototype.waypoints = function() {
            var args, method;

            method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
            if (jQMethods[method]) {
                return jQMethods[method].apply(null, args);
            } else {
                return jQMethods.aggregate.call(null, method);
            }
        }
        Function.prototype.waypoints_settings = {
            resizeThrottle: 100,
            scrollThrottle: 30
        }
        Function.prototype.isPlainObject = function(object){
            return jQMethods.isPlainObject(object);
        }
        Function.prototype.isArray = function(array){
            return jQMethods.isArray(array);
        }
        return Event.observe(window, 'load', function() {
            return PrototypeWaypoint.waypoints('refresh');
        });
    });
}).call(this);
