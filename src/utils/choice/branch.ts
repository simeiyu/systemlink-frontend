
export default {
  create: function (graph, node, branch) {
    const { processorType, name } = branch;
    const {x, y} = node.position();
    const bbox = node.getBBox();
    const space = 20;
    const top = 68;
    const height = 122;
    const children = node.getChildren();  
    const index = children ? children.length : 0;
    // 距离父节点的相对位置
    const _y = top + height * index + space * (index + 1);
    const footerHeight = 48;
    if (_y + height > bbox.height - footerHeight) {
      node.resize(bbox.width, _y + height + footerHeight)
    }
    let py = y + _y;
    if (processorType === 'otherwise' && index) {
      children.forEach(item => {
        const pos = item.position();
        item.position(pos.x, pos.y + height + space);
      })
      py = y + top + space;
    }
    const child = graph.createNode({
      x: x + space,
      y: py,
      width: bbox.width - 40,
      zIndex: node.getZIndex() + 1,
      height: height,
      data: {
        kind: processorType,
        name,
      },
      attrs: {
        body: {
          strokeWidth: 0,
          // stroke: '#5F95FF',
          fill: processorType == 'when' ? '#ecf5ff' : '#F4F6F9',
        },
        text: {
          fontSize: 12,
          fill: '#262626',
        },
      },
    });
    node.addChild(child);
    return child;
  }
}