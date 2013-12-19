/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var standardWait;

PrototypeWaypoint.waypoints_settings.scrollThrottle = 10;

PrototypeWaypoint.waypoints_settings.resizeThrottle = 20;

standardWait = 50;

describe('Prototype Waypoints', function() {
    var $e, $se, hit;
    hit = $se = $e = null;
    beforeEach(function() {
        loadFixtures('standard.html');
        $se = window;
        return hit = false;
    });
    describe('#waypoint()', function() {
        return it('errors out', function() {
            var fn;
            fn = function() {
                return $('same1').waypoint();
            };
            return expect(fn).toThrow(PrototypeWaypoint.waypoints_errors);
        });
    });
    describe('#waypoint(callback)', function() {
        var currentDirection;
        currentDirection = null;
        beforeEach(function() {
            currentDirection = null;
            return $e = $('same1').waypoint({handler: function(direction) {
                    currentDirection = direction;
                    return hit = true;
                }});
        });
        it('creates a waypoint', function() {
            return expect(PrototypeWaypoint.waypoints().vertical.length).toEqual(1);
        });
        it('triggers the callback', function() {
            runs(function() {
                return $se.scrollTop($e.offsetTop);
            });
            waits(standardWait);
            return runs(function() {
                return expect(hit).toBeTruthy();
            });
        });
        it('uses the default offset', function() {
            runs(function() {
                $e.offsetTop -= 1;
                return $e.scrollTo();
            });
            waits(standardWait);
            runs(function() {
                expect(hit).toBeFalsy();
                return $e.scrollTo();
            });
            waits(standardWait);
            return runs(function() {
                return expect(hit).toBeTruthy();
            });
        });
        return it('passes correct directions', function() {
            runs(function() {
                return $e.scrollTo();
            });
            waits(standardWait);
            runs(function() {
                expect(currentDirection).toEqual('down');
                $e.offsetTop -= 1;
                return $e.scrollTo();
            });
            waits(standardWait);
            return runs(function() {
                return expect(currentDirection).toEqual('up');
            });
        });
    });
    /*
     describe('#waypoint(options)', function() {
     beforeEach(function() {
     return $e = $('#same1');
     });
     it('creates a waypoint', function() {
     $e.waypoint({
     offset: 1,
     triggerOnce: true
     });
     return expect($.waypoints().vertical.length).toEqual(1);
     });
     it('respects a px offset', function() {
     runs(function() {
     $e.waypoint({
     offset: 50,
     handler: function() {
     return hit = true;
     }
     });
     return $se.scrollTop($e.offset().top - 51);
     });
     waits(standardWait);
     runs(function() {
     expect(hit).toBeFalsy();
     return $se.scrollTop($e.offset().top - 50);
     });
     waits(standardWait);
     return runs(function() {
     return expect(hit).toBeTruthy();
     });
     });
     it('respects a % offset', function() {
     var pos;
     pos = null;
     runs(function() {
     $e.waypoint({
     offset: '37%',
     handler: function() {
     return hit = true;
     }
     });
     pos = $e.offset().top - $.waypoints('viewportHeight') * .37 - 1;
     return $se.scrollTop(pos);
     });
     waits(standardWait);
     runs(function() {
     expect(hit).toBeFalsy();
     return $se.scrollTop(pos + 1);
     });
     waits(standardWait);
     return runs(function() {
     return expect(hit).toBeTruthy();
     });
     });
     it('respects a function offset', function() {
     runs(function() {
     $e.waypoint({
     offset: function() {
     return $(this).height() * -1;
     },
     handler: function() {
     return hit = true;
     }
     });
     return $se.scrollTop($e.offset().top + $e.height() - 1);
     });
     waits(standardWait);
     runs(function() {
     expect(hit).toBeFalsy();
     return $se.scrollTop($e.offset().top + $e.height());
     });
     waits(standardWait);
     return runs(function() {
     return expect(hit).toBeTruthy();
     });
     });
     it('respects the bottom-in-view function alias', function() {
     var inview;
     inview = $e.offset().top - $.waypoints('viewportHeight') + $e.outerHeight();
     runs(function() {
     $e.waypoint({
     offset: 'bottom-in-view',
     handler: function() {
     return hit = true;
     }
     });
     return $se.scrollTop(inview - 1);
     });
     waits(standardWait);
     runs(function() {
     expect(hit).toBeFalsy();
     return $se.scrollTop(inview);
     });
     waits(standardWait);
     return runs(function() {
     return expect(hit).toBeTruthy();
     });
     });
     it('destroys the waypoint if triggerOnce is true', function() {
     runs(function() {
     $e.waypoint({
     triggerOnce: true
     });
     return $se.scrollTop($e.offset().top);
     });
     waits(standardWait);
     return runs(function() {
     return expect($.waypoints().length).toBeFalsy();
     });
     });
     it('triggers if continuous is true and waypoint is not last', function() {
     var $f, $g, hitcount;
     $f = $('#near1');
     $g = $('#near2');
     hitcount = 0;
     runs(function() {
     $e.add($f).add($g).waypoint(function() {
     return hitcount++;
     });
     return $se.scrollTop($g.offset().top);
     });
     waits(standardWait);
     return runs(function() {
     return expect(hitcount).toEqual(3);
     });
     });
     it('does not trigger if continuous false, waypoint not last', function() {
     var $f, $g, hitcount;
     $f = $('#near1');
     $g = $('#near2');
     hitcount = 0;
     runs(function() {
     var callback, options;
     callback = function() {
     return hitcount++;
     };
     options = {
     continuous: false
     };
     $e.add($g).waypoint(callback);
     $f.waypoint(callback, options);
     return $se.scrollTop($g.offset().top);
     });
     waits(standardWait);
     return runs(function() {
     return expect(hitcount).toEqual(2);
     });
     });
     it('triggers if continuous is false, waypoint is last', function() {
     var $f, $g, hitcount;
     $f = $('#near1');
     $g = $('#near2');
     hitcount = 0;
     runs(function() {
     var callback, options;
     callback = function() {
     return hitcount++;
     };
     options = {
     continuous: false
     };
     $e.add($f).waypoint(callback);
     $g.waypoint(callback, options);
     return $se.scrollTop($g.offset().top);
     });
     waits(standardWait);
     return runs(function() {
     return expect(hitcount).toEqual(3);
     });
     });
     return it('uses the handler option if provided', function() {
     var hitcount;
     hitcount = 0;
     runs(function() {
     $e.waypoint({
     handler: function(dir) {
     return hitcount++;
     }
     });
     return $se.scrollTop($e.offset().top);
     });
     waits(standardWait);
     return runs(function() {
     return expect(hitcount).toEqual(1);
     });
     });
     });
     describe('#waypoint(callback, options)', function() {
     beforeEach(function() {
     var callback, options;
     callback = function() {
     return hit = true;
     };
     options = {
     offset: -1
     };
     return $e = $('#same1').waypoint(callback, options);
     });
     it('creates a waypoint', function() {
     return expect($.waypoints().vertical.length).toEqual(1);
     });
     it('respects options', function() {
     runs(function() {
     return $se.scrollTop($e.offset().top);
     });
     waits(standardWait);
     runs(function() {
     expect(hit).toBeFalsy();
     return $se.scrollTop($e.offset().top + 1);
     });
     waits(standardWait);
     return runs(function() {
     return expect(hit).toBeTruthy();
     });
     });
     return it('fires the callback', function() {
     runs(function() {
     return $se.scrollTop($e.offset().top + 1);
     });
     waits(standardWait);
     return runs(function() {
     return expect(hit).toBeTruthy();
     });
     });
     });
     describe('#waypoint("disable")', function() {
     beforeEach(function() {
     $e = $('#same1').waypoint(function() {
     return hit = true;
     });
     return $e.waypoint('disable');
     });
     return it('disables callback triggers', function() {
     runs(function() {
     return $se.scrollTop($e.offset().top);
     });
     waits(standardWait);
     return runs(function() {
     return expect(hit).toBeFalsy();
     });
     });
     });
     describe('.waypoint("enable")', function() {
     beforeEach(function() {
     $e = $('#same1').waypoint(function() {
     return hit = true;
     });
     $e.waypoint('disable');
     return $e.waypoint('enable');
     });
     return it('enables callback triggers', function() {
     runs(function() {
     return $se.scrollTop($e.offset().top);
     });
     waits(standardWait);
     return runs(function() {
     return expect(hit).toBeTruthy();
     });
     });
     });
     describe('#waypoint("destroy")', function() {
     beforeEach(function() {
     $e = $('#same1').waypoint(function() {
     return hit = true;
     });
     return $e.waypoint('destroy');
     });
     it('removes waypoint from list of waypoints', function() {
     return expect($.waypoints().length).toBeFalsy();
     });
     it('no longer triggers callback', function() {
     runs(function() {
     return $se.scrollTop($e.offset().top);
     });
     waits(standardWait);
     return runs(function() {
     return expect(hit).toBeFalsy();
     });
     });
     return it('does not preserve callbacks if .waypoint recalled', function() {
     runs(function() {
     $e.waypoint({});
     return $se.scrollTop($e.offset().top);
     });
     waits(standardWait);
     return runs(function() {
     return expect(hit).toBeFalsy();
     });
     });
     });
     describe('#waypoint("prev")', function() {
     it('returns jQuery object containing previous waypoint', function() {
     var $f;
     $e = $('#same1');
     $f = $('#near1');
     $e.add($f).waypoint({});
     return expect($f.waypoint('prev')[0]).toEqual($e[0]);
     });
     return it('can be used in a non-window context', function() {
     var $f;
     $e = $('#inner1');
     $f = $('#inner2');
     $e.add($f).waypoint({
     context: '#bottom'
     });
     return expect($f.waypoint('prev', 'vertical', '#bottom')[0]).toEqual($e[0]);
     });
     });
     describe('#waypoint("next")', function() {
     return it('returns jQuery object containing next waypoint', function() {
     var $f;
     $e = $('#same1');
     $f = $('#near1');
     $e.add($f).waypoint({});
     return expect($e.waypoint('next')[0]).toEqual($f[0]);
     });
     });
     describe('jQuery#waypoints()', function() {
     it('starts as an empty array for each axis', function() {
     expect($.waypoints().vertical.length).toBeFalsy();
     expect($.waypoints().horizontal.length).toBeFalsy();
     expect($.isPlainObject($.waypoints())).toBeTruthy();
     expect($.isArray($.waypoints().horizontal)).toBeTruthy();
     return expect($.isArray($.waypoints().vertical)).toBeTruthy();
     });
     it('returns waypoint elements', function() {
     $e = $('#same1').waypoint({});
     return expect($.waypoints().vertical[0]).toEqual($e[0]);
     });
     it('does not blow up with multiple waypoint', function() {
     $e = $('.sameposition, #top').waypoint({});
     $e = $e.add($('#near1').waypoint({}));
     expect($.waypoints().vertical.length).toEqual(4);
     return expect($.waypoints().vertical[0]).toEqual($('#top')[0]);
     });
     it('returns horizontal elements', function() {
     $e = $('#same1').waypoint({
     horizontal: true
     });
     return expect($.waypoints().horizontal[0]).toEqual($e[0]);
     });
     return describe('Directional filters', function() {
     var $f;
     $f = null;
     beforeEach(function() {
     $e = $('#same1');
     return $f = $('#near1');
     });
     describe('above', function() {
     return it('returns waypoints only above the current scroll position', function() {
     runs(function() {
     $e.add($f).waypoint({});
     return $se.scrollTop(1500);
     });
     waits(standardWait);
     return runs(function() {
     return expect($.waypoints('above')).toEqual([$e[0]]);
     });
     });
     });
     describe('below', function() {
     return it('returns waypoints only below the current scroll position', function() {
     runs(function() {
     $e.add($f).waypoint({});
     return $se.scrollTop(1500);
     });
     waits(standardWait);
     return runs(function() {
     return expect($.waypoints('below')).toEqual([$f[0]]);
     });
     });
     });
     describe('left', function() {
     return it('returns waypoints only left of the current scroll position', function() {
     runs(function() {
     $e.add($f).waypoint({
     horizontal: true
     });
     return $se.scrollLeft(1500);
     });
     waits(standardWait);
     return runs(function() {
     return expect($.waypoints('left')).toEqual([$e[0]]);
     });
     });
     });
     return describe('right', function() {
     return it('returns waypoints only right of the current scroll position', function() {
     runs(function() {
     $e.add($f).waypoint({
     horizontal: true
     });
     return $se.scrollLeft(1500);
     });
     waits(standardWait);
     return runs(function() {
     return expect($.waypoints('right')).toEqual([$f[0]]);
     });
     });
     });
     });
     });
     describe('jQuery#waypoints("refresh")', function() {
     var currentDirection;
     currentDirection = null;
     beforeEach(function() {
     currentDirection = null;
     return $e = $('#same1').waypoint(function(direction) {
     return currentDirection = direction;
     });
     });
     it('triggers callback if refresh crosses scroll', function() {
     runs(function() {
     return $se.scrollTop($e.offset().top - 1);
     });
     waits(standardWait);
     return runs(function() {
     $e.css('top', ($e.offset().top - 50) + 'px');
     $.waypoints('refresh');
     expect(currentDirection).toEqual('down');
     expect(currentDirection).not.toEqual('up');
     $e.css('top', $e.offset().top + 50 + 'px');
     $.waypoints('refresh');
     expect(currentDirection).not.toEqual('down');
     return expect(currentDirection).toEqual('up');
     });
     });
     it('does not trigger callback if onlyOnScroll true', function() {
     var $f;
     $f = null;
     runs(function() {
     $f = $('#same2').waypoint({
     onlyOnScroll: true,
     handler: function() {
     return hit = true;
     }
     });
     return $se.scrollTop($f.offset().top - 1);
     });
     waits(standardWait);
     return runs(function() {
     $f.css('top', ($f.offset().top - 50) + 'px');
     $.waypoints('refresh');
     expect(hit).toBeFalsy();
     $f.css('top', $f.offset().top + 50 + 'px');
     $.waypoints('refresh');
     return expect(hit).toBeFalsy();
     });
     });
     return it('updates the offset', function() {
     runs(function() {
     $se.scrollTop($e.offset().top - 51);
     $e.css('top', ($e.offset().top - 50) + 'px');
     return $.waypoints('refresh');
     });
     waits(standardWait);
     runs(function() {
     expect(currentDirection).toBeFalsy();
     return $se.scrollTop($e.offset().top);
     });
     waits(standardWait);
     return runs(function() {
     return expect(currentDirection).toBeTruthy();
     });
     });
     });
     describe('jQuery#waypoints("viewportHeight")', function() {
     return it('returns window innerheight if it exists', function() {
     if (window.innerHeight) {
     return expect($.waypoints('viewportHeight')).toEqual(window.innerHeight);
     } else {
     return expect($.waypoints('viewportHeight')).toEqual($(window).height());
     }
     });
     });
     describe('jQuery#waypoints("disable")', function() {
     return it('disables all waypoints', function() {
     var count;
     count = 0;
     runs(function() {
     $e = $('.sameposition').waypoint(function() {
     return count++;
     });
     $.waypoints('disable');
     return $se.scrollTop($e.offset().top + 50);
     });
     waits(standardWait);
     return runs(function() {
     return expect(count).toEqual(0);
     });
     });
     });
     describe('jQuery#waypoints("enable")', function() {
     return it('enables all waypoints', function() {
     var count;
     count = 0;
     runs(function() {
     $e = $('.sameposition').waypoint(function() {
     return count++;
     });
     $.waypoints('disable');
     $.waypoints('enable');
     return $se.scrollTop($e.offset().top + 50);
     });
     waits(standardWait);
     return runs(function() {
     return expect(count).toEqual(2);
     });
     });
     });
     describe('jQuery#waypoints("destroy")', function() {
     return it('destroys all waypoints', function() {
     $e = $('.sameposition').waypoint({});
     $.waypoints('destroy');
     return expect($.waypoints().vertical.length).toEqual(0);
     });
     });
     describe('jQuery#waypoints("extendFn", methodName, function)', function() {
     return it('adds method to the waypoint namespace', function() {
     var currentArg;
     currentArg = null;
     $.waypoints('extendFn', 'myMethod', function(arg) {
     return currentArg = arg;
     });
     $('#same1').waypoint('myMethod', 'test');
     return expect(currentArg).toEqual('test');
     });
     });
     describe('jQuery#waypoints.settings', function() {
     var count, curID;
     count = curID = null;
     beforeEach(function() {
     count = 0;
     return $('.sameposition, #near1, #near2').waypoint(function() {
     count++;
     return curID = $(this).attr('id');
     });
     });
     it('throttles the scroll check', function() {
     runs(function() {
     $se.scrollTop($('#same1').offset().top);
     return expect(count).toEqual(0);
     });
     waits(standardWait);
     return runs(function() {
     return expect(count).toEqual(2);
     });
     });
     return it('throttles the resize event and calls refresh', function() {
     runs(function() {
     $('#same1').css('top', "-1000px");
     $(window).resize();
     return expect(count).toEqual(0);
     });
     waits(standardWait);
     return runs(function() {
     return expect(count).toEqual(1);
     });
     });
     });
     describe('non-window scroll context', function() {
     var $inner;
     $inner = null;
     beforeEach(function() {
     return $inner = $('#bottom');
     });
     it('triggers the waypoint within its context', function() {
     $e = $('#inner3').waypoint({
     context: '#bottom',
     handler: function() {
     return hit = true;
     }
     });
     runs(function() {
     return $inner.scrollTop(199);
     });
     waits(standardWait);
     runs(function() {
     expect(hit).toBeFalsy();
     return $inner.scrollTop(200);
     });
     waits(standardWait);
     return runs(function() {
     return expect(hit).toBeTruthy();
     });
     });
     it('respects % offsets within contexts', function() {
     $e = $('#inner3').waypoint({
     context: '#bottom',
     offset: '100%',
     handler: function() {
     return hit = true;
     }
     });
     runs(function() {
     return $inner.scrollTop(149);
     });
     waits(standardWait);
     runs(function() {
     expect(hit).toBeFalsy();
     return $inner.scrollTop(150);
     });
     waits(standardWait);
     return runs(function() {
     return expect(hit).toBeTruthy();
     });
     });
     it('respects function offsets within context', function() {
     $e = $('#inner3').waypoint({
     context: '#bottom',
     offset: function() {
     return $(this).height() / 2;
     },
     handler: function() {
     return hit = true;
     }
     });
     runs(function() {
     return $inner.scrollTop(149);
     });
     waits(standardWait);
     runs(function() {
     expect(hit).toBeFalsy();
     return $inner.scrollTop(150);
     });
     waits(standardWait);
     return runs(function() {
     return expect(hit).toBeTruthy();
     });
     });
     it('respects bottom-in-view alias', function() {
     $e = $('#inner3').waypoint({
     context: '#bottom',
     offset: 'bottom-in-view',
     handler: function() {
     return hit = true;
     }
     });
     runs(function() {
     return $inner.scrollTop(249);
     });
     waits(standardWait);
     runs(function() {
     expect(hit).toBeFalsy();
     return $inner.scrollTop(250);
     });
     waits(standardWait);
     return runs(function() {
     return expect(hit).toBeTruthy();
     });
     });
     return afterEach(function() {
     return $inner.scrollTop(0);
     });
     });
     describe('Waypoints added after load, Issue #28, 62, 63', function() {
     return it('triggers down on new but already reached waypoints', function() {
     runs(function() {
     $e = $('#same2');
     return $se.scrollTop($e.offset().top + 1);
     });
     waits(standardWait);
     runs(function() {
     return $e.waypoint(function(direction) {
     return hit = direction === 'down';
     });
     });
     return waitsFor((function() {
     return hit;
     }), '#same2 to trigger', 1000);
     });
     });
     describe('Multiple waypoints on the same element', function() {
     var hit2;
     hit2 = false;
     beforeEach(function() {
     hit2 = false;
     $e = $('#same1').waypoint({
     handler: function() {
     return hit = true;
     }
     });
     return $e.waypoint({
     handler: function() {
     return hit2 = true;
     },
     offset: -50
     });
     });
     it('triggers all handlers', function() {
     runs(function() {
     return $se.scrollTop($e.offset().top + 50);
     });
     waits(standardWait);
     return runs(function() {
     return expect(hit && hit2).toBeTruthy();
     });
     });
     it('uses only one element in $.waypoints() array', function() {
     return expect($.waypoints().vertical.length).toEqual(1);
     });
     return it('disables all waypoints on the element when #disabled called', function() {
     runs(function() {
     $e.waypoint('disable');
     return $se.scrollTop($e.offset().top + 50);
     });
     waits(standardWait);
     return runs(function() {
     return expect(hit || hit2).toBeFalsy();
     });
     });
     });
     describe('Horizontal waypoints', function() {
     var currentDirection;
     currentDirection = null;
     beforeEach(function() {
     currentDirection = null;
     return $e = $('#same1').waypoint({
     horizontal: true,
     handler: function(direction) {
     return currentDirection = direction;
     }
     });
     });
     return it('triggers right/left direction', function() {
     runs(function() {
     return $se.scrollLeft($e.offset().left);
     });
     waits(standardWait);
     runs(function() {
     expect(currentDirection).toEqual('right');
     return $se.scrollLeft($e.offset().left - 1);
     });
     waits(standardWait);
     return runs(function() {
     return expect(currentDirection).toEqual('left');
     });
     });
     });
     describe('Waypoints attached to window object, pull request 86', function() {
     var $win;
     $win = $(window);
     beforeEach(function() {
     return $e = $win.waypoint({
     offset: -$win.height(),
     handler: function() {
     return hit = true;
     }
     });
     });
     return it('triggers waypoint reached', function() {
     runs(function() {
     return $win.scrollTop($win.height() + 1);
     });
     waits(standardWait);
     return runs(function() {
     return expect(hit).toBeTruthy();
     });
     });
     });
     return afterEach(function() {
     $.waypoints('destroy');
     $se.scrollTop(0).scrollLeft(0);
     hit = false;
     return waits(standardWait);
     });*/
});
