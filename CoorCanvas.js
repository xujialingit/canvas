const LIST_TYPE = ["lineList", "pointList", "arcList", "TextList"]
class CoorCanvas {
  /**
   * @param {HTMLElemnt} c_node 
   * @param {Object} c_opts 
   */
  constructor(c_node, c_opts = null) {
    if (!c_node || !c_node instanceof HTMLElement) {
      throw new Error("请传入绘图舞台!");
    }
    if (!CoorCanvas.Util.notNullObject(c_opts)) {
      this.layoutOpts = {}
    } else {
      let opt = {
        bgColor: "#FFF",
        textColor: "#000",
        pointSzie: 3,
        bgGlobalAlpha: 1,
        eventMove: false,
        eventScale: false,
      };
      this.layoutOpts = Object.assign(opt, c_opts)
    }
    this.layout = c_node;
    this.width = c_node.clientWidth || 300;
    this.height = c_node.clientHeight || 200;
    this.moveOffset_x = 0;
    this.moveOffset_y = 0;
    this.zoom = 1;
    this.basePoint = [this.width / 2, this.height / 2];
    //元素集合
    this.lineList = [];
    this.pointList = [];
    this.arcList = [];
    this.TextList = [];
    this.mouseCoor = [0, 0];
    this.initCanvas();
  }

  /**
   * 初始化画布
   */
  initCanvas() {
    //初始化画布
    let canvasLayout = this.createCanvasElement(this.width, this.height);
    this.layout.appendChild(canvasLayout);
    this.canvas = canvasLayout;
    if (!this.context) {
      this.context = canvasLayout.getContext("2d");
    }
    this.reseteLayout();
    // this.basePoint = [this.width / 2, this.height / 2]

    this.drawnGrid();
    //绑定事件
    //拖动
    if (this.layoutOpts.eventMove) {
      canvasLayout.onmousedown = (args) => {
        var evt = args || event;
        var startX = evt.layerX;
        var startY = evt.layerY;
        document.onmousemove = ({ offsetX, offsetY }) => {
          this.moveOffset_x += (offsetX - startX) * 0.5;
          this.moveOffset_y += (offsetY - startY) * 0.5;
          startX = offsetX;
          startY = offsetY;
          this.repaint();
        }
        document.onmouseup = function () {
          document.onmousedown = null;
          document.onmousemove = null;
        };
        return false;
      }
    }
    //缩放
    if (this.layoutOpts.eventScale) {
      canvasLayout.addEventListener("mousewheel", (e) => {
        let wheelDelta = e.wheelDelta || -e.detail;
        let { layerX, layerY } = e;
        this.mouseCoor = [layerX, layerY];
        if (wheelDelta > 0) {
          this.zoom += 0.1;
          this.moveOffset_x -= 0.5;
          this.moveOffset_y -= 0.5;
        } else if (wheelDelta < 0 && this.zoom > 0.5) {
          this.moveOffset_y += 0.5;
          this.moveOffset_x += 0.5;
          this.zoom -= 0.1;
        }
        this.repaint();
      })
    }
  }

  /**
   * 创建canvas标签
   * @param {Number} width 
   * @param {Number} height 
   */
  createCanvasElement(width, height) {
    let canvasLayout = document.createElement("canvas");
    canvasLayout.width = width;
    canvasLayout.height = height;
    return canvasLayout;
  }

  // gride 网格
  drawnGrid(splitNum = 100, realNum = 100) {
    let rangeX = [0 - this.basePoint[0], this.width - this.basePoint[0]],
      rangeY = [0 - this.basePoint[1], this.height - this.basePoint[1]];
    let absSmallIt = ([a, b]) => {
      if ((a > 0 && b > 0) || (a < 0 && b < 0)) {
        a = Math.abs(a);
        b = Math.abs(b);
        // 同号
        return Number(((a < b ? a : b) / splitNum).toFixed(0));
      } else {
        // 异号
        return 0;
      }
    };
    let i_x = absSmallIt(rangeX);
    let i_y = absSmallIt(rangeY);
    // x,y = 0,0
    let opt = {
      // type: "dash",
      color: "rgba(0,0,0,0.12)"
    },
      textOpt = {
        size: 12,
        color: "rgba(0,0,0,0.4)"
      };

    // x
    if (this.basePoint[0] > rangeX[0] && this.basePoint[0] < rangeX[1]) {
      let b_t = new CoorCanvas.Text([this.basePoint[0], 0], `0`, { ...textOpt, textPos: "bottom" });
      let t_t = new CoorCanvas.Text([this.basePoint[0], this.height], `0`, { ...textOpt, textPos: "top" });
      this[b_t.drawnMethod](b_t);
      this[t_t.drawnMethod](t_t);
    }
    // y
    if (this.basePoint[1] > rangeY[0] && this.basePoint[1] < rangeY[1]) {
      let r_t = new CoorCanvas.Text([0, this.basePoint[1]], `0`, { ...textOpt, textPos: "right" });
      let l_t = new CoorCanvas.Text([this.width, this.basePoint[1]], `0`, { ...textOpt, textPos: "left" });
      this[r_t.drawnMethod](r_t);
      this[l_t.drawnMethod](l_t);
    }

    // x
    for (let i = i_x < 1 ? 1 : i_x - 1, tmp, realTmp, _x; ; i++) {
      tmp = i * splitNum;
      realTmp = realNum * i;
      // x -
      if (0 - tmp >= rangeX[0]) {
        _x = this.basePoint[0] - tmp;
        this.drawnLine(new CoorCanvas.Line([_x, 0], [_x, this.height], opt));
        this.drawnText(new CoorCanvas.Text([_x, 0], `${(0 - realTmp).toFixed(0)}`, { ...textOpt, textPos: "bottom" }));
        this.drawnText(new CoorCanvas.Text([_x, this.height], `${(0 - realTmp).toFixed(0)}`, {
          ...textOpt, textPos: "top"
        }));
      }
      // x +
      if (tmp <= rangeX[1]) {
        _x = this.basePoint[0] + tmp;
        this.drawnLine(new CoorCanvas.Line([_x, 0], [_x, this.height], opt));
        this.drawnText(new CoorCanvas.Text([_x, 0], `${realTmp.toFixed(0)}`, { ...textOpt, textPos: "bottom" }));
        this.drawnText(new CoorCanvas.Text([_x, this.height], `${realTmp.toFixed(0)}`, { ...textOpt, textPos: "top" }));
      }
      // 双向
      if (tmp > rangeX[1] && 0 - tmp < rangeX[0]) break;
    }
    // y
    for (let i = i_y < 1 ? 1 : i_y - 1, tmp, _y, realTmp; ; i++) {
      tmp = i * splitNum;
      realTmp = (realNum * i) / (this.showScale ? this.plotScale : 1);
      // y -
      if (0 - tmp >= rangeY[0]) {
        _y = this.basePoint[1] - tmp;
        this.drawnLine(new CoorCanvas.Line([0, _y], [this.width, _y], opt));
        this.drawnText(new CoorCanvas.Text([0, _y], `${realTmp.toFixed(0)}`, { ...textOpt, textPos: "rightBottom" }));
        this.drawnText(new CoorCanvas.Text([this.width, _y], `${realTmp.toFixed(0)}`, {
          ...textOpt, textPos: "leftBottom"
        }));
      }
      // y +
      if (tmp <= rangeY[1]) {
        _y = this.basePoint[1] + tmp;
        this.drawnLine(new CoorCanvas.Line([0, _y], [this.width, _y], opt));
        this.drawnText(new CoorCanvas.Text([0, _y], `${(0 - realTmp).toFixed(0)}`, { ...textOpt, textPos: "rightTop" }));
        this.drawnText(new CoorCanvas.Text([this.width, _y], `${(0 - realTmp).toFixed(0)}`, {
          ...textOpt,
          textPos: "leftTop"
        }));
      }
      // 双向
      if (tmp > rangeY[1] && 0 - tmp < rangeY[0]) break;
    }
  }


  //窗口尺寸变化
  onResize(cb = null) {
    if (cb && cb.toString() == "[object Function]") {
      cb.call(this);
    } else {
      this.canvas.width = this.width = this.layout.clientWidth;
      this.canvas.height = this.height = this.layout.clientHeight;
      this.repaint();
    }
  }

  /**
   * 加载json数据创建画图元素
   * @param {Array} data_json 
   */
  loadJSON(data_json) {
    if (!Array.isArray(data_json)) {
      throw new Error("json数据必须为数组!");
    }
    let ele;
    for (let i = 0, tmp; i < data_json.length; i++) {
      tmp = data_json[i];
      ele = this.elementFactory(tmp);
      this.add(ele);
    }
  }

  elementFactory(tmp) {
    let ele;
    switch (tmp.type) {
      case "line":
        ele = new CoorCanvas.Line(tmp.start_coor, tmp.end_coor, tmp.opts || null);
        break;
      case "point":
        ele = new CoorCanvas.Point(tmp.coors, tmp.opts || null);
        break;
      case "arc":
        ele = new CoorCanvas.Arc();
        break;
      case "text":
        ele = new CoorCanvas.Text(tmp.coors, tmp.text, tmp.opts || null);
        break;
      default:
        ele = null
        break;
    }
    return ele;
  }

  pushElement(tmp) {
    let listName;
    switch (tmp.type) {
      case "line":
        listName = "lineList";
        break;
      case "point":
        listName = "pointList";
        break;
      case "arc":
        listName = "arcList";
        break;
      case "text":
        listName = "TextList";
        break;
      default:
        break;
    }
    if (listName) {
      this[listName].push(tmp)
    }
  }

  /**
   * 传入画图对象在画板上画出
   * @param {Object} tmp 
   */
  add(tmp) {
    if (!tmp.type) {
      throw new Error("类型错误,绘图对象的类型没有定义!")
    }
    let drawnMethod = tmp.drawnMethod || "";
    if (drawnMethod) {
      this.pushElement(tmp);
      this[drawnMethod](tmp);
    }
  }

  repaint() {
    this.reseteLayout();
    this.drawnGrid();
    let list = this.getAllList();
    for (let i = 0, ele, func; i < list.length; i++) {
      ele = list[i];
      func = ele.drawnMethod;
      this[func](ele)
    }
  }

  //计算坐标
  caclCoor(coor) {
    let { basePoint, moveOffset_x, moveOffset_y } = this;
    let arr = [(basePoint[0] + moveOffset_x + coor[0]) * this.zoom, (basePoint[1] + moveOffset_y + coor[1] * this.zoom)];
    return arr;
  }

  getAllList() {
    let list = [];
    LIST_TYPE.forEach(item => {
      if (this[item].length > 0) list.push(this[item])
    })
    return list.flat(Infinity);
  }

  reseteLayout() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.fillStyle = this.layoutOpts.bgColor;
    this.context.globalAlpha = this.layoutOpts.bgGlobalAlpha || 1;
    this.context.fillRect(0, 0, this.width, this.height);
    this.context.restore(); // 重置画笔
    this.context.save();
  }

  drawnPoint(ele) {
    this.context.save();
    this.context.beginPath();
    let coor = this.caclCoor([ele.x, ele.y]);
    this.context.arc(...coor, ele.opts.size, 0, 2 * Math.PI);
    if (ele.opts.storkt) {
      this.context.strokeStyle = ele.opts.color;
      this.context.stroke();
    } else {
      this.context.fillStyle = ele.opts.color;
      this.context.fill();
    }
    this.context.restore();
  }

  drawnLine(ele) {
    let { start_coor, end_coor, opts } = ele;
    this.context.save();
    this.context.beginPath();
    // 虚线
    if ("dash" === opts.type) {
      this.context.setLineDash([opts.dash_w, opts.dash_s]);
      this.context.lineDashOffset = 0;
    }
    this.context.lineWidth = opts.size;
    start_coor = this.caclCoor(start_coor);
    end_coor = this.caclCoor(end_coor);
    this.context.moveTo(...start_coor);
    this.context.lineTo(...end_coor);
    this.context.strokeStyle = opts.color;
    this.context.stroke();
    this.context.restore();
  }

  drawnArc(ele) {
    let data = CoorCanvas.Util.cloneDeep(ele);
    let { center_coor, radius, start_coor, end_coor, opts } = data;
    let x_sta = start_coor[0] - center_coor[0],
      y_sta = start_coor[1] - center_coor[1];
    let x_end = end_coor[0] - center_coor[0],
      y_end = end_coor[1] - center_coor[1];
    let tan_sta = Math.abs(y_sta / x_sta);
    let tan_end = Math.abs(y_end / x_end);
    let sta = Math.atan(tan_sta);
    let end = Math.atan(tan_end);
    if (tan_sta == Infinity && y_sta < 0) {
      sta = 0 - sta;
    }
    if (tan_end == Infinity && y_end < 0) {
      end = 0 - end;
    }
    // 判断点相对于中心点的方位
    if (x_sta > 0 && y_sta < 0) {
      // 1
      sta = 2 * Math.PI - sta;
    } else if (x_sta < 0) {
      if (y_sta < 0) {
        // 2
        sta = Math.PI + sta;
      } else {
        // 3
        sta = Math.PI - sta;
      }
    }
    if (x_end > 0 && y_end < 0) {
      // 1
      end = 0 - end;
    } else if (x_end < 0) {
      if (y_end < 0) {
        // 2
        end = Math.PI + end;
      } else {
        // 3
        end = Math.PI - end;
      }
    }
    // 绘制弧线
    this.context.save();
    this.context.beginPath();
    sta = CoorCanvas.Util.vectorStanderdization(sta);
    end = CoorCanvas.Util.vectorStanderdization(end);
    center_coor = this.caclCoor(center_coor);

    this.context.arc(
      center_coor[0],
      center_coor[1],
      radius * this.zoom,
      sta,
      (sta === end ? 2 * Math.PI : 0) + end,
      sta === end ? false : opts.counterclockwise
    );
    this.context.lineWidth = opts.size;
    this.context.strokeStyle = opts.color;
    this.context.stroke();
    this.context.restore();
  }

  drawnText(ele) {
    let data = CoorCanvas.Util.cloneDeep(ele);
    let { coor, text, opts } = data;
    // 计算角度
    opts.rotate =
      opts.rotate ||
      Math.atan2(
        opts.rotateCenter[1] - coor[1],
        opts.rotateCenter[0] - coor[0]
      ) *
      (180 / Math.PI);
    // 字体旋转过大后需要字体转向
    if (opts.rotate > 90 || -90 > opts.rotate) {
      opts.rotate += 180;
      if (/left/gi.test(opts.textPos)) {
        opts.textPos = opts.textPos.replace(/left/gi, "right");
      } else {
        opts.textPos = opts.textPos.replace(/right/gi, "left");
      }
    }
    // 字符串像素点
    // RegExp = /[^\x00-\xff]/g
    // RegExp = /[\u4E00-\u9FA5]/g
    let strWidth =
      (opts.size / 2) * (text.replace(/[^\x00-\xff]/g, "xx").length || 0); // eslint-disable-line no-control-regex
    let defSet = {
      x: 8,
      y: 3
    };
    // left - fight
    if (/left/gi.test(opts.textPos)) {
      opts.offset[0] = opts.offset[0] - strWidth - defSet.x;
    } else if (/right/gi.test(opts.textPos)) {
      opts.offset[0] = opts.offset[0] + defSet.x;
    } else {
      opts.offset[0] = opts.offset[0] - strWidth / 2;
    }

    // top - bottom
    if (/top/gi.test(opts.textPos)) {
      opts.baseLine = "bottom";
      opts.offset[1] = opts.offset[1] - defSet.y;
    } else if (/bottom/gi.test(opts.textPos)) {
      opts.baseLine = "top";
      opts.offset[1] = opts.offset[1] + defSet.y;
    } else {
      opts.baseLine = "middle";
    }
    this.context.save();
    this.context.beginPath();

    this.context.font = `${opts.size}px serif`;
    this.context.textBaseline = opts.baseLine;
    this.context.fillStyle = opts.color;
    // 需要旋转
    if (opts.rotate) {
      this.context.translate(coor[0], coor[1]);
      this.context.rotate(opts.rotate * (Math.PI / 180));
      this.context.translate(-coor[0], -coor[1]);
    }
    coor = this.caclCoor(coor);

    this.context.fillText(
      text,
      coor[0] + opts.offset[0],
      coor[1] + opts.offset[1]
    );
    this.context.restore();
  }
}

CoorCanvas.Util = class {
  static notNullObject(obj) {
    return String(obj) == "[object Object]" && Object.keys(obj).length > 0;
  }
  static cloneDeep(obj) {
    let json_str = JSON.stringify(obj);
    return JSON.parse(json_str);
  }
  //圆标准化
  static vectorStanderdization(old) {
    // 如果方位角小于零
    while (old < 0) {
      // 方位角自加2PI
      old += 2.0 * Math.PI;
    }
    // 如果方位角大于2PI
    while (old > 2.0 * Math.PI) {
      // 方位角自减2PI
      old -= 2.0 * Math.PI;
    }
    return old;
  }

  static scaleCoor(coor, scale = 1) {
    if (typeof coor == "number") {
      return coor * scale;
    }
    return [coor[0] * scale, coor[1] * scale];
  }
}

CoorCanvas.Point = class {
  constructor(coors, opts = null) {
    this.x = coors[0];
    this.y = coors[1];
    this.opts = {
      size: 3,
      color: "#FFF",
      storkt: false
    };
    if (CoorCanvas.Util.notNullObject(opts)) {
      this.opts = Object.assign(this.opts, opts);
    }
  }

  *getCoor() {
    yield [this.x, this.y];
    return;
  }
}
CoorCanvas.Point.prototype.type = "point";
CoorCanvas.Point.prototype.drawnMethod = "drawnPoint";

//Line对象
CoorCanvas.Line = class {
  constructor(start_coor, end_coor, opts = null) {
    this.start_coor = start_coor;
    this.end_coor = end_coor;
    this.opts = {
      type: "line", // 默认直线，虚线 dash
      color: "#000",
      size: 1,
      dash_w: 3,
      dash_s: 3
    }
    if (CoorCanvas.Util.notNullObject(opts)) {
      this.opts = Object.assign(this.opts, opts)
    }
  };

  *getCoor() {
    yield this.start_coor;
    yield this.end_coor;
    return;
  }
}
CoorCanvas.Line.prototype.type = "line";
CoorCanvas.Line.prototype.drawnMethod = "drawnLine";

CoorCanvas.Text = class {
  constructor(coor, text, opts = null) {
    this.coor = coor;
    this.text = text;
    this.opts = {
      color: "#000",
      size: 18,
      textOpt: "center",
      baseLine: "alphabetic",
      offset: [0, 0],
      rotateCenter: coor,
      rotate: 0
    }
    if (CoorCanvas.Util.notNullObject(opts)) {
      this.opts = Object.assign(this.opts, opts);
    }
  };

  *getCoor() {
    yield this.coor;
    return;
  }
}
CoorCanvas.Text.prototype.type = "text";
CoorCanvas.Text.prototype.drawnMethod = "drawnText";

CoorCanvas.Arc = class {
  constructor(center_coor, radius, start_coor, end_coor, opts = null) {
    this.center_coor = center_coor;
    this.radius = radius;
    this.start_coor = start_coor;
    this.end_coor = end_coor;
    let opt = {
      type: "line",
      color: "#000",
      size: 1,
      counterclockwise: false // false = 顺时针，true = 逆时针。
    }
    if (opts && CoorCanvas.Util.notNullObject(opts)) {
      this.opts = Object.assign(opt, opts);
    }
  }

  *getCoor() {
    yield this.center_coor;
    yield this.radius;
    yield this.start_coor;
    yield this.end_coor;
    return;
  }
}
CoorCanvas.Arc.prototype.type = "arc";
CoorCanvas.Arc.prototype.drawnMethod = "drawnArc";