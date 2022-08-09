export default {
  create: function (graph, node, index, branch) {
    const {x, y} = node.position();
    const bbox = node.getBBox();
    const space = index ? 128 : 108;
    const child = graph.createNode({
      x: x + 20,
      y: y + 122 * index + space,
      width: bbox.width - 40,
      zIndex:1,
      height: 122,
      data: {
        kind: 'when',
        nodeData: branch,
        properties: {}
      },
      attrs: {
        body: {
          strokeWidth: 0,
          // stroke: '#5F95FF',
          fill: '#F4F6F9',
        },
        text: {
          fontSize: 12,
          fill: '#262626',
        },
      },
    });
    node.addChild(child)
  }
}