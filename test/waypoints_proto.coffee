#
#    Initialy write with jQuery, to see the full doc : http://imakewebthings.com/jquery-waypoints
#    Rewrite with prototype 1.7 by nmeylan.
#    Nothing change except all $.waypoints functions calls. To call waypoints (with 'S') you 'll need to do like this:
#    PrototypeWaypoint.waypoints...
#    
#    To call waypoint you'll need to use $ operator from prototype.
# 
PrototypeWaypoint = undefined

#TODO Correct here

#TODO correct here
(->
  __indexOf_ = [].indexOf or (item) ->
    i = 0
    l = @length

    while i < l
      return i  if i of this and this[i] is item
      i++
    -1

  __slice_ = [].slice
  ((root, factory) ->
    if typeof define is "function" and define.amd
      define "waypoints", ["prototype"], ($) ->
        factory $, root

    else
      factory root.jQuery, root
  ) this, ($, window) ->
    viewport = undefined
    Context = undefined
    Waypoint = undefined
    allWaypoints = undefined
    contextCounter = undefined
    contextKey = undefined
    contexts = undefined
    isTouch = undefined
    jQMethods = undefined
    methods = undefined
    resizeEvent = undefined
    scrollEvent = undefined
    waypointCounter = undefined
    waypointKey = undefined
    wp = undefined
    wps = undefined
    viewport = document.viewport
    isTouch = __indexOf_.call(window, "ontouchstart") >= 0
    allWaypoints =
      horizontal: {}
      vertical: {}

    contextCounter = 1
    contexts = {}
    contextKey = "waypoints-context-id"
    resizeEvent = "resize"
    scrollEvent = "scroll"
    waypointCounter = 1
    waypointKey = "waypoints-waypoint-ids"
    wp = "waypoint"
    wps = "waypoints"
    Context = (->
      Context = (window_element) ->
        @window_element = window_element
        @element = window_element
        @didResize = false
        @didScroll = false
        @id = "context" + contextCounter++
        self = this
        @oldScroll =
          x: @window_element.scrollLeft
          y: @window_element.scrollTop

        @waypoints =
          horizontal: {}
          vertical: {}

        @window_element.data = $H()
        @window_element.data[contextKey] = @id
        contexts[@id] = this
        Event.observe self.element, scrollEvent, ->
          scrollHandler = undefined
          unless self.didScroll or isTouch
            self.didScroll = true
            scrollHandler = ->
              self.doScroll()
              self.didScroll = false

            window.setTimeout scrollHandler, PrototypeWaypoint.waypoints_settings.scrollThrottle

        Event.observe self.element, resizeEvent, ->
          resizeHandler = undefined
          unless self.didResize
            self.didResize = true
            resizeHandler = ->
              PrototypeWaypoint.waypoints "refresh"
              self.didResize = false

            window.setTimeout resizeHandler, PrototypeWaypoint.waypoints_settings.resizeThrottle

      Context::doScroll = ->
        axes = undefined
        self = this
        axes =
          horizontal:
            newScroll: @element.scrollX
            oldScroll: @oldScroll.x
            forward: "right"
            backward: "left"

          vertical:
            newScroll: @element.scrollY
            oldScroll: @oldScroll.y
            forward: "down"
            backward: "up"

        PrototypeWaypoint.waypoints "refresh"  if isTouch and (not axes.vertical.oldScroll or not axes.vertical.newScroll)
        $H(axes).each (axe) ->
          direction = undefined
          isForward = undefined
          triggered = undefined
          axis = axe.value
          aKey = axe.key
          triggered = []
          isForward = axis.newScroll > axis.oldScroll
          direction = (if isForward then axis.forward else axis.backward)
          $H(self.waypoints[aKey]).each (point) ->
            _ref = undefined
            _ref1 = undefined
            wKey = point.key
            waypoint = point.value
            if axis.oldScroll < (_ref = waypoint.offset) and _ref <= axis.newScroll
              triggered.push waypoint
            else triggered.push waypoint  if axis.newScroll < (_ref1 = waypoint.offset) and _ref1 <= axis.oldScroll

          triggered.sort (a, b) ->
            a.offset - b.offset

          triggered.reverse()  unless isForward
          triggered.each (waypoint, i) ->
            waypoint.trigger [direction]  if waypoint.options.continuous or i is triggered.length - 1


        @oldScroll =
          x: axes.horizontal.newScroll
          y: axes.vertical.newScroll

      Context::refresh = ->
        axes = undefined
        cOffset = undefined
        isWin = undefined
        self = this
        isWin = jQMethods.isWindow(@element)
        cOffset = @window_element.offset
        @doScroll()
        axes =
          horizontal:
            contextOffset: (if isWin then 0 else cOffset.left)
            contextScroll: (if isWin then 0 else @oldScroll.x)
            contextDimension: @window_element.width
            oldScroll: @oldScroll.x
            forward: "right"
            backward: "left"
            offsetProp: "left"

          vertical:
            contextOffset: (if isWin then 0 else cOffset.top)
            contextScroll: (if isWin then 0 else @oldScroll.y)
            contextDimension: (if isWin then PrototypeWaypoint.waypoints("viewportHeight") else @window_element.height)
            oldScroll: @oldScroll.y
            forward: "down"
            backward: "up"
            offsetProp: "top"

        $H(axes).each (axe) ->
          aKey = axe.key
          axis = axe.value
          $H(self.waypoints[aKey]).each (elem) ->
            adjustment = undefined
            elementOffset = undefined
            oldOffset = undefined
            _ref = undefined
            _ref1 = undefined
            i = elem.key
            waypoint = elem.value
            adjustment = waypoint.options.offset
            oldOffset = waypoint.offset
            offset = (if axis.offsetProp is "left" then waypoint.element.offsetLeft else waypoint.element.offsetTop)
            elementOffset = (if jQMethods.isWindow(waypoint.element) then 0 else offset)
            if jQMethods.isFunction(adjustment)
              adjustment = adjustment.apply(waypoint.element)
            else if typeof adjustment is "string"
              adjustment = parseFloat(adjustment)
              adjustment = Math.ceil(axis.contextDimension * adjustment / 100)  if waypoint.options.offset.indexOf("%") > -1
            waypoint.offset = elementOffset - axis.contextOffset + axis.contextScroll - adjustment
            return  if (waypoint.options.onlyOnScroll and (oldOffset?)) or not waypoint.enabled
            if oldOffset isnt null and (oldOffset < (_ref = axis.oldScroll) and _ref <= waypoint.offset)
              waypoint.trigger [axis.backward]
            else if oldOffset isnt null and (oldOffset > (_ref1 = axis.oldScroll) and _ref1 >= waypoint.offset)
              waypoint.trigger [axis.forward]
            else waypoint.trigger [axis.forward]  if oldOffset is null and axis.oldScroll >= waypoint.offset



      Context::checkEmpty = ->
        if jQMethods.isEmptyObject(@waypoints.horizontal) and jQMethods.isEmptyObject(@waypoints.vertical)
          Event.stopObserving @element, [resizeEvent, scrollEvent].join(" ")
          delete contexts[@id]

      Context
    )()
    Waypoint = (->
      Waypoint = (element, context, options) ->
        idList = undefined
        _ref = undefined
        options = $H(Element.waypoint_defaults).merge(options)
        options = options.toObject()
        if options.offset is "bottom-in-view"
          options.offset = ->
            contextHeight = undefined
            contextHeight = PrototypeWaypoint.waypoints("viewportHeight")
            contextHeight = context.window_element.height()  unless jQMethods.isWindow(context.element)
            contextHeight - element.outerHeight()
        @element = element
        @axis = (if options.horizontal then "horizontal" else "vertical")
        @callback = options.handler
        @context = context
        @enabled = options.enabled
        @id = "waypoints" + waypointCounter++
        @offset = null
        @options = options
        context.waypoints[@axis][@id] = this
        allWaypoints[@axis][@id] = this
        idList = (if (_ref = @element.readAttribute("data-" + waypointKey))? then _ref else [])
        idList.push @id
        @element.writeAttribute "data-" + waypointKey, idList
      Waypoint::trigger = (args) ->
        return  unless @enabled
        @callback.apply @element, args  if @callback?
        @destroy()  if @options.triggerOnce

      Waypoint::disable = ->
        @enabled = false

      Waypoint::enable = ->
        @context.refresh()
        @enabled = true

      Waypoint::destroy = ->
        delete allWaypoints[@axis][@id]

        delete @context.waypoints[@axis][@id]

        @context.checkEmpty()

      Waypoint.getWaypointsByElement = (element) ->
        all = undefined
        ids = []
        data = Prototype.Selector.extendElement(element).readAttribute("data" + waypointKey)
        ids.push data
        return []  unless ids
        all = $H(allWaypoints.horizontal).merge(allWaypoints.vertical)
        all = all.toObject()
        ids.map (id) ->
          all[id]


      Waypoint
    )()
    methods =
      init: (f, options) ->
        _ref = undefined
        options = {}  unless options?
        options.handler = f  unless (_ref = options.handler)?
        self_element = undefined
        context = undefined
        contextElement = undefined
        _ref1 = undefined
        self_element = this
        contextElement = (if (_ref1 = options.context)? then _ref1 else Element.waypoint_defaults.context)
        contextElement = self_element.getOffsetParent(contextElement)  unless jQMethods.isWindow(contextElement)
        contextElement = Prototype.Selector.extendElement(contextElement)
        context = (if contextElement.data isnt `undefined` then contexts[contextElement.data[contextKey]] else `undefined`)
        context = new Context(contextElement)  unless context
        new Waypoint(self_element, context, options)

      disable: ->
        methods._invoke this, "disable"

      enable: ->
        methods._invoke this, "enable"

      destroy: ->
        methods._invoke this, "destroy"

      prev: (axis, selector) ->
        methods._traverse.call this, axis, selector, (stack, index, waypoints) ->
          stack.push waypoints[index - 1]  if index > 0


      next: (axis, selector) ->
        methods._traverse.call this, axis, selector, (stack, index, waypoints) ->
          stack.push waypoints[index + 1]  if index < waypoints.length - 1


      _traverse: (axis, selector, push) ->
        stack = undefined
        waypoints = undefined
        axis = "vertical"  unless axis?
        selector = window  unless selector?
        waypoints = jQMethods.aggregate(selector)
        stack = []
        self_element = Prototype.Selector.extendElement(this)
        index = undefined
        index = waypoints[axis].indexOf(self_element)
        push stack, index, waypoints[axis]
        stack

      _invoke: (window_elements, method) ->
        waypoints = undefined
        waypoints = Waypoint.getWaypointsByElement(window_elements)
        return waypoints.each((waypoint) ->
          waypoint[method]()
          true
        )
        this

    Element.addMethods
      waypoint: (element) ->
        args = undefined
        self_element = arguments_[0]
        method = arguments_[1]
        args = (if 3 <= arguments_.length then __slice_.call(arguments_, 2) else [])

        if methods[method]
          methods[method].apply self_element, args
        else if Object.isFunction(method)
          methods.init.apply self_element, arguments_
        else if jQMethods.isPlainObject(method)
          methods.init.apply self_element, [null, method]
        else unless method
          $.error "Prototype Waypoints needs a callback function or handler option."
        else
          $.error "The " + method + " method does not exist in prototype Waypoints."

      waypoint_defaults:
        context: window
        continuous: true
        enabled: true
        horizontal: false
        offset: 0
        triggerOnce: false

      outerHeight: (element) ->
        $element = Prototype.Selector.extendElement(element)
        layout = $element.getLayout()
        layout.get "padding-box-height"

    jQMethods =
      refresh: ->
        $H(contexts).each (context) ->
          context.value.refresh()


      viewportHeight: ->
        _ref = undefined
        (if (_ref = window.innerHeight)? then _ref else viewport.getDimensions().height())

      aggregate: (contextSelector) ->
        collection = undefined
        waypoints = undefined
        collection = allWaypoints
        if contextSelector
          contextElement = Prototype.Selector.extendElement(contextSelector)
          context = (if contextElement.data isnt `undefined` then contexts[contextElement.data[contextKey]] else `undefined`)
          collection = (if context? then context.waypoints else undefined)
        return []  unless collection
        waypoints =
          horizontal: []
          vertical: []

        $H(waypoints).each (axe) ->
          axis = axe.key
          arr = axe.value
          $H(collection[axis]).each (point) ->
            waypoint = point.value
            arr.push waypoint

          arr.sort (a, b) ->
            a.offset - b.offset

          waypoints[axis] = arr.map((waypoint) ->
            waypoint.element
          )
          waypoints[axis] = waypoints[axis].uniq()

        waypoints

      above: (contextSelector) ->
        contextSelector = window  unless contextSelector?
        jQMethods._filter contextSelector, "vertical", (context, waypoint) ->
          waypoint.offset <= context.oldScroll.y


      below: (contextSelector) ->
        contextSelector = window  unless contextSelector?
        jQMethods._filter contextSelector, "vertical", (context, waypoint) ->
          waypoint.offset > context.oldScroll.y


      left: (contextSelector) ->
        contextSelector = window  unless contextSelector?
        jQMethods._filter contextSelector, "horizontal", (context, waypoint) ->
          waypoint.offset <= context.oldScroll.x


      right: (contextSelector) ->
        contextSelector = window  unless contextSelector?
        jQMethods._filter contextSelector, "horizontal", (context, waypoint) ->
          waypoint.offset > context.oldScroll.x


      enable: ->
        jQMethods._invoke "enable"

      disable: ->
        jQMethods._invoke "disable"

      destroy: ->
        jQMethods._invoke "destroy"

      extendFn: (methodName, f) ->
        methods[methodName] = f

      _invoke: (method) ->
        waypoints = undefined
        waypoints = $H(allWaypoints.horizontal).merge(allWaypoints.vertical)
        waypoints.each (point) ->
          waypoint = point.value
          waypoint[method]()
          true


      _filter: (selector, axis, test) ->
        context = undefined
        waypoints = undefined
        contextElement = Prototype.Selector.extendElement(selector)
        context = (if contextElement.data isnt `undefined` then contextElement.data[contextKey] else `undefined`)
        unless context
          return []
        else
          context = contexts[context]
        waypoints = []
        $H(context.waypoints[axis]).each (point) ->
          waypoint = point.value
          waypoints.push waypoint  if test(context, waypoint)

        waypoints.sort (a, b) ->
          a.offset - b.offset

        waypoints.map (waypoint) ->
          waypoint.element


      isPlainObject: (o) ->
        typeof o is "object" and o.constructor is Object

      isWindow: (o) ->
        o and typeof o is "object" and "setInterval" of o

      isFunction: (functionToCheck) ->
        getType = {}
        functionToCheck and getType.toString.call(functionToCheck) is "[object Function]"

      isEmptyObject: (obj) ->
        for name of obj
          return false
        true

    PrototypeWaypoint = ->

    Function::waypoints = ->
      args = undefined
      method = undefined
      method = arguments_[0]
      args = (if 2 <= arguments_.length then __slice_.call(arguments_, 1) else [])

      if jQMethods[method]
        jQMethods[method].apply null, args
      else
        jQMethods.aggregate.call null, method

    Function::waypoints_settings =
      resizeThrottle: 100
      scrollThrottle: 30

    Event.observe window, "load", ->
      PrototypeWaypoint.waypoints "refresh"


).call this