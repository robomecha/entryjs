/**
 * Resize handle on PIXI.js
 */


'use strict';


import { PIXIDragHelper } from '../../PIXIDragHelper';
import { PIXIHandleEdge } from './PIXIHandleEdge';

export var PIXIHandle = function(canvas, baseAsset) {
    if (typeof PIXI != 'object') {
        throw 'PIXI is not founded';
    }

    this.canvas = canvas;
    this._baseAsset = baseAsset;
    this.color = '#c1c7cd';
    //this.color = "#6BD5FF";
    this.arrowColor = '#E79040';
    this.centerColor = '#93440F';
    this.rotateKnobColor = '#6B6B6B';

    this.x = 0;
    this.y = 0;
    this.rotation = 0;
    this.direction = 0;
    this.width = 100;
    this.height = 100;
    this.flipX = false;
    this.flipY = false;
    this.visible = false;
    this.draggable = true;

    this.centerEditable = true;
    this.rotationEditable = true;
    this.directionEditable = true;
    this.resizeEnable = true;

    this.onChangeFunction = null;
    this.callerObject = null;

    this.createHandle();
    this.render();
    this.selectedObject = null;

};


(function(p) {

    /**
     * #ff00ff --> 0xff00ff
     * @param strColor
     */
    function colorToUint(strColor) {
        return Number(strColor.replace("#", "0x"));
    }


    p.setChangeListener = function(object, func) {
        this.onChangeFunction = func;
        this.callerObject = object;
        return this;
    };

    /**
     * for undo and redo
     */
    p.setEditStartListener = function(object, func) {
        this.onEditStartFunction = func;
        this.editStartCallerObject = object;
        return this;
    };

    p.setEditEndListener = function(object, func) {
        this.onEditEndFunction = func;
        this.editEndCallerObject = object;
        return this;
    };

    p.toggleCenter = function(isEnable) {
        this.centerEditable = isEnable;
        this.centerPoint.visible = isEnable;
    };

    p.toggleRotation = function(isEnable) {
        this.rotationEditable = isEnable;
        this.rotateKnob.visible = isEnable;
    };

    p.toggleDirection = function(isEnable) {
        this.directionEditable = isEnable;
        this.directionArrow.visible = isEnable;
    };

    p.toggleResize = function(isEnable) {
        this.resizeEditable = isEnable;
        for (var i = 0; i < 8; i++) {
            this.knobs[i].visible = isEnable;
        }
    };

    p.toggleFont = function(isEnable) {
        this.fontEditable = isEnable;
        this.fontKnob.visible = isEnable;
    };

    p.setX = function(xPos) {
        this.x = xPos;
        this.container.x = xPos;
        this.background.x = xPos;
    };

    p.setY = function(yPos) {
        this.y = yPos;
        this.container.y = yPos;
        this.background.y = yPos;
    };

    p.setWidth = function(width) {
        this.width = width;
        // this.background.scaleX = width / 100;
        this.background.scale.x = width / 100;
    };

    p.setHeight = function(height) {
        this.height = height;
        // this.background.scaleY = height / 100;
        this.background.scale.y = height / 100;
    };

    p.setRegX = function(regX) {
        this.regX = regX;
        this.centerPoint.x = regX;
    };

    p.setRegY = function(regY) {
        this.regY = regY;
        this.centerPoint.y = regY;
    };

    p.setRotation = function(rotation) {
        rotation = (rotation + 360) % 360;
        this.rotation = rotation;
        // this.container.rotation = rotation;
        // this.background.rotation = rotation;
        var rad = rotation * Math.PI / 180;
        this.container.rotation = rad;
        this.background.rotation = rad;
        this.updateKnobCursor();
    };

    p.setDirection = function(direction) {
        direction = (direction + 360) % 360;
        this.direction = direction;
        // this.directionArrow.rotation = direction;
        this.directionArrow.rotation = direction * Math.PI / 180;
    };

    p.setVisible = function(visible) {
        this.visible = visible;
        this.container.visible = visible;
        this.background.visible = visible;
    };

    p.setFont = function(fontSize) {
        this.font = fontSize;
        this.fontKnob.y = fontSize - this.height / 2;
    };

    p.createHandle = function() {
        var handle = this;
        var BASE_ASSET = this._baseAsset;
        var container = new PIXI.Container();
        // var container = new createjs.Container();

        //border
        var border = new PIXI.Graphics();
        container.addChild(border);
        this.border = border;

        //edge
        var edge = new PIXIHandleEdge(BASE_ASSET);
        edge.interactive = true;
        edge.cursor = 'move';
        edge.on(PIXIDragHelper.DOWN, function(e) {
            PIXIDragHelper.handleDrag(edge);
            var offset = handle.getEventCoordinate(e);
            offset.x -= handle.x;
            offset.y -= handle.y;
            this.offset = offset;
            handle.dispatchEditStartEvent();
        });
        edge.on(PIXIDragHelper.MOVE, function(e) {
            if (handle.getDraggable()) {
                var pos = handle.getEventCoordinate(e);
                pos.x -= this.offset.x;
                pos.y -= this.offset.y;
                handle.setX(pos.x);
                handle.setY(pos.y);
                handle.dispatchOnChangeEvent();
            }
        });
        edge.on(PIXIDragHelper.UP, function(e) {
            handle.dispatchEditEndEvent();
        });
        container.addChild(edge);
        this.edge = edge;

        //rotate knob
        var rotateKnob = BASE_ASSET.newSprite("rotateKnob");
        rotateKnob.anchor.set(0.5, 1);
        rotateKnob.interactive = true;
        rotateKnob.cursor = 'crosshair';
        rotateKnob.on(PIXIDragHelper.DOWN, function(e) {
            PIXIDragHelper.handleDrag(rotateKnob);
            handle.dispatchEditStartEvent();
        });
        rotateKnob.on(PIXIDragHelper.MOVE, function(e) {
            var pos = handle.getEventCoordinate(e);
            pos.x -= handle.x;
            pos.y -= handle.y;
            var rotation = -Math.atan2(pos.x, pos.y) / Math.PI * 180 - 180;
            handle.setRotation(rotation);
            handle.dispatchOnChangeEvent();
        });
        rotateKnob.on(PIXIDragHelper.UP, function(e) {
            handle.dispatchEditEndEvent();
        });
        container.addChild(rotateKnob);
        container.setChildIndex(rotateKnob, 1);
        this.rotateKnob = rotateKnob;

        var directionArrow = new PIXI.Graphics();
        directionArrow.interactive = true;
        directionArrow
        // .drawCircle(0, 0, this.DHANDLE_RADIUS) //박봉배: 이건 안쓰는거 같은데요?
            .beginFill(colorToUint(this.arrowColor))
            .moveTo(0, -42)
            .lineTo(9, -30)
            .lineTo(-9, -30)
            .closePath()
            .drawRect(-2, -32, 4, 32);



        // directionArrow
        //     .ss(4, 1, 1)
        //     .s(this.arrowColor)
        //     .f(this.arrowColor)
        //     .dc(0, 0, this.DHANDLE_RADIUS)
        //     .mt(0, 0)
        //     .lt(0, -40)
        //     .lt(7, -32)
        //     .lt(-7, -32)
        //     .lt(0, -40)
        //     .es();

        // directionArrow.on('mousedown', function(e) {
        directionArrow.on(PIXIDragHelper.DOWN, function(e) {
            PIXIDragHelper.handleDrag(directionArrow);
            handle.dispatchEditStartEvent();
        });
        directionArrow.on(PIXIDragHelper.MOVE, function(e) {
            var pos = handle.getLocalCoordinate(handle.getEventCoordinate(e));
            var rotation = -Math.atan2(pos.x, pos.y) / Math.PI * 180 - 180;
            handle.setDirection(rotation);
            handle.dispatchOnChangeEvent();
        });
        directionArrow.on(PIXIDragHelper.UP, function(e) {
            handle.dispatchEditEndEvent();
        });
        container.addChild(directionArrow);
        container.setChildIndex(directionArrow, 0);
        this.directionArrow = directionArrow;

        // center
        var centerPoint = new PIXI.Graphics();
        centerPoint.interactive = true;
        centerPoint
            .beginFill(colorToUint(this.centerColor))
            .lineStyle(1, colorToUint(this.centerColor))
            .drawCircle(0, 0, 5, 5);

        // centerPoint
        //     .beginFill(this.centerColor)
        //     .ss(1, 2, 0)
        //     .s(this.centerColor)
        //     .dc(0, 0, 5, 5);

        centerPoint.on(PIXIDragHelper.DOWN, function(e) {
            PIXIDragHelper.handleDrag(centerPoint);
            handle.dispatchEditStartEvent();
        });
        centerPoint.on(PIXIDragHelper.MOVE, function(e) {
            var pos = handle.getEventCoordinate(e);
            pos = handle.getLocalCoordinate(pos);
            handle.setRegX(pos.x);
            handle.setRegY(pos.y);
            handle.dispatchOnChangeEvent();
        });
        centerPoint.on(PIXIDragHelper.UP, function(e) {
            handle.dispatchEditEndEvent();
        });
        container.addChild(centerPoint);
        this.centerPoint = centerPoint;

        //resize knobs
        this.knobs = [];
        for (var i = 0; i < 8; i++) {
            var knob = BASE_ASSET.newSprite("knob");
            knob.pivot.set(4, 4);
            knob.interactive = true;
            knob.knobIndex = i;
            knob.on(PIXIDragHelper.DOWN, function(e) {
                var targetKnob = e.currentTarget;
                PIXIDragHelper.handleDrag(targetKnob);
                var otherKnobIndex =
                    this.knobIndex + 4 > 7
                        ? this.knobIndex + 4 - 8
                        : this.knobIndex + 4;
                var otherKnob = handle.knobs[otherKnobIndex];
                var otherKnobPos = handle.getGlobalCoordinate(otherKnob);
                this.otherKnobPos = otherKnobPos;
                handle.dispatchEditStartEvent();
            });
            knob.on(PIXIDragHelper.MOVE, function(e) {
                var pos = handle.getEventCoordinate(e);
                if (handle.checkCenterPointState(handle.regX, handle.regY)) {
                    handle.setRegX(0);
                    handle.setRegY(0);
                    handle.dispatchOnChangeEvent();
                }
                handle.adjust(this.knobIndex, this.otherKnobPos, pos);
            });
            knob.on(PIXIDragHelper.UP, function(e) {
                handle.dispatchEditEndEvent();
            });
            container.addChild(knob);
            this.knobs.push(knob);
        }

        //TODO 봉배님 백그라운드가 안보임요.
        var background = new PIXI.Graphics();
        background.interactive = true;
        background
            .lineStyle(0)
            // .beginFill(0xfefefe, 1)
            .beginFill(0xff0000, 1)
            .drawRect(-50, -50, 100, 100);

        // background
        //     .ss(1, 2, 0)
        //     .s('rgba(254,254,254,0.01)')
        //     .beginFill('rgba(254,254,254,1)')
        //     .dr(-50, -50, 100, 100);

        background.on(PIXIDragHelper.DOWN, function(e) {
            PIXIDragHelper.handleDrag(background);
            var offset = handle.getEventCoordinate(e);
            offset.x -= handle.x;
            offset.y -= handle.y;
            this.offset = offset;
            handle.dispatchEditStartEvent();
        });
        background.on(PIXIDragHelper.MOVE, function(e) {
            if (handle.getDraggable()) {
                var pos = handle.getEventCoordinate(e);
                pos.x -= this.offset.x;
                pos.y -= this.offset.y;
                handle.setX(pos.x);
                handle.setY(pos.y);
                handle.dispatchOnChangeEvent();
            }
        });
        background.on(PIXIDragHelper.UP, function(e) {
            handle.dispatchEditEndEvent();
        });
        this.canvas.addChildAt(background, 0);
        this.background = background;

        this.container = container;
        this.canvas.addChild(this.container);
    };

    p.checkCenterPointState = function(x, y) {
        var standard = 718;
        var res = Math.sqrt(x * x + y * y);
        if (res > standard && Entry.engine.isState('stop')) {
            Entry.toast.warning(
                '이런! 조심하세요!',
                '오브젝트의 중심이 이미지에서 크게 벗어나서 원위치로 되돌렸습니다.'
            );
            return true;
        }
        return false;
    };

    p.render = function() {
        this.renderBorder();
        this.renderEdge();
        this.renderRotateKnob();
        this.renderKnobs();
    };

    p.renderEdge = function() {
        var width = this.width;
        var height = this.height;

        this.edge.renderEdge(this.width, this.height);

        return;

        // this.edge.graphics
        //     .clear()
        //     .ss(10, 2, 0)
        //     .s('rgba(254,254,254,0.01)')
        //     .lt(-width / 2, -height / 2)
        //     .lt(0, -height / 2)
        //     .lt(0, -height / 2)
        //     .lt(+width / 2, -height / 2)
        //     .lt(+width / 2, +height / 2)
        //     .lt(-width / 2, +height / 2)
        //     .cp();

        var hw = width / 2;
        var hh = height / 2;
        //pixi line은 interaction 이 안됨. 그래서 rect 로 draw함.
        var THICK = 10;
        var H_THICK = THICK/2;
        this.edge
            .clear()
            .lineStyle(0)
            .beginFill(0xfefefe, 0.01)
            .drawRect(-hw - H_THICK, -hh - H_THICK, width + THICK, THICK)//top
            .drawRect(-hw - H_THICK, +hh - H_THICK, width + THICK, THICK)//bottom
            .drawRect(-hw - H_THICK, -hh - H_THICK, THICK, height + THICK)//left
            .drawRect(+hw - H_THICK, -hh - H_THICK, THICK, height + THICK);//right
    };

    p.renderRotateKnob = function() {
        this.rotateKnob.y = -this.height / 2;
    };

    p.renderBorder = function() {
        //2018.09.19 박준배. texture 로 변경하면서 border가 사라짐. 함수가 public naming 이라서 삭제를 못하겠음.
    };

    p.renderKnobs = function() {
        var width = this.width/2;
        var height = this.height/2;
        this.knobs.forEach(function(knob, i) {
            knob.x = Math.round(Math.sin(i / 4 * Math.PI)) * width;
            knob.y = Math.round(Math.cos(i / 4 * Math.PI)) * height;
        });
    };

    p.getEventCoordinate = function(e) {
        var g = e.data.global;
        return {
            x: g.x * 0.75 - 240,
            y: g.y * 0.75 - 135,
        };
    };

    p.getGlobalCoordinate = function(childObject) {
        var rotation = -this.container.rotation;
        var cos = Math.cos(rotation);
        var sin = Math.sin(rotation);
        return {
            x:
            this.x +
            childObject.x * cos +
            childObject.y * sin,
            y:
            this.y +
            childObject.y * cos -
            childObject.x * sin,
        };
    };

    p.getLocalCoordinate = function(pos) {
        var container = this.container;
        // var rotation = this.container.rotation * Math.PI / 180;
        var rotation = this.container.rotation;
        var cos = Math.cos(rotation);
        var sin = Math.sin(rotation);
        pos.x -= this.x;
        pos.y -= this.y;
        return {
            x: pos.x * cos + pos.y * sin,
            y: pos.y * cos - pos.x * sin,
        };
    };

    p.adjust = function(knobIndex, otherKnobPos, pos) {
        var newPoint = this.calcPos(
            { x: this.x, y: this.y },
            otherKnobPos,
            pos
        );
        var newCenter = {
            x: (otherKnobPos.x + newPoint.x) / 2,
            y: (otherKnobPos.y + newPoint.y) / 2,
        };
        var newLength = Math.sqrt(
            Math.pow(newPoint.x - otherKnobPos.x, 2) +
            Math.pow(newPoint.y - otherKnobPos.y, 2)
        );
        if (knobIndex % 4 == 0) {
            var ratio = newLength / this.height;
            this.height = newLength;
            this.setRegY(this.regY * ratio);
        } else if (knobIndex % 4 == 2) {
            var ratio = newLength / this.width;
            this.width = newLength;
            this.setRegX(this.regX * ratio);
        } else {
            var oldLength =
                2 *
                Math.sqrt(
                    Math.pow(this.x - otherKnobPos.x, 2) +
                    Math.pow(this.y - otherKnobPos.y, 2)
                );
            var newWidth = this.width * newLength / oldLength;
            var ratio = newWidth / this.width;
            this.setWidth(newWidth);
            this.setRegX(this.regX * ratio);
            var newHeight = this.height * newLength / oldLength;
            ratio = newHeight / this.height;
            this.setHeight(this.height * newLength / oldLength);
            this.setRegY(this.regY * ratio);
        }
        this.setX(newCenter.x);
        this.setY(newCenter.y);

        this.render();
        this.dispatchOnChangeEvent();
    };

    p.updateKnobCursor = function() {
        var rotation = this.rotation;
        var cursorList = [
            'ns-resize',
            'nwse-resize',
            'ew-resize',
            'nesw-resize',
        ];
        var iter = Math.round(rotation / 45);
        for (var i = 0; i < iter; i++) {
            cursorList.unshift(cursorList.pop());
        }
        for (var i = 0; i < 8; i++) {
            this.knobs[i].cursor = cursorList[i % 4];
        }
    };

    p.calcPos = function(pos1, pos2, targetPos) {
        if (pos1.x == pos2.x) {
            return {
                x: pos1.x,
                y: targetPos.y,
            };
        } else if (pos1.y == pos2.y) {
            return {
                x: targetPos.x,
                y: pos1.y,
            };
        } else {
            var a = pos1.y - pos2.y;
            var b = pos2.x - pos1.x;
            var c = pos1.x * pos2.y - pos2.x * pos1.y;
            var k = -(a * targetPos.x + b * targetPos.y + c) / (a * a + b * b);
            return {
                x: targetPos.x + a * k,
                y: targetPos.y + b * k,
            };
        }
    };

    p.dispatchOnChangeEvent = function() {
        if (this.onChangeFunction)
            this.onChangeFunction.call(this.callerObject, this);
    };

    p.dispatchEditStartEvent = function() {
        if (this.onEditStartFunction)
            this.onEditStartFunction.call(this.editStartCallerObject, this);
    };

    p.dispatchEditEndEvent = function() {
        if (this.onEditEndFunction)
            this.onEditEndFunction.call(this.editEndCallerObject, this);
    };

    p.setDraggable = function(bool) {
        this.draggable = bool;
    };

    p.getDraggable = function() {
        return this.draggable;
    };

})(PIXIHandle.prototype);
